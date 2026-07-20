export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { prisma } from '@/lib/db'
import { parseQuery } from '@/lib/validation'

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  action: z.string().optional(),
  entityType: z.string().optional(),
  adminId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = parseQuery(req.url, listSchema)
  if (!parsed.success) return parsed.response

  const { page: rawPage, limit: rawLimit, action, entityType, adminId, startDate, endDate } = parsed.data
  const page = rawPage || 1
  const limit = rawLimit || 50
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (action) where.action = action
  if (entityType) where.entityType = entityType
  if (adminId) where.adminId = adminId
  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        admin: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ])

  return apiSuccess(logs, 200, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
})
