export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { PlanService } from '@/lib/services/plan.service'
import { PaymentService } from '@/lib/services/payment.service'

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const [planStats, revenueStats] = await Promise.all([
    PlanService.getStats(),
    PaymentService.getRevenueStats(),
  ])

  return apiSuccess({ ...planStats, ...revenueStats })
})
