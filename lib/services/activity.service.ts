import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

// ─── Activity Service ──────────────────────────────────────────────

export const ActivityService = {
  async log(params: {
    adminId?: string
    action: string
    entityType?: string
    entityId?: string
    description?: string
    metadata?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
  }) {
    return prisma.activityLog.create({
      data: {
        adminId: params.adminId || null,
        action: params.action,
        entityType: params.entityType || null,
        entityId: params.entityId || null,
        description: params.description || null,
        metadata: (params.metadata || undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    })
  },

  async getRecent(params?: { limit?: number; adminId?: string }) {
    const where: Record<string, unknown> = {}
    if (params?.adminId) where.adminId = params.adminId

    return prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params?.limit || 50,
      include: {
        admin: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    })
  },

  async getByEntity(entityType: string, entityId: string) {
    return prisma.activityLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    })
  },

  async getStats() {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [todayCount, weekCount, totalCount, topActions] = await Promise.all([
      prisma.activityLog.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.activityLog.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.activityLog.count(),
      prisma.activityLog.groupBy({
        by: ['action'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ])

    return { todayCount, weekCount, totalCount, topActions }
  },

  async search(params: {
    query?: string
    action?: string
    adminId?: string
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  }) {
    const { query, action, adminId, startDate, endDate, page = 1, limit = 20 } = params

    const where: Record<string, unknown> = {}
    if (action) where.action = action
    if (adminId) where.adminId = adminId
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      }
    }
    if (query) {
      where.OR = [
        { description: { contains: query, mode: 'insensitive' } },
        { action: { contains: query, mode: 'insensitive' } },
      ]
    }

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.activityLog.count({ where }),
    ])

    return { activities, total, page, limit, totalPages: Math.ceil(total / limit) }
  },
}
