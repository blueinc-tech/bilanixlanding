import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiError } from '@/lib/api-response'
import { parseBody } from '@/lib/validation'
import { prisma } from '@/lib/db'
import { AuthService } from '@/lib/services/auth.service'
import { EmailService } from '@/lib/services/email.service'
import { ActivityService } from '@/lib/services/activity.service'
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS, getClientIp } from '@/lib/rate-limiter'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const ip = getClientIp(req)

  const rateLimit = checkRateLimit(`reset-password:${ip}`, RATE_LIMITS.passwordResetConfirm)
  if (!rateLimit.allowed) {
    return apiError('Too many attempts. Please try again later.', 429, 'RATE_LIMITED', getRateLimitHeaders(rateLimit))
  }

  const parsed = await parseBody(req, resetPasswordSchema)
  if (!parsed.success) return parsed.response

  const { token, password } = parsed.data

  try {
    await AuthService.resetPassword(token, password)

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { admin: true },
    })

    if (resetToken?.admin) {
      EmailService.send({
        to: resetToken.admin.email,
        toName: resetToken.admin.name,
        templateId: 'password_changed',
        data: {
          name: resetToken.admin.name,
          changedAt: new Date().toLocaleString(),
        },
        adminId: resetToken.admin.id,
      }).catch(() => {})

      await ActivityService.log({
        adminId: resetToken.admin.id,
        action: 'auth.password_reset_complete',
        description: `Password reset completed for ${resetToken.admin.email}`,
        ipAddress: ip,
      })
    }

    return apiSuccess({ message: 'Password reset successfully. You can now log in.' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Password reset failed'
    return apiError(message, 400, 'RESET_FAILED')
  }
})
