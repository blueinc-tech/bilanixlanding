export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { CampaignService } from '@/lib/services/campaign.service'

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const [stats, performance] = await Promise.all([
    CampaignService.getCampaignStats(),
    CampaignService.getCampaignPerformance(),
  ])

  return apiSuccess({ stats, performance })
})
