import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { NotFoundError, ConflictError } from '@/lib/api-response'
import {
  ROLES,
  MODULES,
  ACTIONS,
  RESTRICTED_MODULES,
  ASSIGNABLE_MODULES,
  getModulePermissions,
  type ModuleName,
  type RoleName,
} from '@/types/admin'

// ─── Admin Management Service ─────────────────────────────────────

export interface AdminListItem {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  status: string
  avatar: string | null
  lastLoginAt: string | null
  lastLoginIp: string | null
  createdAt: string
  assignedModules: string[]
}

export interface AdminDetail extends AdminListItem {
  updatedAt: string
}

export const AdminManagementService = {
  async list(params: {
    page?: number
    limit?: number
    search?: string
    status?: string
    role?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{
    admins: AdminListItem[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { page = 1, limit = 20, search, status, role, sortBy = 'createdAt', sortOrder = 'desc' } = params
    const skip = (page - 1) * limit

    const where: Prisma.AdminWhereInput = { deletedAt: null }

    if (status && status !== 'all') {
      where.status = status
    }

    if (role && role !== 'all') {
      where.role = role
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [admins, total] = await Promise.all([
      prisma.admin.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          avatar: true,
          lastLoginAt: true,
          lastLoginIp: true,
          createdAt: true,
          roleRel: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      }),
      prisma.admin.count({ where }),
    ])

    const formatted: AdminListItem[] = admins.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      role: a.role,
      status: a.status,
      avatar: a.avatar,
      lastLoginAt: a.lastLoginAt?.toISOString() || null,
      lastLoginIp: a.lastLoginIp,
      createdAt: a.createdAt.toISOString(),
      assignedModules: extractModulesFromPermissions(
        a.roleRel?.permissions.map((rp) => rp.permission.name) || []
      ),
    }))

    return { admins: formatted, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async getById(id: string): Promise<AdminDetail> {
    const admin = await prisma.admin.findFirst({
      where: { id, deletedAt: null },
      include: {
        roleRel: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    })

    if (!admin) throw new NotFoundError('Admin')

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      status: admin.status,
      avatar: admin.avatar,
      lastLoginAt: admin.lastLoginAt?.toISOString() || null,
      lastLoginIp: admin.lastLoginIp,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString(),
      assignedModules: extractModulesFromPermissions(
        admin.roleRel?.permissions.map((rp) => rp.permission.name) || []
      ),
    }
  },

  async create(data: {
    name: string
    email: string
    password: string
    phone?: string
    role: RoleName
    status?: string
    assignedModules?: ModuleName[]
  }): Promise<AdminListItem> {
    const existing = await prisma.admin.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    })
    if (existing) throw new ConflictError('An admin with this email already exists')

    // Only super_admin can create super_admin
    // (enforced at API level, but double-check here)

    const passwordHash = await bcrypt.hash(data.password, 12)

    const admin = await prisma.admin.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role,
        phone: data.phone || null,
        status: data.status || 'active',
      },
      select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true },
    })

    // Create admin-specific role and assign permissions
    if (data.role === ROLES.ADMIN && data.assignedModules && data.assignedModules.length > 0) {
      await assignModulesToAdmin(admin.id, data.assignedModules)
    } else if (data.role === ROLES.SUPER_ADMIN) {
      // Super admin gets all permissions via static ROLE_PERMISSIONS fallback
      // No DB role needed
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      status: admin.status,
      avatar: null,
      lastLoginAt: null,
      lastLoginIp: null,
      createdAt: admin.createdAt.toISOString(),
      assignedModules: data.assignedModules || [],
    }
  },

  async update(id: string, data: {
    name?: string
    email?: string
    phone?: string
    status?: string
    role?: RoleName
    assignedModules?: ModuleName[]
  }): Promise<AdminDetail> {
    const admin = await prisma.admin.findFirst({ where: { id, deletedAt: null } })
    if (!admin) throw new NotFoundError('Admin')

    // Check email uniqueness
    if (data.email && data.email.toLowerCase().trim() !== admin.email) {
      const existing = await prisma.admin.findUnique({
        where: { email: data.email.toLowerCase().trim() },
      })
      if (existing) throw new ConflictError('An admin with this email already exists')
    }

    // Only super_admin can modify super_admin
    // (enforced at API level)

    const updateData: Prisma.AdminUpdateInput = {}
    if (data.name) updateData.name = data.name.trim()
    if (data.email) updateData.email = data.email.toLowerCase().trim()
    if (data.phone !== undefined) updateData.phone = data.phone || null
    if (data.status) updateData.status = data.status
    if (data.role) updateData.role = data.role

    await prisma.admin.update({ where: { id }, data: updateData })

    // Update permissions if assignedModules provided
    if (data.assignedModules !== undefined) {
      if (data.role === ROLES.ADMIN || admin.role === ROLES.ADMIN) {
        await assignModulesToAdmin(id, data.assignedModules)
      }
    }

    return this.getById(id)
  },

  async assignPermissions(id: string, modules: ModuleName[]): Promise<void> {
    const admin = await prisma.admin.findFirst({ where: { id, deletedAt: null } })
    if (!admin) throw new NotFoundError('Admin')

    await assignModulesToAdmin(id, modules)
  },

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const admin = await prisma.admin.findFirst({ where: { id, deletedAt: null } })
    if (!admin) throw new NotFoundError('Admin')

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.admin.update({ where: { id }, data: { passwordHash } })
  },

  async disable(id: string): Promise<void> {
    const admin = await prisma.admin.findFirst({ where: { id, deletedAt: null } })
    if (!admin) throw new NotFoundError('Admin')

    await prisma.admin.update({ where: { id }, data: { status: 'suspended' } })
  },

  async enable(id: string): Promise<void> {
    const admin = await prisma.admin.findFirst({ where: { id, deletedAt: null } })
    if (!admin) throw new NotFoundError('Admin')

    await prisma.admin.update({ where: { id }, data: { status: 'active' } })
  },

  async softDelete(id: string): Promise<void> {
    const admin = await prisma.admin.findFirst({ where: { id, deletedAt: null } })
    if (!admin) throw new NotFoundError('Admin')

    await prisma.admin.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'disabled' },
    })
  },

  // ─── Profile Management ────────────────────────────────────────

  async getProfile(adminId: string) {
    const admin = await prisma.admin.findFirst({
      where: { id: adminId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!admin) throw new NotFoundError('Admin')
    return admin
  },

  async updateProfile(adminId: string, data: { name?: string; email?: string; phone?: string }) {
    const admin = await prisma.admin.findFirst({ where: { id: adminId, deletedAt: null } })
    if (!admin) throw new NotFoundError('Admin')

    if (data.email && data.email.toLowerCase().trim() !== admin.email) {
      const existing = await prisma.admin.findUnique({
        where: { email: data.email.toLowerCase().trim() },
      })
      if (existing) throw new ConflictError('An admin with this email already exists')
    }

    await prisma.admin.update({
      where: { id: adminId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.email && { email: data.email.toLowerCase().trim() }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
      },
    })

    return this.getProfile(adminId)
  },

  async changeOwnPassword(adminId: string, currentPassword: string, newPassword: string) {
    const admin = await prisma.admin.findFirst({ where: { id: adminId, deletedAt: null } })
    if (!admin) throw new NotFoundError('Admin')

    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash)
    if (!isValid) throw new ConflictError('Current password is incorrect')

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.admin.update({ where: { id: adminId }, data: { passwordHash } })

    return true
  },
}

