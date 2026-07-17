import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { DashboardService } from '@/lib/services/dashboard.service'
import { type RoleName } from '@/types/admin'

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const data = await DashboardService.getDashboardData(auth.admin.role as RoleName)
  return apiSuccess(data)
})
