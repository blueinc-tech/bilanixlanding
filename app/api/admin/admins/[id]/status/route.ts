import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiNotFound, apiForbidden } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { AdminManagementService } from '@/lib/services/admin-management.service'
import { ActivityService } from '@/lib/services/activity.service'
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

  if (status === 'active') {
    await AdminManagementService.enable(id)
  } else if (status === 'suspended') {
    await AdminManagementService.disable(id)
  }

  const admin = await AdminManagementService.getById(id)

  await ActivityService.log({
    adminId: auth.admin.id,
    action: status === 'active' ? 'admins.update' : 'admins.disable',
    entityType: 'admin',
    entityId: id,
    description: `Admin ${admin.email} ${status === 'active' ? 'enabled' : 'disabled'}`,
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
    userAgent: req.headers.get('user-agent') || 'Unknown',
  })

  return apiSuccess({ updated: true, status: admin.status })
})
