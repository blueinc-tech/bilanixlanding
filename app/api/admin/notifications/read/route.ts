export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { NotificationService } from '@/lib/services/notification.service'
import { parseBody } from '@/lib/validation'

const markReadSchema = z.object({ id: z.string().min(1) })

export const PUT = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = await parseBody(req, markReadSchema)
  if (!parsed.success) return parsed.response

  await NotificationService.markRead(parsed.data.id)
  return apiSuccess({ read: true })
})

export const DELETE = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  await NotificationService.markAllRead(auth.admin.id)
  return apiSuccess({ read: true })
})
