import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticateClient } from '@/lib/client-auth'
import { prisma } from '@/lib/db'

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticateClient(req)
  if (!auth.success) return auth.response
  const userId = auth.client.id

  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  let plan = null
  if (subscription) {
    if (subscription.planId) {
      plan = await prisma.subscriptionPlan.findUnique({
        where: { id: subscription.planId },
      })
    } else if (subscription.planName) {
      plan = await prisma.subscriptionPlan.findFirst({
        where: { slug: subscription.planName.toLowerCase().replace(/\s+/g, '-') },
      })
    }
  }

  return apiSuccess({
    subscription,
    plan,
  })
})
