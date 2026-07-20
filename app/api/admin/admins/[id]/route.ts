import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiNotFound, apiForbidden } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { AdminManagementService } from '@/lib/services/admin-management.service'
import { ActivityService } from '@/lib/services/activity.service'
import { AuditService } from '@/lib/services/audit.service'
import { NotificationService } from '@/lib/services/notification.service'
import { ROLES, type ModuleName } from '@/types/admin'

export const GET = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  if (auth.admin.role !== ROLES.SUPER_ADMIN) {
    return apiForbidden('Only super admins can view admin details')
  }

  const id = context?.params?.id
  if (!id) return apiNotFound('Admin')

  const admin = await AdminManagementService.getById(id)
  return apiSuccess(admin)
})

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'suspended', 'disabled']).optional(),
  role: z.enum(['super_admin', 'admin']).optional(),
  assignedModules: z.array(z.string()).optional(),
})

export const PUT = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  if (auth.admin.role !== ROLES.SUPER_ADMIN) {
    return apiForbidden('Only super admins can update administrators')
  }

  const id = context?.params?.id
  if (!id) return apiNotFound('Admin')

  const body = await req.json().catch(() => ({}))
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return apiSuccess({ updated: false, errors: parsed.error.flatten().fieldErrors })
  }

  const oldAdmin = await AdminManagementService.getById(id)

  const admin = await AdminManagementService.update(id, {
    ...parsed.data,
    assignedModules: parsed.data.assignedModules as ModuleName[] | undefined,
  })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  await ActivityService.log({
    adminId: auth.admin.id,
    action: 'admins.update',
    entityType: 'admin',
    entityId: id,
    description: `Updated admin ${admin.email}`,
    ipAddress: ip,
    userAgent,
  })

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'update',
    entityType: 'admin',
    entityId: id,
    oldValues: { name: oldAdmin.name, email: oldAdmin.email, role: oldAdmin.role, status: oldAdmin.status },
    newValues: { name: admin.name, email: admin.email, role: admin.role, status: admin.status },
    ipAddress: ip,
    userAgent,
  })

  return apiSuccess(admin)
})

export const DELETE = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  if (auth.admin.role !== ROLES.SUPER_ADMIN) {
    return apiForbidden('Only super admins can delete administrators')
  }

  const id = context?.params?.id
  if (!id) return apiNotFound('Admin')

  if (id === auth.admin.id) {
    return apiSuccess({ deleted: false, error: 'Cannot delete your own account' })
  }

  const admin = await AdminManagementService.getById(id)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  await AdminManagementService.softDelete(id)

  await ActivityService.log({
    adminId: auth.admin.id,
    action: 'admins.delete',
    entityType: 'admin',
    entityId: id,
    description: `Deleted admin ${admin.email}`,
    ipAddress: ip,
    userAgent,
  })

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'delete',
    entityType: 'admin',
    entityId: id,
    oldValues: { name: admin.name, email: admin.email, role: admin.role, status: admin.status },
    ipAddress: ip,
    userAgent,
  })

  await NotificationService.create({
    title: 'Admin Account Deleted',
    message: `Admin account "${admin.email}" was deleted by ${auth.admin.email}.`,
    type: 'warning',
    actionUrl: `/admin/admins`,
  })

  return apiSuccess({ deleted: true })
})
