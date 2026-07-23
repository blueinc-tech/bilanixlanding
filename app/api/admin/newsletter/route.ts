export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { prisma } from '@/lib/db'

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const search = url.searchParams.get('search') || ''
  const status = url.searchParams.get('status') || ''
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (search) where.email = { contains: search, mode: 'insensitive' }
  if (status) where.status = status

  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.newsletterSubscription.count({ where }),
  ])

  return apiSuccess(subscribers, 200, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
})
