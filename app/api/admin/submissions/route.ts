export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { SubmissionService } from '@/lib/services/submission.service'
import { parseQuery } from '@/lib/validation'
import { paginationSchema } from '@/lib/validation'

const listSchema = paginationSchema.extend({
  status: z.string().optional(),
  inquiryType: z.string().optional(),
  isRead: z.string().optional(),
})

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = parseQuery(req.url, listSchema)
  if (!parsed.success) return parsed.response

  const result = await SubmissionService.list({
    page: parsed.data.page ?? 1,
    limit: parsed.data.limit ?? 20,
    sortOrder: parsed.data.sortOrder ?? 'desc',
    search: parsed.data.search,
    sortBy: parsed.data.sortBy,
    status: parsed.data.status,
    inquiryType: parsed.data.inquiryType,
    isRead: parsed.data.isRead,
  })
  return apiSuccess(result.submissions, 200, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    stats: result.stats,
  })
})

export const PATCH = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const body = await req.json().catch(() => ({}))
  const action = String(body?.action ?? '')
  const ids = Array.isArray(body?.ids) ? body.ids : []

  if (!action || ids.length === 0) {
    return apiSuccess({ processed: 0 })
  }

  switch (action) {
    case 'mark_read':
      await SubmissionService.bulkMarkRead(ids)
      break
    case 'delete':
      await SubmissionService.bulkDelete(ids)
      break
  }

  return apiSuccess({ processed: ids.length })
})
