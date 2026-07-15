import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { UserService } from '@/lib/services/user.service'
import { parseBody } from '@/lib/validation'
import { getClientInfo } from '@/lib/validation'
import { ActivityService } from '@/lib/services/activity.service'

const bulkSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'suspend', 'delete']),
  userIds: z.array(z.string().min(1)).min(1, 'Select at least one user'),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = await parseBody(req, bulkSchema)
  if (!parsed.success) return parsed.response

  const { ipAddress, userAgent } = getClientInfo(req)
  const result = await UserService.bulkAction(parsed.data.action, parsed.data.userIds)

  await ActivityService.log({
    adminId: auth.admin.id,
    action: `clients.${parsed.data.action}`,
    entityType: 'user',
    description: `Bulk ${parsed.data.action} on ${result.affected} user(s)`,
    metadata: { userIds: parsed.data.userIds, count: result.affected },
    ipAddress,
    userAgent,
  })

  return apiSuccess(result)
})
