export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { NotificationService } from '@/lib/services/notification.service'
import { parseQuery } from '@/lib/validation'

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.coerce.boolean().default(false),
})

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = parseQuery(req.url, listSchema)
  if (!parsed.success) return parsed.response

  const result = await NotificationService.list({
    adminId: auth.admin.id,
    unreadOnly: parsed.data.unreadOnly,
    page: parsed.data.page,
    limit: parsed.data.limit,
  })

  return apiSuccess(result.notifications, 200, {
    total: result.total,
    unreadCount: result.unreadCount,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  })
})
