import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { PlanService } from '@/lib/services/plan.service'
import { AuditService } from '@/lib/services/audit.service'
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

  const oldPlan = await PlanService.getBySlug(slug)

  const parsed = await parseBody(req, updateSchema)
  if (!parsed.success) return parsed.response

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  const plan = await PlanService.update(slug, parsed.data)

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'update',
    entityType: 'plan',
    entityId: plan.id,
    oldValues: { name: oldPlan.name, amount: oldPlan.amount, isActive: oldPlan.isActive, interval: oldPlan.interval },
    newValues: { name: plan.name, amount: plan.amount, isActive: plan.isActive, interval: plan.interval },
    ipAddress: ip,
    userAgent,
  })

  return apiSuccess(plan)
})

export const DELETE = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const slug = context?.params?.slug
  if (!slug) return apiSuccess(null)

  const oldPlan = await PlanService.getBySlug(slug)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  await PlanService.delete(slug)

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'delete',
    entityType: 'plan',
    entityId: oldPlan.id,
    oldValues: { name: oldPlan.name, slug: oldPlan.slug, amount: oldPlan.amount },
    ipAddress: ip,
    userAgent,
  })

  return apiSuccess({ deleted: true })
})
