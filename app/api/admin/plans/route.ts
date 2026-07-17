import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiCreated } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { PlanService } from '@/lib/services/plan.service'
import { parseBody } from '@/lib/validation'

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const url = new URL(req.url)
  const includeInactive = url.searchParams.get('includeInactive') === 'true'
  const plans = await PlanService.list(includeInactive)
  return apiSuccess(plans)
})

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().optional(),
  interval: z.enum(['monthly', 'yearly', 'one_time']).optional(),
  features: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
  audience: z.string().optional(),
  badge: z.string().optional(),
  ctaText: z.string().optional(),
  monthlyAmount: z.number().optional(),
  yearlyAmount: z.number().optional(),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = await parseBody(req, createSchema)
  if (!parsed.success) return parsed.response

  const plan = await PlanService.create(parsed.data)
  return apiCreated(plan)
})
