export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiError } from '@/lib/api-response'
import { parseBody } from '@/lib/validation'
import { AuthService } from '@/lib/services/auth.service'
import { ActivityService } from '@/lib/services/activity.service'
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS, getClientIp } from '@/lib/rate-limiter'
import { setAuthCookie } from '@/lib/auth-middleware'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const ip = getClientIp(req)
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  // Rate limit
  const rateLimit = checkRateLimit(`login:${ip}`, RATE_LIMITS.login)
  if (!rateLimit.allowed) {
    return apiError('Too many login attempts. Please try again later.', 429, 'RATE_LIMITED', getRateLimitHeaders(rateLimit))
  }

  const parsed = await parseBody(req, loginSchema)
  if (!parsed.success) return parsed.response

  const { email, password, rememberMe } = parsed.data

  try {
    const result = await AuthService.login(email, password, ip)

    // Create activity log
    await ActivityService.log({
      adminId: result.admin.id,
      action: 'auth.login',
      description: `${result.admin.email} logged in`,
      ipAddress: ip,
      userAgent,
    })

    const response = apiSuccess(result.admin)
    return setAuthCookie(response, result.token, rememberMe)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed'
    return apiError(message, 401, 'AUTH_FAILED')
  }
})
