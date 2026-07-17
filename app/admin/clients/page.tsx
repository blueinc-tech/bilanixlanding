'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { UserFormDialog } from '@/components/admin/users/user-form-dialog'
import type { UserListItem } from '@/types/user'

interface UserListResponse {
  users: UserListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ClientsPage() {
  const [data, setData] = useState<UserListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [planOptions, setPlanOptions] = useState<{ name: string }[]>([])

  useEffect(() => {
    fetch('/api/admin/plans')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setPlanOptions(json.data)
      })
      .catch(() => {})
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (planFilter !== 'all') params.set('plan', planFilter)

      const res = await fetch(`/api/admin/users?${params}`)
      const json = await res.json()
      if (json.success) {
        setData({ users: json.data, ...json.meta })
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, planFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, planFilter])

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return
    setBulkLoading(true)
    try {
      await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userIds: selectedIds }),
      })
      setSelectedIds([])
      fetchUsers()
    } finally {
      setBulkLoading(false)
    }
  }

  const toggleSelectAll = () => {
    if (!data) return
    if (selectedIds.length === data.users.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(data.users.map((u) => u.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'suspended': return 'destructive'
      default: return 'outline'
    }
  }

  const planColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'default'
      case 'Premium': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Clients
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your SaaS clients and their subscriptions.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {planOptions.map((p) => (
              <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')} disabled={bulkLoading}>
              Activate
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')} disabled={bulkLoading}>
              Deactivate
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('suspend')} disabled={bulkLoading}>
              Suspend
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')} disabled={bulkLoading}>
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={data ? selectedIds.length === data.users.length && data.users.length > 0 : false}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Billing</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-4 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-40 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-5 w-16 animate-pulse rounded-full bg-muted" /></TableCell>
                  <TableCell><div className="h-5 w-16 animate-pulse rounded-full bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : data && data.users.length > 0 ? (
              data.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(user.id)}
                      onCheckedChange={() => toggleSelect(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link href={`/admin/clients/${user.id}`} className="font-medium text-foreground hover:underline">
                          {user.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.company || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.phone || '—'}
                  </TableCell>
                  <TableCell>
                    {user.subscription ? (
                      <Badge variant={planColor(user.subscription.planName)}>
                        {user.subscription.planName}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.subscription?.amount ? `₦${user.subscription.amount.toLocaleString()}` : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">
                    {user.subscription?.status || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/clients/${user.id}`}>
                      <Button variant="ghost" size="icon-sm">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center">
                  <p className="text-muted-foreground">No clients found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {((data.page - 1) * data.limit) + 1}–{Math.min(data.page * data.limit, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <UserFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSaved={() => { setShowCreateDialog(false); fetchUsers() }}
      />
    </div>
  )
}
