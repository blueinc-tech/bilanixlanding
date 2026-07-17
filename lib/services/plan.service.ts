import { prisma } from '@/lib/db'
import { NotFoundError, ConflictError } from '@/lib/api-response'

// ─── Subscription Plan Service ────────────────────────────────────

export const PlanService = {
  async list(includeInactive = false) {
    return prisma.subscriptionPlan.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { paymentLogs: { where: { status: 'paid' } } },
        },
      },
    })
  },

  async listPublic() {
    return prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        monthlyAmount: true,
        yearlyAmount: true,
        amount: true,
        currency: true,
        interval: true,
        features: true,
        audience: true,
        badge: true,
        ctaText: true,
      },
    })
  },

  async getBySlug(slug: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { paymentLogs: { where: { status: 'paid' } } },
        },
      },
    })
    if (!plan) throw new NotFoundError('Plan')
    return plan
  },

  async create(data: { name: string; slug: string; description?: string; amount: number; currency?: string; interval?: string; features?: string[]; sortOrder?: number; audience?: string; badge?: string; ctaText?: string; monthlyAmount?: number; yearlyAmount?: number }) {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { slug: data.slug } })
    if (existing) throw new ConflictError('A plan with this slug already exists')

    return prisma.subscriptionPlan.create({
      data: {
        name: data.name.trim(),
        slug: data.slug.toLowerCase().trim(),
        description: data.description || null,
        amount: data.amount,
        currency: data.currency || 'NGN',
        interval: data.interval || 'monthly',
        features: data.features || [],
        sortOrder: data.sortOrder || 0,
        audience: data.audience || null,
        badge: data.badge || null,
        ctaText: data.ctaText || 'Get started',
        monthlyAmount: data.monthlyAmount ?? null,
        yearlyAmount: data.yearlyAmount ?? null,
      },
    })
  },

  async update(slug: string, data: { name?: string; description?: string; amount?: number; interval?: string; features?: string[]; isActive?: boolean; sortOrder?: number; audience?: string; badge?: string; ctaText?: string; monthlyAmount?: number; yearlyAmount?: number }) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { slug } })
    if (!plan) throw new NotFoundError('Plan')

    return prisma.subscriptionPlan.update({
      where: { slug },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.interval !== undefined && { interval: data.interval }),
        ...(data.features !== undefined && { features: data.features }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.audience !== undefined && { audience: data.audience }),
        ...(data.badge !== undefined && { badge: data.badge }),
        ...(data.ctaText !== undefined && { ctaText: data.ctaText }),
        ...(data.monthlyAmount !== undefined && { monthlyAmount: data.monthlyAmount }),
        ...(data.yearlyAmount !== undefined && { yearlyAmount: data.yearlyAmount }),
      },
    })
  },

  async delete(slug: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { slug },
      include: { _count: { select: { paymentLogs: true } } },
    })
    if (!plan) throw new NotFoundError('Plan')
    if (plan._count.paymentLogs > 0) {
      throw new ConflictError('Cannot delete a plan with existing payment records. Deactivate it instead.')
    }
    await prisma.subscriptionPlan.delete({ where: { slug } })
    return true
  },

  async getStats() {
    const [totalPlans, activePlans, totalPayments, paidPayments, revenueResult] = await Promise.all([
      prisma.subscriptionPlan.count(),
      prisma.subscriptionPlan.count({ where: { isActive: true } }),
      prisma.paymentLog.count(),
      prisma.paymentLog.count({ where: { status: 'paid' } }),
      prisma.paymentLog.aggregate({ where: { status: 'paid' }, _sum: { amount: true } }),
    ])

    const totalRevenue = revenueResult._sum.amount || 0
    const mrr = await this.getMonthlyRecurringRevenue()

    return { totalPlans, activePlans, totalPayments, paidPayments, totalRevenue, mrr, arr: mrr * 12 }
  },

  async getMonthlyRecurringRevenue() {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const result = await prisma.paymentLog.aggregate({
      where: {
        status: 'paid',
        type: 'subscription',
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    })

    return result._sum.amount || 0
  },
}
