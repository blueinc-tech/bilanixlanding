import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PaystackService } from '@/lib/services/paystack.service'
import { EmailService } from '@/lib/services/email.service'
import { NotificationService } from '@/lib/services/notification.service'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-paystack-signature') || ''

  if (!PaystackService.validateWebhook(body, signature)) {
    console.error('[Paystack Webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: { event: string; data: Record<string, unknown> }
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    switch (event.event) {
      case 'charge.success': {
        await handleChargeSuccess(event.data)
        break
      }
      case 'charge.failed': {
        await handleChargeFailed(event.data)
        break
      }
      default:
        break
    }
  } catch (error) {
    console.error(`[Paystack Webhook] Error handling ${event.event}:`, error)
  }

  return NextResponse.json({ received: true })
}

async function handleChargeSuccess(data: Record<string, unknown>) {
  const reference = data.reference as string
  if (!reference) return

  // Find pending payment log
  const paymentLog = await prisma.paymentLog.findFirst({
    where: { gatewayRef: reference, status: 'pending' },
  })

  if (!paymentLog) {
    console.log('[Paystack Webhook] No pending payment found for reference:', reference)
    return
  }

  // Idempotency: check if already processed
  if (paymentLog.status === 'paid') return

  // Verify the transaction server-side
  const verification = await PaystackService.verifyTransaction(reference)
  if (!verification.success) {
    await prisma.paymentLog.update({
      where: { id: paymentLog.id },
      data: { status: 'failed', failedAt: new Date() },
    })
    return
  }

  const metadata = (data.metadata as Record<string, unknown>) || {}
  const userId = (metadata.userId as string) || paymentLog.userId
  const planSlug = (metadata.planSlug as string) || paymentLog.planSlug
  const billing = (metadata.billing as string) || 'monthly'

  if (!userId || !planSlug) {
    console.error('[Paystack Webhook] Missing userId or planSlug in metadata')
    return
  }

  const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } })
  if (!plan) {
    console.error('[Paystack Webhook] Plan not found:', planSlug)
    return
  }

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
        paymentMethod: 'paystack',
        paymentReference: reference,
        amount: verification.amount,
        currency: plan.currency,
      },
    })

    // Update payment log
    await tx.paymentLog.update({
      where: { id: paymentLog.id },
      data: {
        status: 'paid',
        paidAt: verification.paidAt,
        amount: verification.amount,
      },
    })

    // Activity logs
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
        entityId: paymentLog.id,
        description: `Payment successful: ${plan.currency} ${verification.amount.toLocaleString()} via Paystack`,
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
        amount: `${plan.currency} ${verification.amount.toLocaleString()}`,
        billingCycle: billing,
        transactionId: reference,
        paymentDate: verification.paidAt.toLocaleDateString(),
        nextBillingDate: endDate.toLocaleDateString(),
      },
    }).catch(() => {})
  }

  console.log(`[Paystack Webhook] Payment processed for user ${userId}, plan ${planSlug}`)

  // System-wide notification for admins
  await NotificationService.create({
    title: 'New Payment Received',
    message: `New ${plan.name} subscription payment of ${plan.currency} ${verification.amount.toLocaleString()} via Paystack from ${user?.email || userId}.`,
    type: 'success',
    actionUrl: `/admin/payments`,
  })
}

async function handleChargeFailed(data: Record<string, unknown>) {
  const reference = data.reference as string
  if (!reference) return

  const paymentLog = await prisma.paymentLog.findFirst({
    where: { gatewayRef: reference },
  })

  if (paymentLog) {
    await prisma.paymentLog.update({
      where: { id: paymentLog.id },
      data: { status: 'failed', failedAt: new Date() },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'payments.failed',
        entityType: 'payment',
        entityId: paymentLog.id,
        description: `Payment failed via Paystack (ref: ${reference})`,
      },
    })

    await NotificationService.create({
      title: 'Payment Failed',
      message: `A payment via Paystack failed (ref: ${reference}). Amount: ${paymentLog.currency} ${paymentLog.amount.toLocaleString()}.`,
      type: 'error',
      actionUrl: `/admin/payments`,
    })
  }
}
