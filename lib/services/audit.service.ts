import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

// ─── Audit Service ─────────────────────────────────────────────────

export const AuditService = {
  async log(params: {
    adminId?: string
    action: string
    entityType: string
    entityId: string
    oldValues?: Record<string, unknown>
    newValues?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
  }) {
    return prisma.auditLog.create({
      data: {
        adminId: params.adminId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValues: (params.oldValues || undefined) as Prisma.InputJsonValue | undefined,
        newValues: (params.newValues || undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    })
  },

  async getLogs(params: {
    adminId?: string
    action?: string
    entityType?: string
    entityId?: string
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  }) {
    const { adminId, action, entityType, entityId, startDate, endDate, page = 1, limit = 20 } = params

    const where: Record<string, unknown> = {}
    if (adminId) where.adminId = adminId
    if (action) where.action = action
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ])

    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async getEntityHistory(entityType: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      include: {
        admin: { select: { id: true, name: true, email: true } },
      },
    })
  },

  async getStats() {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [todayCount, weekCount, totalCount] = await Promise.all([
      prisma.auditLog.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.auditLog.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.auditLog.count(),
    ])

    return { todayCount, weekCount, totalCount }
  },
}
