import { NextRequest } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { withErrorHandling, apiSuccess, apiBadRequest, apiConflict } from '@/lib/api-response'
import { parseBody } from '@/lib/validation'
import { prisma } from '@/lib/db'
import { StripeService } from '@/lib/services/stripe.service'
import { PaystackService } from '@/lib/services/paystack.service'
import { NotificationService } from '@/lib/services/notification.service'

const checkoutSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email').toLowerCase().trim(),
  phone: z.string().min(1, 'Phone number is required'),
  company: z.string().min(1, 'Company name is required'),
  country: z.string().optional(),
  industry: z.string().optional(),
  planSlug: z.string().min(1, 'Plan is required'),
  billing: z.enum(['monthly', 'yearly']),
  gateway: z.enum(['stripe', 'paystack']),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const parsed = await parseBody(req, checkoutSchema)
  if (!parsed.success) return parsed.response

  const { name, email, phone, company, country, industry, planSlug, billing, gateway } = parsed.data

  // Find the plan
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { slug: planSlug, isActive: true },
  })
  if (!plan) {
    return apiBadRequest('Plan not found or inactive')
  }

  const amount = billing === 'monthly'
    ? (plan.monthlyAmount ?? plan.amount)
    : (plan.yearlyAmount ?? plan.amount)

  if (amount <= 0) {
    return apiBadRequest('Invalid plan amount')
  }

  // Check for existing user
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser && existingUser.status === 'active') {
    return apiConflict('An account with this email already exists. Please sign in instead.')
  }

  // Create or reuse user
  let userId: string
  if (existingUser) {
    userId = existingUser.id
  } else {
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        phone,
        company,
        country: country || null,
        industry: industry || null,
        status: 'pending_payment',
      },
    })
    userId = user.id

    // Notify admins of new registration
    await NotificationService.create({
      title: 'New Registration',
      message: `${name} (${email}) started registration for ${plan.name} Plan via ${gateway}.`,
      type: 'info',
      actionUrl: `/admin/clients`,
    })
  }

  // Create pending payment log
  const paymentLog = await prisma.paymentLog.create({
    data: {
      userId,
      planSlug,
      amount,
      currency: plan.currency,
      status: 'pending',
      type: 'subscription',
      gateway,
      description: `${plan.name} Plan (${billing})`,
    },
  })

  try {
    if (gateway === 'stripe') {
      const siteUrl = process.env.SITE_URL || 'http://localhost:3000'
      const { url } = await StripeService.createCheckoutSession({
        customerEmail: email,
        customerName: name,
        planName: plan.name,
        amount,
        currency: plan.currency,
        billing,
        metadata: {
          userId,
          planId: plan.id,
          planSlug,
          billing,
          paymentLogId: paymentLog.id,
        },
      })

      return apiSuccess({ url, paymentLogId: paymentLog.id })
    } else {
      const reference = `BILX_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
      const siteUrl = process.env.SITE_URL || 'http://localhost:3000'

      const { authorizationUrl } = await PaystackService.initializeTransaction({
        email,
        amount,
        currency: plan.currency,
        reference,
        metadata: {
          userId,
          planId: plan.id,
          planSlug,
          billing,
          paymentLogId: paymentLog.id,
        },
        callbackUrl: `${siteUrl}/register/success?reference=${reference}`,
      })

      // Update payment log with reference
      await prisma.paymentLog.update({
        where: { id: paymentLog.id },
        data: { gatewayRef: reference },
      })

      return apiSuccess({ url: authorizationUrl, paymentLogId: paymentLog.id })
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Checkout] Gateway init failed:', errMsg)
    await prisma.paymentLog.update({
      where: { id: paymentLog.id },
      data: { status: 'failed', failedAt: new Date() },
    })
    return apiBadRequest(`Payment gateway error: ${errMsg}`)
  }
})
