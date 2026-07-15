import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { UserService } from '@/lib/services/user.service'
import { parseBody } from '@/lib/validation'

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
})

export const GET = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const id = context?.params?.id
  if (!id) return apiSuccess(null)

  const user = await UserService.getById(id)
  return apiSuccess(user)
})

export const PUT = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const id = context?.params?.id
  if (!id) return apiSuccess(null)

  const parsed = await parseBody(req, updateSchema)
  if (!parsed.success) return parsed.response

  const user = await UserService.update(id, parsed.data)
  return apiSuccess(user)
})

export const DELETE = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const id = context?.params?.id
  if (!id) return apiSuccess(null)

  await UserService.softDelete(id)
  return apiSuccess({ deleted: true })
})
