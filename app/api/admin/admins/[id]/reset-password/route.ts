import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiNotFound, apiForbidden } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { AdminManagementService } from '@/lib/services/admin-management.service'
import { ActivityService } from '@/lib/services/activity.service'
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

  // Generate a random temporary password if none provided
  const newPassword = body?.password || `Temp${crypto.randomBytes(8).toString('hex')}!1`

  await AdminManagementService.resetPassword(id, newPassword)

  const admin = await AdminManagementService.getById(id)

  await ActivityService.log({
    adminId: auth.admin.id,
    action: 'auth.password_change',
    entityType: 'admin',
    entityId: id,
    description: `Password reset for admin ${admin.email}`,
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
    userAgent: req.headers.get('user-agent') || 'Unknown',
  })

  return apiSuccess({ reset: true, temporaryPassword: newPassword })
})
