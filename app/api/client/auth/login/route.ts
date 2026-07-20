import { NextRequest } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter'
import { ClientAuthService } from '@/lib/services/client-auth.service'
import { setClientCookie } from '@/lib/client-auth'
import { withErrorHandling, apiSuccess, apiBadRequest, apiTooManyRequests } from '@/lib/api-response'

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json()
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return apiBadRequest(parsed.error.errors[0].message)
  }

  const { email, password, rememberMe } = parsed.data

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || '127.0.0.1'

  const rateLimitResult = checkRateLimit(`client-login:${ip}`, RATE_LIMITS.login)
  if (!rateLimitResult.allowed) {
    return apiTooManyRequests('Too many login attempts. Please try again later.')
  }

  const result = await ClientAuthService.clientLogin(email, password, ip)

  const response = apiSuccess({
    user: result.user,
  })

  setClientCookie(response, result.token, rememberMe)

  return response
})
