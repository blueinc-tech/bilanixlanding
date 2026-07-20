import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { UserService } from '@/lib/services/user.service'
import { parseBody } from '@/lib/validation'
import { getClientInfo } from '@/lib/validation'
import { ActivityService } from '@/lib/services/activity.service'
import { AuditService } from '@/lib/services/audit.service'
import { NotificationService } from '@/lib/services/notification.service'

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

  await AuditService.log({
    adminId: auth.admin.id,
    action: parsed.data.action === 'delete' ? 'delete' : 'update',
    entityType: 'user',
    entityId: parsed.data.userIds[0],
    newValues: { action: parsed.data.action, userIds: parsed.data.userIds, count: result.affected },
    ipAddress,
    userAgent,
  })

  if (result.affected > 0) {
    await NotificationService.create({
      title: `Bulk ${parsed.data.action.charAt(0).toUpperCase() + parsed.data.action.slice(1)}`,
      message: `${result.affected} client(s) were ${parsed.data.action === 'delete' ? 'deleted' : parsed.data.action + 'd'} by ${auth.admin.email}.`,
      type: parsed.data.action === 'delete' ? 'warning' : 'info',
      actionUrl: `/admin/clients`,
    })
  }

  return apiSuccess(result)
})
