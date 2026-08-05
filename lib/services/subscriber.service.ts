import { prisma } from '@/lib/db'
import type { Subscription, SubscriptionPlan, User } from '@prisma/client'

// ─── Subscriber Status Service (app.bilanix.com integration) ──────
// Reports the CURRENT truth for a client's most recent subscription so
// app.bilanix.com can provision, keep active, or suspend access.
//
// Status is computed at query time from endDate rather than a stored
// flag, since nothing flips a Subscription to "expired" on its own —
// the source of truth is always `endDate` vs. now.

export type SubscriberStatus = 'pending' | 'active' | 'expired' | 'cancelled'

type SubscriptionWithPlan = Subscription & { plan: Pick<SubscriptionPlan, 'slug' | 'name'> | null }
type UserWithLatestSub = User & { subscriptions: SubscriptionWithPlan[] }

function computeStatus(subscription: SubscriptionWithPlan | null): SubscriberStatus {
  if (!subscription) return 'pending'
  if (subscription.status === 'cancelled') return 'cancelled'
  if (subscription.endDate && subscription.endDate.getTime() <= Date.now()) return 'expired'
  return 'active'
}

function serialize(user: UserWithLatestSub) {
  const subscription = user.subscriptions[0] ?? null
  const status = computeStatus(subscription)

  return {
    email: user.email,
    name: user.name,
    company: user.company,
    status,
    plan: subscription
      ? {
          slug: subscription.plan?.slug ?? null,
          name: subscription.plan?.name ?? subscription.planName,
        }
      : null,
    subscription: subscription
      ? {
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          cancelledAt: subscription.cancelledAt,
          amount: subscription.amount,
          currency: subscription.currency,
        }
      : null,
    updatedAt: subscription?.updatedAt ?? user.updatedAt,
  }
}

const LATEST_SUBSCRIPTION_INCLUDE = {
  subscriptions: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    include: { plan: { select: { slug: true, name: true } } },
  },
}

export const SubscriberService = {
  async getByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: LATEST_SUBSCRIPTION_INCLUDE,
    })
    if (!user) return null
    return serialize(user)
  },

  async list({ cursor, limit = 100 }: { cursor?: string; limit?: number }) {
    const take = Math.min(Math.max(limit, 1), 500)

    const users = await prisma.user.findMany({
      where: {
        subscriptions: { some: {} },
        ...(cursor ? { id: { gt: cursor } } : {}),
      },
      orderBy: { id: 'asc' },
      take: take + 1,
      include: LATEST_SUBSCRIPTION_INCLUDE,
    })

    const hasMore = users.length > take
    const page = hasMore ? users.slice(0, take) : users
    const nextCursor = hasMore ? page[page.length - 1].id : null

    return {
      subscribers: page.map(serialize),
      nextCursor,
    }
  },
}
