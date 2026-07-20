import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess, apiNotFound, apiForbidden } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { AdminManagementService } from '@/lib/services/admin-management.service'
import { ActivityService } from '@/lib/services/activity.service'
import { AuditService } from '@/lib/services/audit.service'
import { ROLES, type ModuleName } from '@/types/admin'

export const PUT = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  if (auth.admin.role !== ROLES.SUPER_ADMIN) {
    return apiForbidden('Only super admins can manage permissions')
  }

  const id = context?.params?.id
  if (!id) return apiNotFound('Admin')

  const body = await req.json().catch(() => ({}))
  const modules = Array.isArray(body?.modules) ? body.modules : []

  const oldAdmin = await AdminManagementService.getById(id)
  const oldModules = (oldAdmin as unknown as Record<string, unknown>).assignedModules || []

  await AdminManagementService.assignPermissions(id, modules as ModuleName[])

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  await ActivityService.log({
    adminId: auth.admin.id,
    action: 'admins.permission_change',
    entityType: 'admin',
    entityId: id,
    description: `Updated permissions for admin: ${modules.join(', ') || 'none'}`,
    metadata: { modules },
    ipAddress: ip,
    userAgent,
  })

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'update',
    entityType: 'admin',
    entityId: id,
    oldValues: { assignedModules: oldModules },
    newValues: { assignedModules: modules },
    ipAddress: ip,
    userAgent,
  })

  return apiSuccess({ updated: true })
})
