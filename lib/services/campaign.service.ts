import { prisma } from '@/lib/db'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import type { Prisma } from '@prisma/client'
import { NotFoundError, ConflictError } from '@/lib/api-response'

// ─── SES Configuration ─────────────────────────────────────────────

const ses = new SESClient({
  region: process.env.AWS_SES_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SES_SECRET_KEY || '',
  },
})

const DEFAULT_FROM = process.env.EMAIL_FROM || 'noreply@bilanix.com'
const DEFAULT_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Bilanix'
const BATCH_SIZE = 50
const RETRY_LIMIT = 3

// ─── Recipient Types ───────────────────────────────────────────────

export type RecipientType = 'single' | 'multiple' | 'subscription_group' | 'csv'

interface RecipientEntry {
  email: string
  name?: string
  userId?: string
}

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
        select: {
          id: true,
          name: true,
          subject: true,
          status: true,
          type: true,
          recipientType: true,
          totalRecipients: true,
          totalSent: true,
          totalOpened: true,
          totalClicked: true,
          sentAt: true,
          createdAt: true,
          createdBy: true,
        },
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
    recipientType?: RecipientType
    targetFilter?: Record<string, unknown>
    recipients?: RecipientEntry[]
    createdBy?: string
  }) {
    return prisma.campaign.create({
      data: {
        name: data.name.trim(),
        subject: data.subject.trim(),
        body: data.body,
        type: data.type || 'email',
        recipientType: data.recipientType || 'subscription_group',
        targetFilter: data.targetFilter as Prisma.InputJsonValue | undefined,
        createdBy: data.createdBy || null,
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

  // ─── Subscription Group Recipients (live client data) ──────────

  async getSubscriptionGroupRecipients(group: string) {
    const userWhere: Prisma.UserWhereInput = { deletedAt: null }
    const now = new Date()

    switch (group) {
      case 'active':
        userWhere.subscriptions = { some: { status: 'active' } }
        break
      case 'inactive':
        userWhere.status = 'inactive'
        break
      case 'expiring_soon': {
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        userWhere.subscriptions = {
          some: {
            status: 'active',
            endDate: { gte: now, lte: thirtyDays },
          },
        }
        break
      }
      case 'all':
      default:
        break
    }

    const users = await prisma.user.findMany({
      where: userWhere,
      select: { id: true, name: true, email: true },
    })

    return users.map((u) => ({ email: u.email, name: u.name, userId: u.id }))
  },

  // ─── Prepare Recipients (resolve all types to email list) ──────

  async resolveRecipients(
    recipientType: RecipientType,
    targetFilter: Record<string, unknown> | null,
    directRecipients?: RecipientEntry[]
  ): Promise<RecipientEntry[]> {
    const seen = new Set<string>()
    const result: RecipientEntry[] = []

    const addUnique = (entry: RecipientEntry) => {
      const normalized = entry.email.toLowerCase().trim()
      if (!seen.has(normalized) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        seen.add(normalized)
        result.push({ ...entry, email: normalized })
      }
    }

    switch (recipientType) {
      case 'single':
      case 'multiple':
      case 'csv': {
        const storedRecipients = (targetFilter?.recipients as RecipientEntry[]) || []
        if (directRecipients && directRecipients.length > 0) {
          for (const r of directRecipients) addUnique(r)
        } else if (storedRecipients.length > 0) {
          for (const r of storedRecipients) addUnique(r)
        }
        break
      }

      case 'subscription_group': {
        const filter = targetFilter || {}
        const group = (filter.group as string) || 'all'
        const recipients = await this.getSubscriptionGroupRecipients(group)
        for (const r of recipients) addUnique(r)
        break
      }
    }

    return result
  },

  // ─── Prepare & Create Recipients for Sending ───────────────────

  async prepareRecipients(id: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id } })
    if (!campaign) throw new NotFoundError('Campaign')
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new ConflictError('Campaign already sent or sending')
    }

    const filter = (campaign.targetFilter as Record<string, unknown>) || {}
    const recipients = await this.resolveRecipients(
      campaign.recipientType as RecipientType,
      filter
    )

    if (recipients.length === 0) throw new ConflictError('No recipients match the target filter')

    await prisma.$transaction([
      prisma.campaignRecipient.deleteMany({ where: { campaignId: id } }),
      prisma.campaignRecipient.createMany({
        data: recipients.map((r) => ({
          campaignId: id,
          userId: r.userId || null,
          email: r.email,
          name: r.name || null,
          status: 'queued',
        })),
      }),
      prisma.campaign.update({
        where: { id },
        data: { totalRecipients: recipients.length, status: 'sending' },
      }),
    ])

    return { totalRecipients: recipients.length }
  },

  // ─── Send Campaign via SES (batch + retry) ─────────────────────

  async sendCampaign(id: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id } })
    if (!campaign) throw new NotFoundError('Campaign')
    if (campaign.status !== 'sending') {
      throw new ConflictError('Campaign is not in sending state')
    }

    const queuedRecipients = await prisma.campaignRecipient.findMany({
      where: { campaignId: id, status: 'queued' },
      orderBy: { createdAt: 'asc' },
    })

    if (queuedRecipients.length === 0) {
      await this.markSent(id)
      return { sent: 0, failed: 0 }
    }

    let totalSent = 0
    let totalFailed = 0

    // Process in batches
    for (let i = 0; i < queuedRecipients.length; i += BATCH_SIZE) {
      const batch = queuedRecipients.slice(i, i + BATCH_SIZE)

      const results = await Promise.allSettled(
        batch.map(async (recipient) => {
          try {
            await prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: { status: 'sending' },
            })

            const command = new SendEmailCommand({
              Source: `${DEFAULT_FROM_NAME} <${DEFAULT_FROM}>`,
              Destination: { ToAddresses: [recipient.email] },
              Message: {
                Subject: { Data: campaign.subject, Charset: 'UTF-8' },
                Body: { Html: { Data: campaign.body, Charset: 'UTF-8' } },
              },
            })

            await ses.send(command)

            await prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: { status: 'sent', sentAt: new Date() },
            })

            totalSent++
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            await prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: { status: 'failed', failedAt: new Date(), failureReason: message },
            })
            totalFailed++
          }
        })
      )

      // Count any Promise rejections
      for (const r of results) {
        if (r.status === 'rejected') {
          totalFailed++
          totalSent = Math.max(0, totalSent - 1)
        }
      }
    }

    // Update campaign totals
    await prisma.campaign.update({
      where: { id },
      data: {
        totalSent,
        totalFailed,
        totalDelivered: totalSent,
        status: totalFailed === 0 ? 'sent' : (totalSent > 0 ? 'sent' : 'failed'),
        sentAt: new Date(),
      },
    })

    return { sent: totalSent, failed: totalFailed }
  },

  // ─── Retry Failed Sends ────────────────────────────────────────

  async retryFailed(id: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id } })
    if (!campaign) throw new NotFoundError('Campaign')

    const failedRecipients = await prisma.campaignRecipient.findMany({
      where: {
        campaignId: id,
        status: 'failed',
      },
      take: 50,
    })

    if (failedRecipients.length === 0) return { retried: 0 }

    let retried = 0
    for (const recipient of failedRecipients) {
      try {
        const command = new SendEmailCommand({
          Source: `${DEFAULT_FROM_NAME} <${DEFAULT_FROM}>`,
          Destination: { ToAddresses: [recipient.email] },
          Message: {
            Subject: { Data: campaign.subject, Charset: 'UTF-8' },
            Body: { Html: { Data: campaign.body, Charset: 'UTF-8' } },
          },
        })

        await ses.send(command)

        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: { status: 'sent', sentAt: new Date(), failedAt: null, failureReason: null },
        })

        retried++
      } catch {
        // Leave as failed
      }
    }

    if (retried > 0) {
      await prisma.campaign.update({
        where: { id },
        data: {
          totalSent: { increment: retried },
          totalFailed: { decrement: retried },
        },
      })
    }

    return { retried }
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
        recipientType: true,
        sentAt: true,
        createdBy: true,
        totalRecipients: true,
        totalSent: true,
        totalDelivered: true,
        totalOpened: true,
        totalClicked: true,
        totalBounced: true,
        totalFailed: true,
        createdAt: true,
      },
    })

    return campaigns.map((c) => ({
      ...c,
      sentAt: c.sentAt?.toISOString() || null,
      createdAt: c.createdAt.toISOString(),
      openRate: c.totalSent > 0 ? Math.round((c.totalOpened / c.totalSent) * 100) : 0,
      clickRate: c.totalSent > 0 ? Math.round((c.totalClicked / c.totalSent) * 100) : 0,
      bounceRate: c.totalSent > 0 ? Math.round((c.totalBounced / c.totalSent) * 100) : 0,
      deliveryRate: c.totalSent > 0 ? Math.round((c.totalDelivered / c.totalSent) * 100) : 0,
    }))
  },
}
