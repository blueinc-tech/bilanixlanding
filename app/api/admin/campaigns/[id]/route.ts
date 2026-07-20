export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { CampaignService } from '@/lib/services/campaign.service'
import { AuditService } from '@/lib/services/audit.service'
import { NotificationService } from '@/lib/services/notification.service'
import { parseBody } from '@/lib/validation'

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  subject: z.string().min(1).max(255).optional(),
  body: z.string().min(1).optional(),
  targetFilter: z.record(z.unknown()).optional(),
})

export const GET = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const id = context?.params?.id
  if (!id) return apiSuccess(null)

  const campaign = await CampaignService.getWithRecipients(id)
  return apiSuccess(campaign)
})

export const PUT = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const id = context?.params?.id
  if (!id) return apiSuccess(null)

  const oldCampaign = await CampaignService.getById(id)

  const parsed = await parseBody(req, updateSchema)
  if (!parsed.success) return parsed.response

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  const campaign = await CampaignService.update(id, parsed.data)

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'update',
    entityType: 'campaign',
    entityId: id,
    oldValues: { name: oldCampaign.name, subject: oldCampaign.subject },
    newValues: { name: campaign.name, subject: campaign.subject },
    ipAddress: ip,
    userAgent,
  })

  return apiSuccess(campaign)
})

export const DELETE = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const id = context?.params?.id
  if (!id) return apiSuccess(null)

  const oldCampaign = await CampaignService.getById(id)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  await CampaignService.delete(id)

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'delete',
    entityType: 'campaign',
    entityId: id,
    oldValues: { name: oldCampaign.name, subject: oldCampaign.subject, status: oldCampaign.status },
    ipAddress: ip,
    userAgent,
  })

  await NotificationService.create({
    title: 'Campaign Deleted',
    message: `Campaign "${oldCampaign.name}" was deleted by ${auth.admin.email}.`,
    type: 'info',
    actionUrl: `/admin/marketing`,
  })

  return apiSuccess({ deleted: true })
})
