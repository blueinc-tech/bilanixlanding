import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiNotFound, apiForbidden } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { AdminManagementService } from '@/lib/services/admin-management.service'
import { ActivityService } from '@/lib/services/activity.service'
import { AuditService } from '@/lib/services/audit.service'
import { NotificationService } from '@/lib/services/notification.service'
import { ROLES } from '@/types/admin'

export const PUT = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  if (auth.admin.role !== ROLES.SUPER_ADMIN) {
    return apiForbidden('Only super admins can change admin status')
  }

  const id = context?.params?.id
  if (!id) return apiNotFound('Admin')

  const body = await req.json().catch(() => ({}))
  const status = String(body?.status || '')

  const oldAdmin = await AdminManagementService.getById(id)

  if (status === 'active') {
    await AdminManagementService.enable(id)
  } else if (status === 'suspended') {
    await AdminManagementService.disable(id)
  }

  const admin = await AdminManagementService.getById(id)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  await ActivityService.log({
    adminId: auth.admin.id,
    action: status === 'active' ? 'admins.update' : 'admins.disable',
    entityType: 'admin',
    entityId: id,
    description: `Admin ${admin.email} ${status === 'active' ? 'enabled' : 'disabled'}`,
    ipAddress: ip,
    userAgent,
  })

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'update',
    entityType: 'admin',
    entityId: id,
    oldValues: { status: oldAdmin.status },
    newValues: { status: admin.status },
    ipAddress: ip,
    userAgent,
  })

  if (status === 'suspended') {
    await NotificationService.create({
      title: 'Admin Account Suspended',
      message: `Admin account "${admin.email}" was suspended by ${auth.admin.email}.`,
      type: 'warning',
      actionUrl: `/admin/admins`,
    })
  }

  return apiSuccess({ updated: true, status: admin.status })
})
