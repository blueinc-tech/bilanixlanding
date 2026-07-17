import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiNotFound } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { SubmissionService } from '@/lib/services/submission.service'

export const GET = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const id = context?.params?.id
  if (!id) return apiNotFound('Submission')

  const submission = await SubmissionService.getById(id)
  if (!submission) return apiNotFound('Submission')

  if (!submission.isRead) {
    await SubmissionService.markAsRead(id)
  }

  return apiSuccess(submission)
})

const updateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'responded', 'archived']).optional(),
})

export const PUT = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const id = context?.params?.id
  if (!id) return apiNotFound('Submission')

  const body = await req.json().catch(() => ({}))
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return apiSuccess({ updated: false })
  }

  if (parsed.data.status) {
    await SubmissionService.updateStatus(id, parsed.data.status)
  }

  return apiSuccess({ updated: true })
})

export const DELETE = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const id = context?.params?.id
  if (!id) return apiNotFound('Submission')

  await SubmissionService.softDelete(id)
  return apiSuccess({ deleted: true })
})
