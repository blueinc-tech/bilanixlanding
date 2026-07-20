import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiCreated } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { CampaignService } from '@/lib/services/campaign.service'
import { AuditService } from '@/lib/services/audit.service'
import { parseBody, parseQuery } from '@/lib/validation'

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  search: z.string().optional(),
})

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = parseQuery(req.url, listSchema)
  if (!parsed.success) return parsed.response

  const result = await CampaignService.list(parsed.data)
  return apiSuccess(result.campaigns, 200, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  })
})

const recipientEntrySchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  userId: z.string().optional(),
})

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  subject: z.string().min(1, 'Subject is required').max(255),
  body: z.string().min(1, 'Body is required'),
  type: z.string().optional(),
  recipientType: z.enum(['single', 'multiple', 'subscription_group', 'csv']).default('subscription_group'),
  targetFilter: z.record(z.unknown()).optional(),
  recipients: z.array(recipientEntrySchema).optional(),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = await parseBody(req, createSchema)
  if (!parsed.success) return parsed.response

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  const campaign = await CampaignService.create({
    ...parsed.data,
    createdBy: auth.admin.id,
  })

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'create',
    entityType: 'campaign',
    entityId: campaign.id,
    newValues: { name: campaign.name, subject: campaign.subject, recipientType: campaign.recipientType },
    ipAddress: ip,
    userAgent,
  })

  return apiCreated(campaign)
})
