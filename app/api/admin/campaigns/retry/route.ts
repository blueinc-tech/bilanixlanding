export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { CampaignService } from '@/lib/services/campaign.service'
import { parseBody } from '@/lib/validation'

const retrySchema = z.object({
  id: z.string().min(1),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = await parseBody(req, retrySchema)
  if (!parsed.success) return parsed.response

  const result = await CampaignService.retryFailed(parsed.data.id)
  return apiSuccess(result)
})
