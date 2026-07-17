import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiError } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { AdminManagementService } from '@/lib/services/admin-management.service'
import { ActivityService } from '@/lib/services/activity.service'

export const PUT = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const body = await req.json().catch(() => ({}))
  const currentPassword = String(body?.currentPassword || '')
  const newPassword = String(body?.newPassword || '')

  if (!currentPassword || !newPassword) {
    return apiError('Current password and new password are required', 400, 'BAD_REQUEST')
  }

  if (newPassword.length < 8) {
    return apiError('New password must be at least 8 characters', 400, 'BAD_REQUEST')
  }

  await AdminManagementService.changeOwnPassword(auth.admin.id, currentPassword, newPassword)

  await ActivityService.log({
    adminId: auth.admin.id,
    action: 'auth.password_change',
    entityType: 'admin',
    entityId: auth.admin.id,
    description: 'Password changed',
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
    userAgent: req.headers.get('user-agent') || 'Unknown',
  })

  return apiSuccess({ changed: true })
})
