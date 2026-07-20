export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticateClient } from '@/lib/client-auth'
import { prisma } from '@/lib/db'

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticateClient(req)
  if (!auth.success) return auth.response
  const userId = auth.client.id

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
  const skip = (page - 1) * limit

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.subscription.count({ where: { userId } }),
  ])

  return apiSuccess(subscriptions, 200, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
})
