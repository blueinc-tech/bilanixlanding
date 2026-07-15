import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { NotFoundError } from '@/lib/api-response'

// ─── Notification Service ─────────────────────────────────────────

export const NotificationService = {
  async list(params: { adminId?: string; unreadOnly?: boolean; page?: number; limit?: number }) {
    const { adminId, unreadOnly, page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (adminId) where.adminId = adminId
    if (unreadOnly) where.readAt = null

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...(adminId && { adminId }), readAt: null } }),
    ])

    return { notifications, total, unreadCount, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async create(data: {
    adminId?: string
    title: string
    message: string
    type?: string
    actionUrl?: string
    metadata?: Record<string, unknown>
  }) {
    return prisma.notification.create({
      data: {
        adminId: data.adminId || null,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        actionUrl: data.actionUrl || null,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    })
  },

  async markRead(id: string) {
    const notification = await prisma.notification.findUnique({ where: { id } })
    if (!notification) throw new NotFoundError('Notification')

    return prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    })
  },

  async markAllRead(adminId?: string) {
    const where: Record<string, unknown> = { readAt: null }
    if (adminId) where.adminId = adminId

    await prisma.notification.updateMany({
      where,
      data: { readAt: new Date() },
    })

    return true
  },

  async delete(id: string) {
    await prisma.notification.delete({ where: { id } })
    return true
  },

  async deleteAll(adminId?: string) {
    const where: Record<string, unknown> = {}
    if (adminId) where.adminId = adminId

    await prisma.notification.deleteMany({ where })
    return true
  },

  async getStats(adminId?: string) {
    const where: Record<string, unknown> = {}
    if (adminId) where.adminId = adminId

    const [total, unread, info, success, warning, error] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, readAt: null } }),
      prisma.notification.count({ where: { ...where, type: 'info' } }),
      prisma.notification.count({ where: { ...where, type: 'success' } }),
      prisma.notification.count({ where: { ...where, type: 'warning' } }),
      prisma.notification.count({ where: { ...where, type: 'error' } }),
    ])

    return { total, unread, info, success, warning, error }
  },
}
