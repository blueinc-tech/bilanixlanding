import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { CampaignService } from '@/lib/services/campaign.service'
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

  const parsed = await parseBody(req, updateSchema)
  if (!parsed.success) return parsed.response

  const campaign = await CampaignService.update(id, parsed.data)
  return apiSuccess(campaign)
})

export const DELETE = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const id = context?.params?.id
  if (!id) return apiSuccess(null)

  await CampaignService.delete(id)
  return apiSuccess({ deleted: true })
})
