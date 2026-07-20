'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SubscriptionData {
  id: string
  planName: string
  status: string
  billingCycle: string
  amount: number
  currency: string
  startDate: string
  endDate: string | null
  daysRemaining: number | null
  totalDays: number
  features: string[]
}

interface SubscriptionHistoryItem {
  id: string
  planName: string
  billingCycle: string
  amount: number
  status: string
  startDate: string
  endDate: string | null
}

interface SubscriptionHistoryResponse {
  data: SubscriptionHistoryItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString()}`
}

function statusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'default'
    case 'expired':
      return 'destructive'
    case 'cancelled':
      return 'secondary'
    case 'past_due':
      return 'destructive'
    default:
      return 'outline'
  }
}

function SubscriptionSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-5 w-48" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  )
}

export default function MySubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([])
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch('/api/client/subscription')
        if (!res.ok) throw new Error('Failed to load subscription')
        const json = await res.json()
        const payload = json.data || json
        const sub = payload.subscription || payload
        const plan = payload.plan || null
        if (sub) {
          const now = new Date()
          const endDate = sub.endDate ? new Date(sub.endDate) : null
          const startDate = sub.startDate ? new Date(sub.startDate) : null
          const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : null
          const totalDays = (startDate && endDate) ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))) : 30
          setSubscription({
            id: sub.id,
            planName: sub.planName || plan?.name || 'Unknown',
            status: sub.status,
            billingCycle: sub.billingCycle || 'monthly',
            amount: sub.amount || plan?.amount || 0,
            currency: sub.currency || plan?.currency || 'NGN',
            startDate: sub.startDate,
            endDate: sub.endDate,
            daysRemaining,
            totalDays,
            features: plan?.features || [],
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  useEffect(() => {
    fetchHistory(1)
  }, [])

  async function fetchHistory(page: number) {
    setHistoryLoading(true)
    try {
      const res = await fetch(
        `/api/client/subscription/history?page=${page}&limit=10`
      )
      if (!res.ok) throw new Error('Failed to load history')
      const json = await res.json()
      const payload = json.data || json
      const items: SubscriptionHistoryItem[] = Array.isArray(payload) ? payload : payload.data || []
      setHistory(items)
      const meta = json.meta || {}
      setHistoryPagination({
        page: meta.page || 1,
        limit: meta.limit || 10,
        total: meta.total || items.length,
        totalPages: meta.totalPages || 1,
      })
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  if (loading) return <SubscriptionSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  const progressValue = subscription
    ? Math.min(
        100,
        Math.max(
          0,
          ((subscription.daysRemaining ?? 0) / Math.max(1, subscription.totalDays)) *
            100
        )
      )
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Subscription</h1>
        <p className="text-muted-foreground">
          Manage your current plan and billing details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Current Plan Card */}
        <Card>
          <CardContent className="p-6 space-y-4">
            {subscription ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{subscription.planName}</h2>
                    <div className="mt-1">
                      <Badge variant={statusBadgeVariant(subscription.status)}>
                        {subscription.status.charAt(0).toUpperCase() +
                          subscription.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Billing Cycle</span>
                    <span className="font-medium capitalize">
                      {subscription.billingCycle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount per Cycle</span>
                    <span className="font-medium">
                      {formatCurrency(subscription.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">
                      {new Date(subscription.startDate).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date</span>
                    <span className="font-medium">
                      {subscription.endDate
                        ? new Date(subscription.endDate).toLocaleDateString(
                            'en-NG',
                            { year: 'numeric', month: 'short', day: 'numeric' }
                          )
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={progressValue} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {subscription.daysRemaining !== null && subscription.daysRemaining > 0
                      ? `${subscription.daysRemaining} day${
                          subscription.daysRemaining === 1 ? '' : 's'
                        } remaining`
                      : 'Subscription has expired'}
                  </p>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have an active subscription.
                </p>
                <Link href="/pricing">
                  <Button>View Plans</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Features Card */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Plan Features</h3>
            {subscription && subscription.features.length > 0 ? (
              <ul className="space-y-3">
                {subscription.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No features available.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription History</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No subscription history
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.planName}
                      </TableCell>
                      <TableCell className="capitalize">
                        {item.billingCycle}
                      </TableCell>
                      <TableCell>{formatCurrency(item.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(item.status)}>
                          {item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(item.startDate).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.endDate
                          ? new Date(item.endDate).toLocaleDateString('en-NG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {historyPagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {historyPagination.page} of{' '}
                    {historyPagination.totalPages} ({historyPagination.total}{' '}
                    {historyPagination.total === 1 ? 'record' : 'records'})
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPagination.page <= 1}
                      onClick={() => fetchHistory(historyPagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        historyPagination.page >= historyPagination.totalPages
                      }
                      onClick={() => fetchHistory(historyPagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link href="/pricing">
          <Button>Renew Subscription</Button>
        </Link>
        <Link href="/pricing">
          <Button variant="secondary">Upgrade Plan</Button>
        </Link>
        <Link href="/pricing">
          <Button variant="outline">Change Plan</Button>
        </Link>
      </div>
    </div>
  )
}
