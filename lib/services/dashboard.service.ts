import { prisma } from '@/lib/db'

// ─── Dashboard Service ─────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  expiringSoon: number
  inactiveUsers: number
  totalSubscriptions: number
  activeSubscriptions: number
  monthlyRevenue: number
  newUsersThisMonth: number
}

export interface RecentUser {
  id: string
  name: string
  email: string
  company: string | null
  plan: string | null
  status: string
  createdAt: string
}

export interface ChartDataPoint {
  label: string
  value: number
}

export interface DashboardData {
  stats: DashboardStats
  recentUsers: RecentUser[]
  userGrowth: ChartDataPoint[]
  revenueByMonth: ChartDataPoint[]
  topPlans: { name: string; count: number; percentage: number }[]
}

export const DashboardService = {
  async getStats(): Promise<DashboardStats> {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      expiringSoon,
      totalSubscriptions,
      activeSubscriptions,
      revenueResult,
      newUsersThisMonth,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: 'active', deletedAt: null } }),
      prisma.user.count({ where: { status: 'inactive', deletedAt: null } }),
      prisma.subscription.count({
        where: {
          status: 'active',
          endDate: { gt: now, lte: fourteenDaysFromNow },
        },
      }),
      prisma.subscription.count({ where: { user: { deletedAt: null } } }),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.subscription.aggregate({
        where: { status: 'active' },
        _sum: { amount: true },
      }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null } }),
    ])

    return {
      totalUsers,
      activeUsers,
      expiringSoon,
      inactiveUsers,
      totalSubscriptions,
      activeSubscriptions,
      monthlyRevenue: revenueResult._sum.amount || 0,
      newUsersThisMonth,
    }
  },

  async getRecentUsers(limit = 10): Promise<RecentUser[]> {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        status: true,
        createdAt: true,
        subscriptions: {
          where: { status: 'active' },
          take: 1,
          select: { planName: true },
        },
      },
    })

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      company: u.company,
      plan: u.subscriptions[0]?.planName || null,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
    }))
  },

  async getUserGrowth(): Promise<ChartDataPoint[]> {
    const now = new Date()
    const results: ChartDataPoint[] = []

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const count = await prisma.user.count({
        where: { createdAt: { gte: start, lte: end }, deletedAt: null },
      })

      results.push({
        label: start.toLocaleString('en', { month: 'short' }),
        value: count,
      })
    }

    return results
  },

  async getRevenueByMonth(): Promise<ChartDataPoint[]> {
    const now = new Date()
    const results: ChartDataPoint[] = []

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const result = await prisma.subscription.aggregate({
        where: { createdAt: { gte: start, lte: end }, status: 'active' },
        _sum: { amount: true },
      })

      results.push({
        label: start.toLocaleString('en', { month: 'short' }),
        value: result._sum.amount || 0,
      })
    }

    return results
  },

  async getTopPlans(): Promise<{ name: string; count: number; percentage: number }[]> {
    const plans = await prisma.subscription.groupBy({
      by: ['planName'],
      where: { status: 'active' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    })

    const total = plans.reduce((sum, p) => sum + p._count.id, 0)

    return plans.map((p) => ({
      name: p.planName,
      count: p._count.id,
      percentage: total > 0 ? Math.round((p._count.id / total) * 100) : 0,
    }))
  },

  async getDashboardData(): Promise<DashboardData> {
    const [stats, recentUsers, userGrowth, revenueByMonth, topPlans] = await Promise.all([
      this.getStats(),
      this.getRecentUsers(),
      this.getUserGrowth(),
      this.getRevenueByMonth(),
      this.getTopPlans(),
    ])

    return { stats, recentUsers, userGrowth, revenueByMonth, topPlans }
  },
}
