export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiUnauthorized, apiBadRequest } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { SettingsService } from '@/lib/services/settings.service'

const verifySchema = z.object({
  email: z.string().email().optional(),
  externalId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key') || ''
  const expected = (await SettingsService.get('integration', 'api_key')) as string
  if (!expected || apiKey !== expected) {
    return apiUnauthorized('Invalid API key')
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiBadRequest('Invalid JSON body')
  }

  const parsed = verifySchema.safeParse(body)
  if (!parsed.success) return apiBadRequest('Provide an email or externalId')
  if (!parsed.data.email && !parsed.data.externalId) {
    return apiBadRequest('Provide an email or externalId')
  }

  let userId: string | null = null

  if (parsed.data.externalId) {
    const user = await prisma.user.findUnique({ where: { id: parsed.data.externalId } })
    if (user) userId = user.id
  } else if (parsed.data.email) {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } })
    if (user) userId = user.id
  }

  if (!userId) {
    return apiSuccess({
      active: false,
      found: false,
      message: 'No account found for the provided identifier',
    })
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
      OR: [{ endDate: { gte: new Date() } }, { endDate: null }],
    },
    orderBy: { createdAt: 'desc' },
  })

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })

  if (!subscription) {
    return apiSuccess({
      active: false,
      found: true,
      email: user?.email,
    })
  }

  return apiSuccess({
    active: true,
    found: true,
    email: user?.email,
    plan: subscription.planName,
    planSlug: subscription.planId ? (await prisma.subscriptionPlan.findUnique({ where: { id: subscription.planId }, select: { slug: true } }))?.slug : null,
    expiresAt: subscription.endDate,
    paymentMethod: subscription.paymentMethod,
  })
}
