import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { CampaignService } from '@/lib/services/campaign.service'
import { parseBody } from '@/lib/validation'
import { getClientInfo } from '@/lib/validation'
import { ActivityService } from '@/lib/services/activity.service'
import { AuditService } from '@/lib/services/audit.service'
import { NotificationService } from '@/lib/services/notification.service'

const sendSchema = z.object({
  id: z.string().min(1),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = await parseBody(req, sendSchema)
  if (!parsed.success) return parsed.response

  const { ipAddress, userAgent } = getClientInfo(req)

  const prep = await CampaignService.prepareRecipients(parsed.data.id)

  const result = await CampaignService.sendCampaign(parsed.data.id)

  const campaign = await CampaignService.getById(parsed.data.id)

  await ActivityService.log({
    adminId: auth.admin.id,
    action: 'campaigns.send',
    entityType: 'campaign',
    entityId: parsed.data.id,
    description: `Sent campaign to ${result.sent} recipients (${result.failed} failed)`,
    metadata: { totalRecipients: prep.totalRecipients, sent: result.sent, failed: result.failed },
    ipAddress,
    userAgent,
  })

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'update',
    entityType: 'campaign',
    entityId: parsed.data.id,
    oldValues: { status: 'sending', totalSent: 0, totalFailed: 0 },
    newValues: { status: result.failed === 0 ? 'sent' : 'sent', totalSent: result.sent, totalFailed: result.failed },
    ipAddress,
    userAgent,
  })

  await NotificationService.create({
    title: 'Campaign Sent',
    message: `Campaign "${campaign.name}" was sent to ${result.sent} recipients${result.failed > 0 ? ` (${result.failed} failed)` : ''}.`,
    type: result.failed > 0 ? 'warning' : 'success',
    actionUrl: `/admin/marketing`,
  })

  return apiSuccess({ totalRecipients: prep.totalRecipients, sent: result.sent, failed: result.failed })
})
