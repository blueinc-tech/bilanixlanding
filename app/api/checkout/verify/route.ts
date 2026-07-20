import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiBadRequest } from '@/lib/api-response'
import { parseQuery } from '@/lib/validation'
import { prisma } from '@/lib/db'
import { PaystackService } from '@/lib/services/paystack.service'
import { EmailService } from '@/lib/services/email.service'
import { NotificationService } from '@/lib/services/notification.service'
import { StripeService } from '@/lib/services/stripe.service'

const verifySchema = z.object({
  reference: z.string().optional(),
  session_id: z.string().optional(),
})

export const GET = withErrorHandling(async (req: NextRequest) => {
  const parsed = parseQuery(req.url, verifySchema)
  if (!parsed.success) return parsed.response

  const { reference, session_id } = parsed.data

  if (!reference && !session_id) {
    return apiBadRequest('Missing reference or session_id')
  }

  if (session_id) {
    return handleStripeVerification(session_id)
  }

  return handlePaystackVerification(reference!)
})

async function handlePaystackVerification(reference: string) {
  const paymentLog = await prisma.paymentLog.findFirst({
    where: { gatewayRef: reference },
  })

  if (!paymentLog) {
    return apiBadRequest('Payment record not found')
  }

  if (paymentLog.status === 'paid') {
    if (!paymentLog.userId) {
      return apiSuccess({ alreadyProcessed: true, status: 'paid' })
    }
    const existingUser = await prisma.user.findUnique({ where: { id: paymentLog.userId }, select: { email: true } })
    const email = existingUser?.email
    return apiSuccess({ alreadyProcessed: true, status: 'paid', ...(email ? { email } : {}) })
  }

  const verification = await PaystackService.verifyTransaction(reference)

  if (!verification.success) {
    if (paymentLog.status !== 'failed') {
      await prisma.paymentLog.update({
        where: { id: paymentLog.id },
        data: { status: 'failed', failedAt: new Date() },
      })
    }
    return apiSuccess({ alreadyProcessed: false, status: 'failed' })
  }

  const metadata = (verification.metadata as Record<string, unknown>) || {}
  const userId = (metadata.userId as string) || paymentLog.userId
  const planSlug = (metadata.planSlug as string) || paymentLog.planSlug
  const billing = (metadata.billing as string) || 'monthly'

  if (!userId || !planSlug) {
    return apiBadRequest('Missing payment metadata')
  }

  return activateSubscription(userId, planSlug, billing, verification.amount, 'paystack', reference, verification.paidAt)
}

async function handleStripeVerification(sessionId: string) {
  const session = await StripeService.retrieveSession(sessionId)

  if (!session) {
    return apiBadRequest('Stripe session not found')
  }

  if (session.payment_status !== 'paid') {
    return apiSuccess({ alreadyProcessed: false, status: 'pending' })
  }

  const metadata = session.metadata
  if (!metadata?.userId || !metadata?.planSlug) {
    return apiBadRequest('Missing payment metadata')
  }

  const stripeUser = await prisma.user.findUnique({ where: { id: metadata.userId }, select: { email: true } })
  const stripeEmail = stripeUser?.email

  const existing = await prisma.paymentLog.findFirst({
    where: { userId: metadata.userId, status: 'paid', gateway: 'stripe' },
  })
  if (existing) {
    return apiSuccess({ alreadyProcessed: true, status: 'paid', ...(stripeEmail ? { email: stripeEmail } : {}) })
  }

  const paymentLogId = metadata.paymentLogId
  if (paymentLogId) {
    const pl = await prisma.paymentLog.findUnique({ where: { id: paymentLogId } })
    if (pl && pl.status === 'paid') {
      return apiSuccess({ alreadyProcessed: true, status: 'paid', ...(stripeEmail ? { email: stripeEmail } : {}) })
    }
  }

  const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: metadata.planSlug } })
  if (!plan) {
    return apiBadRequest('Plan not found')
  }

  const billing = metadata.billing || 'monthly'
  const amount = billing === 'monthly'
    ? (plan.monthlyAmount ?? plan.amount)
    : (plan.yearlyAmount ?? plan.amount)

  return activateSubscription(
    metadata.userId,
    metadata.planSlug,
    billing,
    amount,
    'stripe',
    session.subscription as string || sessionId,
    new Date(),
  )
}

async function activateSubscription(
  userId: string,
  planSlug: string,
  billing: string,
  amount: number,
  gateway: string,
  reference: string,
  paidAt: Date,
) {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } })
  if (!plan) {
    return apiBadRequest('Plan not found')
  }

  const now = new Date()
  const endDate = new Date(now)
  if (billing === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1)
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1)
  }

  const paymentLog = await prisma.paymentLog.findFirst({
    where: { userId, status: 'pending', gateway },
  })

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { status: 'active' },
    })

    await tx.subscription.create({
      data: {
        userId,
        planId: plan.id,
        planName: plan.name,
        status: 'active',
        startDate: now,
        endDate,
        paymentMethod: gateway,
        paymentReference: reference,
        amount,
        currency: plan.currency,
      },
    })

    if (paymentLog) {
      await tx.paymentLog.update({
        where: { id: paymentLog.id },
        data: {
          status: 'paid',
          paidAt,
          amount,
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
          gateway,
          gatewayRef: reference,
          description: `${plan.name} Plan (${billing})`,
          paidAt,
        },
      })
    }

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
        action: 'payments.success',
        entityType: 'payment',
        entityId: userId,
        description: `Payment successful: ${plan.currency} ${amount.toLocaleString()} via ${gateway}`,
      },
    })
  })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user) {
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000'

    EmailService.send({
      to: user.email,
      toName: user.name,
      templateId: 'payment_receipt',
      data: {
        name: user.name,
        planName: plan.name,
        amount: `${plan.currency} ${amount.toLocaleString()}`,
        billingCycle: billing,
        transactionId: reference,
        paymentDate: paidAt.toLocaleDateString(),
        nextBillingDate: endDate.toLocaleDateString(),
      },
    }).catch(() => {})
  }

  await NotificationService.create({
    title: 'Payment Received',
    message: `Payment of ${plan.currency} ${amount.toLocaleString()} via ${gateway} from ${user?.email || userId}.`,
    type: 'success',
    actionUrl: `/admin/payments`,
  })

  return apiSuccess({ alreadyProcessed: false, status: 'paid', ...(user?.email ? { email: user.email } : {}) })
}
