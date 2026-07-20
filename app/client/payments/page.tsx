'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface PaymentItem {
  id: string
  planSlug: string | null
  amount: number
  currency: string
  gateway: string | null
  status: string
  paidAt: string | null
  createdAt: string
}

interface PaymentsResponse {
  data: PaymentItem[]
  summary: {
    totalPaid: number
    totalPending: number
    totalFailed: number
  }
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

function capitalizeGateway(gateway: string | null): string {
  if (!gateway) return '—'
  return gateway.charAt(0).toUpperCase() + gateway.slice(1).toLowerCase()
}

function paymentBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'default'
    case 'pending':
      return 'outline'
    case 'failed':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function PaymentsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [summary, setSummary] = useState({ totalPaid: 0, totalPending: 0, totalFailed: 0 })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPayments(1, statusFilter)
  }, [statusFilter])

  async function fetchPayments(page: number, status: string) {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
      })
      if (status && status !== 'all') {
        params.set('status', status)
      }
      const res = await fetch(`/api/client/payments?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load payments')
      const json = await res.json()
      const payload = json.data || json
      const items: PaymentItem[] = Array.isArray(payload) ? payload : payload.data || []
      setPayments(items)
      setSummary({
        totalPaid: items.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
        totalPending: items.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0),
        totalFailed: items.filter(p => p.status === 'failed').reduce((s, p) => s + p.amount, 0),
      })
      const meta = json.meta || {}
      setPagination({
        page: meta.page || 1,
        limit: meta.limit || 10,
        total: meta.total || items.length,
        totalPages: meta.totalPages || 1,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(value: string) {
    setStatusFilter(value)
  }

  if (loading && payments.length === 0) return <PaymentsSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground">
          View all your transactions and payment records.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="mt-2 text-2xl font-bold text-primary">
              {formatCurrency(summary.totalPaid)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(summary.totalPending)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="mt-2 text-2xl font-bold text-destructive">
              {formatCurrency(summary.totalFailed)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Transactions</CardTitle>
          <Select value={statusFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-8 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => fetchPayments(pagination.page, statusFilter)}>
                Retry
              </Button>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No payments found
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">
                        {payment.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium capitalize">
                        {payment.planSlug ?? '—'}
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{capitalizeGateway(payment.gateway)}</TableCell>
                      <TableCell>
                        <Badge variant={paymentBadgeVariant(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(
                          payment.paidAt ?? payment.createdAt
                        ).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages} (
                    {pagination.total}{' '}
                    {pagination.total === 1 ? 'record' : 'records'})
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchPayments(pagination.page - 1, statusFilter)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchPayments(pagination.page + 1, statusFilter)}
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
    </div>
  )
}
