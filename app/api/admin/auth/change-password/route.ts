import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiError } from '@/lib/api-response'
import { parseBody } from '@/lib/validation'
import { authenticate } from '@/lib/auth-middleware'
import { AuthService } from '@/lib/services/auth.service'
import { EmailService } from '@/lib/services/email.service'
import { ActivityService } from '@/lib/services/activity.service'
import { getClientIp } from '@/lib/rate-limiter'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'New password must not exceed 128 characters'),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const ip = getClientIp(req)
  const parsed = await parseBody(req, changePasswordSchema)
  if (!parsed.success) return parsed.response

  const { currentPassword, newPassword } = parsed.data

  try {
    await AuthService.changePassword(auth.admin.id, currentPassword, newPassword)

    EmailService.send({
      to: auth.admin.email,
      toName: auth.admin.name,
      templateId: 'password_changed',
      data: {
        name: auth.admin.name,
        changedAt: new Date().toLocaleString(),
      },
      adminId: auth.admin.id,
    }).catch(() => {})

    await ActivityService.log({
      adminId: auth.admin.id,
      action: 'auth.password_change',
      description: `${auth.admin.email} changed their password`,
      ipAddress: ip,
    })

    return apiSuccess({ message: 'Password changed successfully' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to change password'
    return apiError(message, 400, 'CHANGE_FAILED')
  }
})
