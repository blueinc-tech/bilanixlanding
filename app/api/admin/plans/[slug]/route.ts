import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { PlanService } from '@/lib/services/plan.service'
import { parseBody } from '@/lib/validation'

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  amount: z.number().min(0).optional(),
  interval: z.enum(['monthly', 'yearly', 'one_time']).optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  audience: z.string().optional(),
  badge: z.string().optional(),
  ctaText: z.string().optional(),
  monthlyAmount: z.number().optional(),
  yearlyAmount: z.number().optional(),
})

export const GET = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const slug = context?.params?.slug
  if (!slug) return apiSuccess(null)

  const plan = await PlanService.getBySlug(slug)
  return apiSuccess(plan)
})

export const PUT = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const slug = context?.params?.slug
  if (!slug) return apiSuccess(null)

  const parsed = await parseBody(req, updateSchema)
  if (!parsed.success) return parsed.response

  const plan = await PlanService.update(slug, parsed.data)
  return apiSuccess(plan)
})

export const DELETE = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const slug = context?.params?.slug
  if (!slug) return apiSuccess(null)

  await PlanService.delete(slug)
  return apiSuccess({ deleted: true })
})
