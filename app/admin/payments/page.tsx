'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PaymentItem {
  id: string
  userId: string | null
  planSlug: string | null
  gateway: string | null
  gatewayRef: string | null
  amount: number
  currency: string
  status: string
  type: string
  description: string | null
  paidAt: string | null
  createdAt: string
  user: {
    name: string
    email: string
  } | null
}

interface PaymentStats {
  totalRevenue: number
  monthlyRevenue: number
  totalTransactions: number
  revenueByGateway: { stripe: number; paystack: number }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [gatewayFilter, setGatewayFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (gatewayFilter !== 'all') params.set('gateway', gatewayFilter)
      if (typeFilter !== 'all') params.set('type', typeFilter)

      const res = await fetch(`/api/admin/payments?${params}`)
      const json = await res.json()
      if (json.success) {
        setPayments(json.data)
        setTotal(json.meta?.total || 0)
        setTotalPages(json.meta?.totalPages || 0)
      }
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, gatewayFilter, typeFilter])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/payments/stats')
      const json = await res.json()
      if (json.success) setStats(json.data)
    } catch { /* silent */ }
  }, [])

  useEffect(() => { fetchPayments() }, [fetchPayments])
  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { setPage(1) }, [search, statusFilter, gatewayFilter, typeFilter])

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default'
      case 'pending': return 'secondary'
      case 'failed': return 'destructive'
      case 'refunded': return 'destructive'
      default: return 'outline'
    }
  }

  const gatewayLabel = (g: string | null) => {
    if (!g) return '—'
    return g.charAt(0).toUpperCase() + g.slice(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Payments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View payment history and revenue analytics.
          </p>
        </div>
        <Link href="/admin/payments/plans">
          <Button variant="outline">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage Plans
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            NGN {(stats?.totalRevenue || 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">This Month</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            NGN {(stats?.monthlyRevenue || 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {(stats?.totalTransactions || 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Revenue Split</p>
          <div className="mt-2 flex gap-4 text-sm">
            <div>
              <p className="font-medium text-foreground">NGN {(stats?.revenueByGateway?.stripe || 0).toLocaleString()}</p>
              <p className="text-muted-foreground">Stripe</p>
            </div>
            <div>
              <p className="font-medium text-foreground">NGN {(stats?.revenueByGateway?.paystack || 0).toLocaleString()}</p>
              <p className="text-muted-foreground">Paystack</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Gateway" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Gateways</SelectItem>
            <SelectItem value="stripe">Stripe</SelectItem>
            <SelectItem value="paystack">Paystack</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
            <SelectItem value="one_time">One-time</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-32 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-16 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-5 w-16 animate-pulse rounded-full bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                </TableRow>
              ))
            ) : payments.length > 0 ? (
              payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground text-sm">{p.user?.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{p.user?.email || '—'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground text-sm">{p.description || p.id.slice(0, 12)}</p>
                      {p.gatewayRef && (
                        <p className="text-xs text-muted-foreground">Ref: {p.gatewayRef}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{gatewayLabel(p.gateway)}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    {p.currency} {p.amount.toLocaleString()}
                  </TableCell>
                  <TableCell><Badge variant={statusColor(p.status)}>{p.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {(p.paidAt || p.createdAt) ? new Date(p.paidAt || p.createdAt).toLocaleDateString() : '—'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <p className="text-muted-foreground">No payment records found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
