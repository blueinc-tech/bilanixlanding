'use client'

import { useState, useEffect, useCallback } from 'react'
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

interface Submission {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string | null
  phone: string | null
  message: string | null
  inquiryType: string
  isRead: boolean
  status: string
  viewedAt: string | null
  respondedAt: string | null
  createdAt: string
}

interface SubmissionsResponse {
  submissions: Submission[]
  total: number
  page: number
  limit: number
  totalPages: number
  stats: { total: number; unread: number; responded: number; newToday: number }
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'responded', label: 'Responded' },
  { value: 'archived', label: 'Archived' },
]

const INQUIRY_OPTIONS = [
  { value: 'Request a Demo', label: 'Request a Demo' },
  { value: 'Support', label: 'Support' },
  { value: 'Partnership', label: 'Partnership' },
]

export default function SubmissionsPage() {
  const [data, setData] = useState<SubmissionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [inquiryFilter, setInquiryFilter] = useState<string>('all')
  const [readFilter, setReadFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [viewSubmission, setViewSubmission] = useState<Submission | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (inquiryFilter !== 'all') params.set('inquiryType', inquiryFilter)
      if (readFilter !== 'all') params.set('isRead', readFilter)

      const res = await fetch(`/api/admin/submissions?${params}`)
      const json = await res.json()
      if (json.success) {
        setData({ submissions: json.data, ...json.meta })
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, inquiryFilter, readFilter])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, inquiryFilter, readFilter])

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return
    setBulkLoading(true)
    try {
      await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedIds }),
      })
      setSelectedIds([])
      fetchSubmissions()
    } finally {
      setBulkLoading(false)
    }
  }

  const handleViewSubmission = async (submission: Submission) => {
    setDetailLoading(true)
    setViewSubmission(submission)
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}`)
      const json = await res.json()
      if (json.success) {
        setViewSubmission(json.data)
        fetchSubmissions()
      }
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDeleteSubmission = async (id: string) => {
    await fetch(`/api/admin/submissions/${id}`, { method: 'DELETE' })
    setViewSubmission(null)
    fetchSubmissions()
  }

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/admin/submissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setViewSubmission(null)
    fetchSubmissions()
  }

  const toggleSelectAll = () => {
    if (!data) return
    if (selectedIds.length === data.submissions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(data.submissions.map((s) => s.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const inquiryBadgeColor = (type: string) => {
    switch (type) {
      case 'Request a Demo': return 'default'
      case 'Support': return 'secondary'
      case 'Partnership': return 'outline'
      default: return 'outline'
    }
  }

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'new': return 'default'
      case 'in_progress': return 'secondary'
      case 'responded': return 'outline'
      case 'archived': return 'outline'
      default: return 'outline'
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Submissions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage contact form submissions and demo requests.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total"
          value={data?.stats.total ?? '—'}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          }
        />
        <StatCard
          label="Unread"
          value={data?.stats.unread ?? '—'}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
          accent
        />
        <StatCard
          label="Responded"
          value={data?.stats.responded ?? '—'}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="New Today"
          value={data?.stats.newToday ?? '—'}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <Input
            placeholder="Search submissions..."
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
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={inquiryFilter} onValueChange={setInquiryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Inquiry Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {INQUIRY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={readFilter} onValueChange={setReadFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Read Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
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
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('mark_read')} disabled={bulkLoading}>
              Mark Read
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
                  checked={data ? selectedIds.length === data.submissions.length && data.submissions.length > 0 : false}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Inquiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
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
                  <TableCell><div className="h-5 w-20 animate-pulse rounded-full bg-muted" /></TableCell>
                  <TableCell><div className="h-5 w-16 animate-pulse rounded-full bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : data && data.submissions.length > 0 ? (
              data.submissions.map((sub) => (
                <TableRow
                  key={sub.id}
                  className={!sub.isRead ? 'bg-primary/[0.03]' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(sub.id)}
                      onCheckedChange={() => toggleSelect(sub.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {sub.firstName.charAt(0).toUpperCase()}{sub.lastName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-medium text-foreground ${!sub.isRead ? 'font-semibold' : ''}`}>
                          {sub.firstName} {sub.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{sub.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {sub.company || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={inquiryBadgeColor(sub.inquiryType)}>
                      {sub.inquiryType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeColor(sub.status)}>
                      {sub.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(sub.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleViewSubmission(sub)}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <p className="text-muted-foreground">No submissions found</p>
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

      {/* View Modal */}
      {viewSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setViewSubmission(null)} />
          <div className="relative z-50 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Submission Details
              </h2>
              <button
                onClick={() => setViewSubmission(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {detailLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-primary">
                    {viewSubmission.firstName.charAt(0)}{viewSubmission.lastName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {viewSubmission.firstName} {viewSubmission.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{viewSubmission.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <DetailField label="Company" value={viewSubmission.company} />
                  <DetailField label="Phone" value={viewSubmission.phone} />
                  <DetailField label="Inquiry Type" value={viewSubmission.inquiryType} />
                  <DetailField label="Status" value={viewSubmission.status.replace('_', ' ')} />
                  <DetailField label="Submitted" value={formatDate(viewSubmission.createdAt)} />
                  <DetailField label="Time" value={formatTime(viewSubmission.createdAt)} />
                </div>

                {viewSubmission.message && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Message</p>
                    <div className="rounded-lg border border-border bg-background p-3 text-sm text-foreground whitespace-pre-wrap">
                      {viewSubmission.message}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Select
                    value={viewSubmission.status}
                    onValueChange={(val) => handleStatusChange(viewSubmission.id, val)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSubmission(viewSubmission.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, accent }: {
  label: string
  value: number | string
  icon: React.ReactNode
  accent?: boolean
}) {
  return (
    <div className={`rounded-lg border border-border bg-card p-4 ${accent ? 'border-primary/20 bg-primary/5' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={accent ? 'text-primary' : 'text-muted-foreground'}>{icon}</div>
      </div>
      <p className={`mt-2 text-2xl font-semibold ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</p>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value || '—'}</p>
    </div>
  )
}
