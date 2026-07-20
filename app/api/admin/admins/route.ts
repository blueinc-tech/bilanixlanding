import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiCreated, apiForbidden } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { AdminManagementService } from '@/lib/services/admin-management.service'
import { ActivityService } from '@/lib/services/activity.service'
import { AuditService } from '@/lib/services/audit.service'
import { NotificationService } from '@/lib/services/notification.service'
import { parseQuery } from '@/lib/validation'
import { paginationSchema } from '@/lib/validation'
import { ROLES, MODULES, type ModuleName } from '@/types/admin'

const listSchema = paginationSchema.extend({
  status: z.string().optional(),
  role: z.string().optional(),
})

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  if (auth.admin.role !== ROLES.SUPER_ADMIN) {
    return apiForbidden('Only super admins can manage administrators')
  }

  const parsed = parseQuery(req.url, listSchema)
  if (!parsed.success) return parsed.response

  const result = await AdminManagementService.list({
    page: parsed.data.page ?? 1,
    limit: parsed.data.limit ?? 20,
    search: parsed.data.search,
    sortBy: parsed.data.sortBy,
    sortOrder: parsed.data.sortOrder ?? 'desc',
    status: parsed.data.status,
    role: parsed.data.role,
  })

  return apiSuccess(result.admins, 200, {
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  })
})

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  role: z.enum(['super_admin', 'admin']),
  status: z.enum(['active', 'suspended']).optional(),
  assignedModules: z.array(z.string()).optional(),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  if (auth.admin.role !== ROLES.SUPER_ADMIN) {
    return apiForbidden('Only super admins can create administrators')
  }

  const body = await req.json().catch(() => ({}))
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return apiSuccess({ created: false, errors: parsed.error.flatten().fieldErrors })
  }

  const data = parsed.data

  if (data.role === ROLES.SUPER_ADMIN && auth.admin.role !== ROLES.SUPER_ADMIN) {
    return apiForbidden('Only super admins can create super admin accounts')
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'

  const admin = await AdminManagementService.create({
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    role: data.role,
    status: data.status,
    assignedModules: data.assignedModules as ModuleName[] | undefined,
  })

  await ActivityService.log({
    adminId: auth.admin.id,
    action: 'admins.create',
    entityType: 'admin',
    entityId: admin.id,
    description: `Created admin ${admin.email} with role ${admin.role}`,
    ipAddress: ip,
    userAgent,
  })

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'create',
    entityType: 'admin',
    entityId: admin.id,
    newValues: { name: admin.name, email: admin.email, role: admin.role, status: admin.status },
    ipAddress: ip,
    userAgent,
  })

  await NotificationService.create({
    title: 'Admin Account Created',
    message: `New admin account "${admin.email}" was created with role "${admin.role}".`,
    type: 'info',
    actionUrl: `/admin/admins`,
  })

  return apiSuccess(admin, 201)
})
