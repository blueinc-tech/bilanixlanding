export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticateClient } from '@/lib/client-auth'
import { prisma } from '@/lib/db'

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticateClient(req)
  if (!auth.success) return auth.response
  const userId = auth.client.id

  const [
    profile,
    activeSubscription,
    totalPayments,
    totalSpent,
    lastPayments,
    lastNotifications,
    lastTickets,
    unreadNotifications,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.subscription.findFirst({
      where: { userId, status: 'active' },
      include: { plan: true },
    }),
    prisma.paymentLog.count({ where: { userId, status: 'paid' } }),
    prisma.paymentLog.aggregate({
      where: { userId, status: 'paid' },
      _sum: { amount: true },
    }),
    prisma.paymentLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.contactSubmission.findMany({
      where: { userId, source: 'client_dashboard' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ])

  let daysRemaining: number | null = null
  if (activeSubscription?.endDate) {
    const now = new Date()
    const end = new Date(activeSubscription.endDate)
    const diffMs = end.getTime() - now.getTime()
    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  }

  return apiSuccess({
    user: profile ? { id: profile.id, name: profile.name, email: profile.email } : null,
    subscription: activeSubscription,
    stats: {
      daysRemaining,
      successfulPayments: totalPayments,
      totalSpent: totalSpent._sum.amount || 0,
    },
    recentPayments: lastPayments,
    recentNotifications: lastNotifications,
    recentTickets: lastTickets,
    unreadNotifications,
  })
})
