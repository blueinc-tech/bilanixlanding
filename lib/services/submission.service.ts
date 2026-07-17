import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import type { PaginationInput } from '@/lib/validation'

// ─── Submission Types ──────────────────────────────────────────────

export type SubmissionStatus = 'new' | 'in_progress' | 'responded' | 'archived'

export interface SubmissionListItem {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string | null
  phone: string | null
  message: string | null
  inquiryType: string
  isRead: boolean
  status: string
  viewedAt: Date | null
  respondedAt: Date | null
  createdAt: Date
}

export interface SubmissionDetail extends SubmissionListItem {
  deletedAt: Date | null
  updatedAt: Date
}

// ─── Submission Service ────────────────────────────────────────────

export const SubmissionService = {
  async list(params: PaginationInput & {
    status?: string
    inquiryType?: string
    isRead?: string
  }): Promise<{
    submissions: SubmissionListItem[]
    total: number
    page: number
    limit: number
    totalPages: number
    stats: { total: number; unread: number; responded: number; newToday: number }
  }> {
    const { page, limit, search, sortBy, sortOrder, status, inquiryType, isRead } = params

    const where: Prisma.ContactSubmissionWhereInput = {
      deletedAt: null,
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (inquiryType && inquiryType !== 'all') {
      where.inquiryType = inquiryType
    }

    if (isRead === 'unread') {
      where.isRead = false
    } else if (isRead === 'read') {
      where.isRead = true
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }

    const orderBy: Prisma.ContactSubmissionOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder || 'desc' }
      : { createdAt: 'desc' }

    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
          phone: true,
          message: true,
          inquiryType: true,
          isRead: true,
          status: true,
          viewedAt: true,
          respondedAt: true,
          createdAt: true,
        },
      }),
      prisma.contactSubmission.count({ where }),
    ])

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [unread, responded, newToday] = await Promise.all([
      prisma.contactSubmission.count({ where: { deletedAt: null, isRead: false } }),
      prisma.contactSubmission.count({ where: { deletedAt: null, status: 'responded' } }),
      prisma.contactSubmission.count({ where: { deletedAt: null, createdAt: { gte: todayStart } } }),
    ])

    return {
      submissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: { total, unread, responded, newToday },
    }
  },

  async getById(id: string): Promise<SubmissionDetail | null> {
    return prisma.contactSubmission.findFirst({
      where: { id, deletedAt: null },
    }) as Promise<SubmissionDetail | null>
  },

  async markAsRead(id: string): Promise<void> {
    await prisma.contactSubmission.update({
      where: { id },
      data: { isRead: true, viewedAt: new Date() },
    })
  },

  async updateStatus(id: string, status: SubmissionStatus): Promise<void> {
    const data: Prisma.ContactSubmissionUpdateInput = { status }
    if (status === 'responded') {
      data.respondedAt = new Date()
    }
    await prisma.contactSubmission.update({ where: { id }, data })
  },

  async softDelete(id: string): Promise<void> {
    await prisma.contactSubmission.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },

  async restore(id: string): Promise<void> {
    await prisma.contactSubmission.update({
      where: { id },
      data: { deletedAt: null },
    })
  },

  async permanentDelete(id: string): Promise<void> {
    await prisma.contactSubmission.delete({ where: { id } })
  },

  async bulkMarkRead(ids: string[]): Promise<void> {
    await prisma.contactSubmission.updateMany({
      where: { id: { in: ids } },
      data: { isRead: true, viewedAt: new Date() },
    })
  },

  async bulkDelete(ids: string[]): Promise<void> {
    await prisma.contactSubmission.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    })
  },
}
