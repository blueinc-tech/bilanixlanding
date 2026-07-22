export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess, apiCreated } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { CampaignService } from '@/lib/services/campaign.service'
import { AuditService } from '@/lib/services/audit.service'

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const { id } = await req.json()
  if (!id) return apiSuccess(null)

  const original = await CampaignService.getById(id)

  const campaign = await CampaignService.create({
    name: `${original.name} (Copy)`,
    subject: original.subject,
    body: original.body,
    type: original.type,
    recipientType: original.recipientType as any,
    targetFilter: (original.targetFilter as Record<string, unknown>) || undefined,
    createdBy: auth.admin.id,
  })

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'create',
    entityType: 'campaign',
    entityId: campaign.id,
    newValues: { name: campaign.name, duplicatedFrom: original.id },
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
    userAgent: req.headers.get('user-agent') || 'Unknown',
  })

  return apiCreated(campaign)
})
