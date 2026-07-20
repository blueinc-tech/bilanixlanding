import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiNotFound, apiForbidden } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { AdminManagementService } from '@/lib/services/admin-management.service'
import { ActivityService } from '@/lib/services/activity.service'
import { AuditService } from '@/lib/services/audit.service'
import { NotificationService } from '@/lib/services/notification.service'
import { ROLES } from '@/types/admin'
import crypto from 'crypto'

export const POST = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  if (auth.admin.role !== ROLES.SUPER_ADMIN) {
    return apiForbidden('Only super admins can reset passwords')
  }

  const id = context?.params?.id
  if (!id) return apiNotFound('Admin')

  const body = await req.json().catch(() => ({}))
  const newPassword = body?.password || `Temp${crypto.randomBytes(8).toString('hex')}!1`

  await AdminManagementService.resetPassword(id, newPassword)

  const admin = await AdminManagementService.getById(id)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  await ActivityService.log({
    adminId: auth.admin.id,
    action: 'auth.password_change',
    entityType: 'admin',
    entityId: id,
    description: `Password reset for admin ${admin.email}`,
    ipAddress: ip,
    userAgent,
  })

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'update',
    entityType: 'admin',
    entityId: id,
    oldValues: { passwordHash: '[REDACTED]' },
    newValues: { passwordHash: '[REDACTED]' },
    ipAddress: ip,
    userAgent,
  })

  await NotificationService.create({
    title: 'Password Reset',
    message: `Admin password for "${admin.email}" was reset by ${auth.admin.email}.`,
    type: 'warning',
    actionUrl: `/admin/admins`,
  })

  return apiSuccess({ reset: true, temporaryPassword: newPassword })
})
