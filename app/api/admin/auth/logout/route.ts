export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate, removeAuthCookie } from '@/lib/auth-middleware'
import { ActivityService } from '@/lib/services/activity.service'
import { getClientIp } from '@/lib/rate-limiter'

export const POST = withErrorHandling(async (req: NextRequest) => {
  const ip = getClientIp(req)
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  const auth = await authenticate(req)
  if (auth.success) {
    await ActivityService.log({
      adminId: auth.admin.id,
      action: 'auth.logout',
      description: `${auth.admin.email} logged out`,
      ipAddress: ip,
      userAgent,
    })
  }

  const response = apiSuccess({ message: 'Logged out successfully' })
  return removeAuthCookie(response)
})
