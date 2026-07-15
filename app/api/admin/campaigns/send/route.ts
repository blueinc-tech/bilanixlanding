import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { CampaignService } from '@/lib/services/campaign.service'
import { parseBody } from '@/lib/validation'
import { getClientInfo } from '@/lib/validation'
import { ActivityService } from '@/lib/services/activity.service'

const sendSchema = z.object({
  id: z.string().min(1),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = await parseBody(req, sendSchema)
  if (!parsed.success) return parsed.response

  const { ipAddress, userAgent } = getClientInfo(req)

  const result = await CampaignService.prepareRecipients(parsed.data.id)

  await ActivityService.log({
    adminId: auth.admin.id,
    action: 'campaigns.send',
    entityType: 'campaign',
    entityId: parsed.data.id,
    description: `Prepared ${result.totalRecipients} recipients for campaign`,
    metadata: { totalRecipients: result.totalRecipients },
    ipAddress,
    userAgent,
  })

  return apiSuccess(result)
})
