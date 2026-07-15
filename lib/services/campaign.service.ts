import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import { NotFoundError, ConflictError } from '@/lib/api-response'

// ─── Campaign Service ─────────────────────────────────────────────

export const CampaignService = {
  async list(params: { status?: string; search?: string; page?: number; limit?: number }) {
    const { status, search, page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const where: Prisma.CampaignWhereInput = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ])

    return { campaigns, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async getById(id: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id } })
    if (!campaign) throw new NotFoundError('Campaign')
    return campaign
  },

  async getWithRecipients(id: string, recipientPage = 1, recipientLimit = 50) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        recipients: {
          orderBy: { createdAt: 'desc' },
          skip: (recipientPage - 1) * recipientLimit,
          take: recipientLimit,
        },
      },
    })
    if (!campaign) throw new NotFoundError('Campaign')

    const totalRecipients = await prisma.campaignRecipient.count({ where: { campaignId: id } })

    return {
      ...campaign,
      recipientMeta: {
        total: totalRecipients,
        page: recipientPage,
        limit: recipientLimit,
        totalPages: Math.ceil(totalRecipients / recipientLimit),
      },
    }
  },

  async create(data: {
    name: string
    subject: string
    body: string
    type?: string
    targetFilter?: Record<string, unknown>
  }) {
    return prisma.campaign.create({
      data: {
        name: data.name.trim(),
        subject: data.subject.trim(),
        body: data.body,
        type: data.type || 'email',
        targetFilter: data.targetFilter as Prisma.InputJsonValue | undefined,
      },
    })
  },

  async update(id: string, data: {
    name?: string
    subject?: string
    body?: string
    targetFilter?: Record<string, unknown>
  }) {
    const campaign = await prisma.campaign.findUnique({ where: { id } })
    if (!campaign) throw new NotFoundError('Campaign')
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new ConflictError('Cannot edit a campaign that has already been sent')
    }

    return prisma.campaign.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.subject !== undefined && { subject: data.subject.trim() }),
        ...(data.body !== undefined && { body: data.body }),
        ...(data.targetFilter !== undefined && { targetFilter: data.targetFilter as Prisma.InputJsonValue }),
      },
    })
  },

  async delete(id: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id } })
    if (!campaign) throw new NotFoundError('Campaign')
    if (campaign.status === 'sending') {
      throw new ConflictError('Cannot delete a campaign that is currently sending')
    }
    await prisma.campaign.delete({ where: { id } })
    return true
  },

  async schedule(id: string, scheduledAt: Date) {
    const campaign = await prisma.campaign.findUnique({ where: { id } })
    if (!campaign) throw new NotFoundError('Campaign')
    if (campaign.status !== 'draft') {
      throw new ConflictError('Only draft campaigns can be scheduled')
    }

    return prisma.campaign.update({
      where: { id },
      data: { status: 'scheduled', scheduledAt },
    })
  },

  async prepareRecipients(id: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id } })
    if (!campaign) throw new NotFoundError('Campaign')
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new ConflictError('Campaign already sent or sending')
    }

    const filter = (campaign.targetFilter as Record<string, unknown>) || {}
    const userWhere: Prisma.UserWhereInput = { deletedAt: null }

    if (filter.status) userWhere.status = filter.status as string
    if (filter.plan) {
      userWhere.subscriptions = { some: { planName: filter.plan as string, status: 'active' } }
    }

    const users = await prisma.user.findMany({
      where: userWhere,
      select: { id: true, name: true, email: true },
    })

    if (users.length === 0) throw new ConflictError('No recipients match the target filter')

    await prisma.$transaction([
      prisma.campaignRecipient.deleteMany({ where: { campaignId: id } }),
      prisma.campaignRecipient.createMany({
        data: users.map((u) => ({
          campaignId: id,
          userId: u.id,
          email: u.email,
          name: u.name,
          status: 'queued',
        })),
      }),
      prisma.campaign.update({
        where: { id },
        data: { totalRecipients: users.length, status: 'sending' },
      }),
    ])

    return { totalRecipients: users.length }
  },

  async markSent(id: string) {
    return prisma.campaign.update({
      where: { id },
      data: { status: 'sent', sentAt: new Date() },
    })
  },

  async markFailed(id: string) {
    return prisma.campaign.update({
      where: { id },
      data: { status: 'failed', failedAt: new Date() },
    })
  },

  async getCampaignStats() {
    const [total, draft, scheduled, sending, sent, failed] = await Promise.all([
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'draft' } }),
      prisma.campaign.count({ where: { status: 'scheduled' } }),
      prisma.campaign.count({ where: { status: 'sending' } }),
      prisma.campaign.count({ where: { status: 'sent' } }),
      prisma.campaign.count({ where: { status: 'failed' } }),
    ])

    return { total, draft, scheduled, sending, sent, failed }
  },

  async getCampaignPerformance() {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'sent' },
      orderBy: { sentAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        subject: true,
        sentAt: true,
        totalRecipients: true,
        totalSent: true,
        totalDelivered: true,
        totalOpened: true,
        totalClicked: true,
        totalBounced: true,
        totalFailed: true,
      },
    })

    return campaigns.map((c) => ({
      ...c,
      sentAt: c.sentAt?.toISOString() || null,
      openRate: c.totalSent > 0 ? Math.round((c.totalOpened / c.totalSent) * 100) : 0,
      clickRate: c.totalSent > 0 ? Math.round((c.totalClicked / c.totalSent) * 100) : 0,
      bounceRate: c.totalSent > 0 ? Math.round((c.totalBounced / c.totalSent) * 100) : 0,
      deliveryRate: c.totalSent > 0 ? Math.round((c.totalDelivered / c.totalSent) * 100) : 0,
    }))
  },
}
