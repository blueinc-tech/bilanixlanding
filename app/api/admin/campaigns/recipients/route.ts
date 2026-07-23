export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { CampaignService } from '@/lib/services/campaign.service'
import { parseQuery } from '@/lib/validation'

const querySchema = z.object({
  group: z.enum(['active', 'inactive', 'expiring_soon', 'all', 'newsletter']).default('all'),
})

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = parseQuery(req.url, querySchema)
  if (!parsed.success) return parsed.response

  const group = parsed.data.group || 'all'
  const recipients = await CampaignService.getSubscriptionGroupRecipients(group)
  return apiSuccess({ recipients, total: recipients.length })
})