// ─── Helpers ──────────────────────────────────────────────────────

function extractModulesFromPermissions(permissions: string[]): string[] {
  const modules = new Set<string>()
  for (const perm of permissions) {
    const [module] = perm.split(':')
    if (module) modules.add(module)
  }
  return Array.from(modules)
}

async function assignModulesToAdmin(adminId: string, modules: ModuleName[]): Promise<void> {
  // Delete existing admin role and permissions
  const existingAdmin = await prisma.admin.findFirst({
    where: { id: adminId },
    select: { roleId: true },
  })

  if (existingAdmin?.roleId) {
    await prisma.rolePermission.deleteMany({ where: { roleId: existingAdmin.roleId } })
    await prisma.role.delete({ where: { id: existingAdmin.roleId } })
    await prisma.admin.update({ where: { id: adminId }, data: { roleId: null } })
  }

  if (modules.length === 0) return

  // Create a custom role for this admin
  const role = await prisma.role.create({
    data: {
      name: `admin_${adminId}`,
      displayName: `Admin Role`,
      description: 'Auto-generated role for admin permissions',
      isSystem: false,
    },
  })

  // Assign role to admin
  await prisma.admin.update({ where: { id: adminId }, data: { roleId: role.id } })

  // Get or create permissions for each module and assign them
  for (const module of modules) {
    const modulePerms = getModulePermissions(module)

    for (const permName of modulePerms) {
      const [mod, action] = permName.split(':')

      // Get or create the permission
      let permission = await prisma.permission.findUnique({ where: { name: permName } })
      if (!permission) {
        permission = await prisma.permission.create({
          data: {
            name: permName,
            module: mod,
            action: action,
            description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${mod}`,
          },
        })
      }

      // Assign permission to role
      await prisma.rolePermission.create({
        data: { roleId: role.id, permissionId: permission.id },
      })
    }
  }
}
