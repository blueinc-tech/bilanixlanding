export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { UserService } from '@/lib/services/user.service'
import { parseBody } from '@/lib/validation'
import { getClientInfo } from '@/lib/validation'
import { ActivityService } from '@/lib/services/activity.service'

const impersonateSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().optional(),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = await parseBody(req, impersonateSchema)
  if (!parsed.success) return parsed.response

  const { ipAddress, userAgent } = getClientInfo(req)
  const result = await UserService.impersonateStart(
    auth.admin.id,
    parsed.data.userId,
    parsed.data.reason,
    ipAddress,
    userAgent
  )

  await ActivityService.log({
    adminId: auth.admin.id,
    action: 'clients.impersonate',
    entityType: 'user',
    entityId: parsed.data.userId,
    description: `Started impersonation of user ${result.user.email}`,
    metadata: { impersonationLogId: result.logId, reason: parsed.data.reason },
    ipAddress,
    userAgent,
  })

  return apiSuccess(result)
})

const endSchema = z.object({
  logId: z.string().min(1),
})

export const DELETE = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = await parseBody(req, endSchema)
  if (!parsed.success) return parsed.response

  await UserService.impersonateEnd(parsed.data.logId)

  await ActivityService.log({
    adminId: auth.admin.id,
    action: 'clients.impersonate',
    description: 'Ended impersonation session',
    metadata: { impersonationLogId: parsed.data.logId },
  })

  return apiSuccess({ ended: true })
})
