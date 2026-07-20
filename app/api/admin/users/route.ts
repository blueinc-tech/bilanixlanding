export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiCreated } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { UserService } from '@/lib/services/user.service'
import { AuditService } from '@/lib/services/audit.service'
import { NotificationService } from '@/lib/services/notification.service'
import { parseBody, parseQuery } from '@/lib/validation'
import { paginationSchema } from '@/lib/validation'

const listSchema = paginationSchema.extend({
  status: z.string().optional(),
  plan: z.string().optional(),
})

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = parseQuery(req.url, listSchema)
  if (!parsed.success) return parsed.response

  const result = await UserService.list(parsed.data)
  return apiSuccess(result.users, 200, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  })
})

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const parsed = await parseBody(req, createSchema)
  if (!parsed.success) return parsed.response

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  const user = await UserService.create(parsed.data)

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'create',
    entityType: 'user',
    entityId: user.id,
    newValues: { name: user.name, email: user.email, phone: user.phone, company: user.company },
    ipAddress: ip,
    userAgent,
  })

  await NotificationService.create({
    title: 'New Client Created',
    message: `Client "${user.name}" (${user.email}) was created by ${auth.admin.email}.`,
    type: 'success',
    actionUrl: `/admin/clients/${user.id}`,
  })

  return apiCreated(user)
})
