import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

// ─── Payment Service (Admin-side operations) ───────────────────────

export interface PaymentListParams {
  gateway?: string
  status?: string
  type?: string
  plan?: string
  search?: string
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}

export const PaymentService = {
  async getPaymentHistory(params: PaymentListParams) {
    const { page = 1, limit = 20, gateway, status, type, plan, search, startDate, endDate } = params
    const skip = (page - 1) * limit

    const where: Prisma.PaymentLogWhereInput = {}

    if (gateway) where.gateway = gateway
    if (status) where.status = status
    if (type) where.type = type
    if (plan) where.planSlug = plan

    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      }
    }

    if (search) {
      where.OR = [
        { gatewayRef: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [payments, total] = await Promise.all([
      prisma.paymentLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.paymentLog.count({ where }),
    ])

    // Fetch user names for payments that have userId
    const userIds = [...new Set(payments.filter(p => p.userId).map(p => p.userId!))]
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : []
    const userMap = new Map(users.map(u => [u.id, { name: u.name, email: u.email }]))

    const paymentsWithUser = payments.map(p => ({
      ...p,
      user: p.userId ? userMap.get(p.userId) || null : null,
    }))

    return { payments: paymentsWithUser, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async getById(id: string) {
    return prisma.paymentLog.findUnique({ where: { id } })
  },

  async create(data: {
    userId?: string
    subscriptionId?: string
    planSlug?: string
    gateway?: string
    gatewayRef?: string
    amount: number
    currency?: string
    status?: string
    type?: string
    description?: string
    metadata?: Record<string, unknown>
    paidAt?: Date
  }) {
    return prisma.paymentLog.create({
      data: {
        userId: data.userId || null,
        subscriptionId: data.subscriptionId || null,
        planSlug: data.planSlug || null,
        gateway: data.gateway || null,
        gatewayRef: data.gatewayRef || null,
        amount: data.amount,
        currency: data.currency || 'NGN',
        status: data.status || 'pending',
        type: data.type || 'subscription',
        description: data.description || null,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
        paidAt: data.paidAt || null,
      },
    })
  },

  async updateStatus(id: string, status: string, metadata?: Record<string, unknown>) {
    const updateData: Record<string, unknown> = { status }
    if (status === 'paid') updateData.paidAt = new Date()
    if (status === 'failed') updateData.failedAt = new Date()
    if (status === 'refunded') updateData.refundedAt = new Date()
    if (metadata) updateData.metadata = metadata

    return prisma.paymentLog.update({ where: { id }, data: updateData as Prisma.PaymentLogUpdateInput })
  },

  async getRevenueStats(params?: { startDate?: Date; endDate?: Date }) {
    const where: Prisma.PaymentLogWhereInput = { status: 'paid' }
    if (params?.startDate || params?.endDate) {
      where.paidAt = {
        ...(params.startDate && { gte: params.startDate }),
        ...(params.endDate && { lte: params.endDate }),
      }
    }

    const [totalResult, gatewayStripe, gatewayPaystack, monthlyResult] = await Promise.all([
      prisma.paymentLog.aggregate({ where, _sum: { amount: true }, _count: { id: true } }),
      prisma.paymentLog.aggregate({ where: { ...where, gateway: 'stripe' }, _sum: { amount: true } }),
      prisma.paymentLog.aggregate({ where: { ...where, gateway: 'paystack' }, _sum: { amount: true } }),
      prisma.paymentLog.aggregate({
        where: {
          ...where,
          paidAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
    ])

    const totalRevenue = totalResult._sum.amount || 0
    const count = totalResult._count.id || 0

    return {
      totalRevenue,
      monthlyRevenue: monthlyResult._sum.amount || 0,
      averageRevenuePerUser: count > 0 ? totalRevenue / count : 0,
      totalTransactions: count,
      revenueByGateway: {
        stripe: gatewayStripe._sum.amount || 0,
        paystack: gatewayPaystack._sum.amount || 0,
      },
    }
  },

  async getRevenueByMonth(months = 6) {
    const now = new Date()
    const results: { label: string; value: number }[] = []

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const result = await prisma.paymentLog.aggregate({
        where: { status: 'paid', paidAt: { gte: start, lte: end } },
        _sum: { amount: true },
      })

      results.push({
        label: start.toLocaleString('en', { month: 'short' }),
        value: result._sum.amount || 0,
      })
    }

    return results
  },
}
