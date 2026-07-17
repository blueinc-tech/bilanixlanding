import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { PlanService } from '@/lib/services/plan.service'

export const GET = withErrorHandling(async (_req: NextRequest) => {
  const plans = await PlanService.listPublic()
  return apiSuccess(plans)
})
