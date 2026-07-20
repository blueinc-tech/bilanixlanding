import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { UserService } from '@/lib/services/user.service'
import { AuditService } from '@/lib/services/audit.service'
import { NotificationService } from '@/lib/services/notification.service'
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

  const oldUser = await UserService.getById(id)

  const parsed = await parseBody(req, updateSchema)
  if (!parsed.success) return parsed.response

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  const user = await UserService.update(id, parsed.data)

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'update',
    entityType: 'user',
    entityId: id,
    oldValues: { name: oldUser.name, email: oldUser.email, phone: oldUser.phone, company: oldUser.company, status: oldUser.status },
    newValues: { name: user.name, email: user.email, phone: user.phone, company: user.company, status: user.status },
    ipAddress: ip,
    userAgent,
  })

  if (parsed.data.status && parsed.data.status !== oldUser.status) {
    await NotificationService.create({
      title: 'Client Status Changed',
      message: `Client "${user.name}" status changed from "${oldUser.status}" to "${user.status}" by ${auth.admin.email}.`,
      type: parsed.data.status === 'suspended' ? 'warning' : 'info',
      actionUrl: `/admin/clients/${user.id}`,
    })
  }

  return apiSuccess(user)
})

export const DELETE = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const id = context?.params?.id
  if (!id) return apiSuccess(null)

  const oldUser = await UserService.getById(id)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  await UserService.softDelete(id)

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'delete',
    entityType: 'user',
    entityId: id,
    oldValues: { name: oldUser.name, email: oldUser.email, status: oldUser.status },
    ipAddress: ip,
    userAgent,
  })

  await NotificationService.create({
    title: 'Client Deleted',
    message: `Client "${oldUser.name}" (${oldUser.email}) was deleted by ${auth.admin.email}.`,
    type: 'warning',
    actionUrl: `/admin/clients`,
  })

  return apiSuccess({ deleted: true })
})
