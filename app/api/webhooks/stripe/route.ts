export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { StripeService } from '@/lib/services/stripe.service'
import { EmailService } from '@/lib/services/email.service'
import { NotificationService } from '@/lib/services/notification.service'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = StripeService.constructWebhookEvent(Buffer.from(body), sig)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      }
      default:
        break
    }
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, error)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata
  if (!metadata?.userId || !metadata?.planSlug) {
    console.error('[Stripe Webhook] Missing metadata in checkout session')
    return
  }

  const { userId, planSlug, billing, paymentLogId } = metadata

  // Idempotency: check if already processed
  if (paymentLogId) {
    const existing = await prisma.paymentLog.findUnique({ where: { id: paymentLogId } })
    if (existing && existing.status === 'paid') return
  }

  const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } })
  if (!plan) {
    console.error('[Stripe Webhook] Plan not found:', planSlug)
    return
  }

  const amount = billing === 'monthly'
    ? (plan.monthlyAmount ?? plan.amount)
    : (plan.yearlyAmount ?? plan.amount)

  const now = new Date()
  const endDate = new Date(now)
  if (billing === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1)
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1)
  }

  await prisma.$transaction(async (tx) => {
    // Update user status
    await tx.user.update({
      where: { id: userId },
      data: { status: 'active' },
    })

    // Create subscription
    await tx.subscription.create({
      data: {
        userId,
        planId: plan.id,
        planName: plan.name,
        status: 'active',
        startDate: now,
        endDate,
        paymentMethod: 'stripe',
        paymentReference: session.subscription as string || session.id,
        amount,
        currency: plan.currency,
      },
    })

    // Update payment log
    if (paymentLogId) {
      await tx.paymentLog.update({
        where: { id: paymentLogId },
        data: {
          status: 'paid',
          paidAt: now,
          subscriptionId: null,
          gatewayRef: session.payment_intent as string || session.id,
        },
      })
    } else {
      await tx.paymentLog.create({
        data: {
          userId,
          planSlug,
          amount,
          currency: plan.currency,
          status: 'paid',
          type: 'subscription',
          gateway: 'stripe',
          gatewayRef: session.payment_intent as string || session.id,
          description: `${plan.name} Plan (${billing})`,
          paidAt: now,
        },
      })
    }

    // Activity log
    await tx.activityLog.create({
      data: {
        action: 'clients.register',
        entityType: 'user',
        entityId: userId,
        description: `New client registered: ${plan.name} Plan`,
      },
    })

    await tx.activityLog.create({
      data: {
        action: 'subscriptions.activate',
        entityType: 'subscription',
        entityId: userId,
        description: `Subscription activated: ${plan.name} (${billing})`,
      },
    })

    await tx.activityLog.create({
      data: {
        action: 'payments.success',
        entityType: 'payment',
        entityId: paymentLogId || '',
        description: `Payment successful: ${plan.currency} ${amount.toLocaleString()} via Stripe`,
      },
    })
  })

  // Send emails (non-blocking)
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user) {
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000'

    EmailService.send({
      to: user.email,
      toName: user.name,
      templateId: 'welcome',
      data: {
        name: user.name,
        email: user.email,
        loginUrl: `${siteUrl}/admin/login`,
      },
    }).catch(() => {})

    EmailService.send({
      to: user.email,
      toName: user.name,
      templateId: 'subscription_activated',
      data: {
        name: user.name,
        planName: plan.name,
        expiryDate: endDate.toLocaleDateString(),
        loginUrl: `${siteUrl}/admin/login`,
      },
    }).catch(() => {})

    EmailService.send({
      to: user.email,
      toName: user.name,
      templateId: 'payment_receipt',
      data: {
        name: user.name,
        planName: plan.name,
        amount: `${plan.currency} ${amount.toLocaleString()}`,
        billingCycle: billing,
        transactionId: session.id,
        paymentDate: now.toLocaleDateString(),
        nextBillingDate: endDate.toLocaleDateString(),
      },
    }).catch(() => {})
  }

  console.log(`[Stripe Webhook] Payment processed for user ${userId}, plan ${planSlug}`)

  // System-wide notification for admins
  await NotificationService.create({
    title: 'New Payment Received',
    message: `New ${plan.name} subscription payment of ${plan.currency} ${amount.toLocaleString()} via Stripe from ${user?.email || userId}.`,
    type: 'success',
    actionUrl: `/admin/payments`,
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const metadata = subscription.metadata
  if (!metadata?.userId) return

  await prisma.subscription.updateMany({
    where: {
      userId: metadata.userId,
      paymentReference: subscription.id,
      status: 'active',
    },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
    },
  })

  const user = await prisma.user.findUnique({ where: { id: metadata.userId } })
  if (user) {
    const planName = metadata.planSlug || 'Unknown'
    EmailService.send({
      to: user.email,
      toName: user.name,
      templateId: 'subscription_cancelled',
      data: { name: user.name, planName },
    }).catch(() => {})

    await NotificationService.create({
      title: 'Subscription Cancelled',
      message: `Subscription cancelled for "${user.name}" (${user.email}) — Plan: ${planName}.`,
      type: 'warning',
      actionUrl: `/admin/clients/${user.id}`,
    })
  }
}
