import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { AdminManagementService } from '@/lib/services/admin-management.service'

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const profile = await AdminManagementService.getProfile(auth.admin.id)
  return apiSuccess(profile)
})

export const PUT = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const body = await req.json().catch(() => ({}))
  const data: { name?: string; email?: string; phone?: string } = {}

  if (body.name) data.name = String(body.name)
  if (body.email) data.email = String(body.email)
  if (body.phone !== undefined) data.phone = String(body.phone)

  const profile = await AdminManagementService.updateProfile(auth.admin.id, data)
  return apiSuccess(profile)
})
