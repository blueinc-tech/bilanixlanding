import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiNotFound, apiForbidden } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { AdminManagementService } from '@/lib/services/admin-management.service'
import { ActivityService } from '@/lib/services/activity.service'
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

  const admin = await AdminManagementService.update(id, {
    ...parsed.data,
    assignedModules: parsed.data.assignedModules as ModuleName[] | undefined,
  })

  await ActivityService.log({
    adminId: auth.admin.id,
    action: 'admins.update',
    entityType: 'admin',
    entityId: id,
    description: `Updated admin ${admin.email}`,
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
    userAgent: req.headers.get('user-agent') || 'Unknown',
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

  // Cannot delete self
  if (id === auth.admin.id) {
    return apiSuccess({ deleted: false, error: 'Cannot delete your own account' })
  }

  const admin = await AdminManagementService.getById(id)

  await AdminManagementService.softDelete(id)

  await ActivityService.log({
    adminId: auth.admin.id,
    action: 'admins.delete',
    entityType: 'admin',
    entityId: id,
    description: `Deleted admin ${admin.email}`,
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
    userAgent: req.headers.get('user-agent') || 'Unknown',
  })

  return apiSuccess({ deleted: true })
})
