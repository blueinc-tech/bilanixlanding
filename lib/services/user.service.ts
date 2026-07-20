import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { NotFoundError, ConflictError } from '@/lib/api-response'
import type { UserListParams, UserListItem, UserDetail } from '@/types/user'

// ─── User Service ─────────────────────────────────────────────────

export const UserService = {
  async list(params: UserListParams) {
    const { page = 1, limit = 20, search, status, plan, sortBy = 'createdAt', sortOrder = 'desc' } = params
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { deletedAt: null }

    if (status) where.status = status

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (plan) {
      where.subscriptions = { some: { planName: plan, status: 'active' } }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          company: true,
          avatar: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          country: true,
          industry: true,
          subscriptions: {
            where: { status: 'active' },
            take: 1,
            select: { planName: true, status: true, amount: true },
          },
          paymentLogs: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { status: true, gateway: true, amount: true, createdAt: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    const formatted: UserListItem[] = (users as (typeof users[number] & { subscriptions: { planName: string; status: string; amount: number }[]; paymentLogs: { status: string; gateway: string | null; amount: number; createdAt: Date }[] })[]).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      company: u.company,
      country: u.country,
      industry: u.industry,
      avatar: u.avatar,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
      lastLoginAt: u.lastLoginAt?.toISOString() || null,
      subscription: u.subscriptions[0] || null,
      lastPayment: u.paymentLogs[0]
        ? {
            status: u.paymentLogs[0].status,
            gateway: u.paymentLogs[0].gateway,
            amount: u.paymentLogs[0].amount,
            createdAt: u.paymentLogs[0].createdAt.toISOString(),
          }
        : null,
    }))

    return { users: formatted, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async getById(id: string): Promise<UserDetail> {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!user) throw new NotFoundError('User')

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company,
      avatar: user.avatar,
      status: user.status,
      emailVerified: user.emailVerified?.toISOString() || null,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      lastLoginIp: user.lastLoginIp,
      country: user.country,
      industry: user.industry,
      metadata: user.metadata as Record<string, unknown> | null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      subscriptions: user.subscriptions.map((s) => ({
        id: s.id,
        planName: s.planName,
        status: s.status,
        startDate: s.startDate.toISOString(),
        endDate: s.endDate?.toISOString() || null,
        cancelledAt: s.cancelledAt?.toISOString() || null,
        paymentMethod: s.paymentMethod,
        amount: s.amount,
        currency: s.currency,
      })),
    }
  },

  async create(data: { name: string; email: string; password?: string; phone?: string; company?: string; country?: string; industry?: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    })
    if (existing) throw new ConflictError('A user with this email already exists')

    const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : null

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        phone: data.phone || null,
        company: data.company || null,
        country: data.country || null,
        industry: data.industry || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        country: true,
        industry: true,
        status: true,
        createdAt: true,
      },
    })

    return { ...user, createdAt: user.createdAt.toISOString() }
  },

  async update(id: string, data: { name?: string; email?: string; phone?: string; company?: string; status?: string; country?: string; industry?: string }) {
    const user = await prisma.user.findUnique({ where: { id, deletedAt: null } })
    if (!user) throw new NotFoundError('User')

    if (data.email && data.email.toLowerCase().trim() !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase().trim() },
      })
      if (existing) throw new ConflictError('A user with this email already exists')
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.email && { email: data.email.toLowerCase().trim() }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.company !== undefined && { company: data.company || null }),
        ...(data.status && { status: data.status }),
        ...(data.country !== undefined && { country: data.country || null }),
        ...(data.industry !== undefined && { industry: data.industry || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        country: true,
        industry: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return { ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() }
  },

  async softDelete(id: string) {
    const user = await prisma.user.findUnique({ where: { id, deletedAt: null } })
    if (!user) throw new NotFoundError('User')

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'inactive' },
    })

    return true
  },

  async bulkAction(action: string, userIds: string[]) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, deletedAt: null },
    })
    if (users.length === 0) throw new NotFoundError('Users')

    switch (action) {
      case 'activate':
        await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { status: 'active' } })
        break
      case 'deactivate':
        await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { status: 'inactive' } })
        break
      case 'suspend':
        await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { status: 'suspended' } })
        break
      case 'delete':
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { deletedAt: new Date(), status: 'inactive' },
        })
        break
    }

    return { affected: users.length }
  },

  async getStats() {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [totalUsers, activeUsers, suspendedUsers, newUsersThisMonth, totalSubscriptions, activeSubscriptions] =
      await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.user.count({ where: { status: 'active', deletedAt: null } }),
        prisma.user.count({ where: { status: 'suspended', deletedAt: null } }),
        prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null } }),
        prisma.subscription.count({ where: { user: { deletedAt: null } } }),
        prisma.subscription.count({ where: { status: 'active', user: { deletedAt: null } } }),
      ])

    return { totalUsers, activeUsers, suspendedUsers, newUsersThisMonth, totalSubscriptions, activeSubscriptions }
  },

  async impersonateStart(adminId: string, userId: string, reason: string | undefined, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId, deletedAt: null } })
    if (!user) throw new NotFoundError('User')

    const log = await prisma.impersonationLog.create({
      data: {
        adminId,
        userId,
        reason: reason || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    })

    return { logId: log.id, user: { id: user.id, name: user.name, email: user.email } }
  },

  async impersonateEnd(logId: string) {
    const log = await prisma.impersonationLog.findUnique({ where: { id: logId } })
    if (!log) throw new NotFoundError('Impersonation session')

    await prisma.impersonationLog.update({
      where: { id: logId },
      data: { endedAt: new Date() },
    })

    return true
  },

  async getRecentActivity(userId: string, limit = 20) {
    return prisma.activityLog.findMany({
      where: { entityType: 'user', entityId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  },
}
