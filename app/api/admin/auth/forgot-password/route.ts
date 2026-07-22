export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiError } from '@/lib/api-response'
import { parseBody } from '@/lib/validation'
import { AuthService } from '@/lib/services/auth.service'
import { EmailService } from '@/lib/services/email.service'
import { ActivityService } from '@/lib/services/activity.service'
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/lib/rate-limiter'
import { prisma } from '@/lib/db'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const ip = getClientIp(req)

  // Rate limit
  const rateLimit = checkRateLimit(`forgot-password:${ip}`, RATE_LIMITS.passwordReset)
  if (!rateLimit.allowed) {
    return apiError('Too many requests. Please try again later.', 429, 'RATE_LIMITED')
  }

  const parsed = await parseBody(req, forgotPasswordSchema)
  if (!parsed.success) return parsed.response

  const { email } = parsed.data

  // Always return success to prevent email enumeration
  try {
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (admin && admin.status === 'active' && !admin.deletedAt) {
      const token = await AuthService.createResetToken(admin.id)

      // Send reset email (non-blocking)
      const baseUrl = process.env.SITE_URL || 'http://localhost:3000'
      EmailService.send({
        to: admin.email,
        toName: admin.name,
        templateId: 'password_reset',
        data: {
          name: admin.name,
          resetUrl: `${baseUrl}/admin/reset-password?token=${token}`,
        },
        adminId: admin.id,
      }).catch(() => {})

      await ActivityService.log({
        adminId: admin.id,
        action: 'auth.password_reset_request',
        description: `Password reset requested for ${admin.email}`,
        ipAddress: ip,
      })
    }
  } catch {
    // Silently fail — still return success to prevent enumeration
  }

  return apiSuccess({
    message: 'If an account exists with that email, a reset link has been sent.',
  })
})
