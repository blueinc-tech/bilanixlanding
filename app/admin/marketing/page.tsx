'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { CampaignFormDialog } from '@/components/admin/marketing/campaign-form-dialog'

interface Campaign {
  id: string
  name: string
  subject: string
  body: string
  status: string
  type: string
  recipientType: string
  targetFilter: Record<string, unknown> | null
  totalRecipients: number
  totalSent: number
  totalFailed: number
  totalOpened: number
  totalClicked: number
  sentAt: string | null
  createdAt: string
}

interface CampaignStats {
  total: number
  draft: number
  scheduled: number
  sending: number
  sent: number
  failed: number
}

const RECIPIENT_TYPE_LABELS: Record<string, string> = {
  single: 'Single',
  multiple: 'Multi',
  subscription_group: 'Group',
  csv: 'CSV',
}

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null)
  const [sendConfirm, setSendConfirm] = useState<string | null>(null)
  const [sendLoading, setSendLoading] = useState(false)
  const [retryLoading, setRetryLoading] = useState<string | null>(null)
  const [duplicateLoading, setDuplicateLoading] = useState<string | null>(null)
  const [resendConfirm, setResendConfirm] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/campaigns?${params}`)
      const json = await res.json()
      if (json.success) {
        setCampaigns(json.data)
        setTotal(json.meta?.total || 0)
        setTotalPages(json.meta?.totalPages || 0)
      }
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/campaigns/stats')
      const json = await res.json()
      if (json.success) setStats(json.data.stats)
    } catch { /* silent */ }
  }, [])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])
  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  const handleSend = async (id: string) => {
    setSendLoading(true)
    try {
      const res = await fetch('/api/admin/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (json.success) {
        setSendConfirm(null)
        toast.success(`Campaign sent to ${json.data?.sent || 0} recipients`)
        fetchCampaigns()
        fetchStats()
      } else {
        toast.error(json.error?.message || 'Failed to send campaign')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error'
      toast.error(`Send failed: ${message}`)
    } finally {
      setSendLoading(false)
    }
  }

  const handleRetry = async (id: string) => {
    setRetryLoading(id)
    try {
      const res = await fetch('/api/admin/campaigns/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`Retried ${json.data?.retried || 0} failed sends`)
      } else {
        toast.error(json.error?.message || 'Retry failed')
      }
      fetchCampaigns()
      fetchStats()
    } catch {
      toast.error('Retry failed')
    } finally {
      setRetryLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/campaigns/${id}`, { method: 'DELETE' })
    fetchCampaigns()
    fetchStats()
  }

  const handleDuplicate = async (id: string) => {
    setDuplicateLoading(id)
    try {
      const res = await fetch('/api/admin/campaigns/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Campaign duplicated')
        fetchCampaigns()
        fetchStats()
      } else {
        toast.error(json.error?.message || 'Failed to duplicate')
      }
    } catch {
      toast.error('Duplicate failed')
    } finally {
      setDuplicateLoading(null)
    }
  }

  const handleResend = async (id: string) => {
    setResendLoading(true)
    try {
      const res = await fetch('/api/admin/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (json.success) {
        setResendConfirm(null)
        toast.success(`Campaign resent to ${json.data?.sent || 0} recipients`)
        fetchCampaigns()
        fetchStats()
      } else {
        toast.error(json.error?.message || 'Failed to resend')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error'
      toast.error(`Resend failed: ${message}`)
    } finally {
      setResendLoading(false)
    }
  }

  const canResend = (c: Campaign): boolean => {
    if (c.status !== 'sent') return false
    if (!c.sentAt) return false
    const sentTime = new Date(c.sentAt).getTime()
    const now = Date.now()
    const SEVENTY_TWO_HOURS = 72 * 60 * 60 * 1000
    return (now - sentTime) >= SEVENTY_TWO_HOURS
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default'
      case 'draft': return 'secondary'
      case 'scheduled': return 'outline'
      case 'sending': return 'secondary'
      case 'failed': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Marketing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage email campaigns.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-semibold text-foreground">{stats?.total || 0}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-semibold text-muted-foreground">{stats?.draft || 0}</p>
          <p className="text-xs text-muted-foreground">Drafts</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-semibold text-blue-600">{stats?.scheduled || 0}</p>
          <p className="text-xs text-muted-foreground">Scheduled</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-semibold text-emerald-600">{stats?.sent || 0}</p>
          <p className="text-xs text-muted-foreground">Sent</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-2xl font-semibold text-destructive">{stats?.failed || 0}</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <Input placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Failed</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-40 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-5 w-16 animate-pulse rounded-full bg-muted" /></TableCell>
                  <TableCell><div className="h-5 w-12 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-12 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-12 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-12 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : campaigns.length > 0 ? (
              campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{c.subject}</p>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={statusColor(c.status)}>{c.status}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {RECIPIENT_TYPE_LABELS[c.recipientType] || c.recipientType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.totalRecipients || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.totalSent || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.totalFailed > 0 ? (
                      <span className="text-destructive font-medium">{c.totalFailed}</span>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {(c.status === 'draft' || c.status === 'scheduled') && (
                        <>
                          <button
                            title="Edit"
                            onClick={() => setEditCampaign(c)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          <button
                            title="Send"
                            onClick={() => setSendConfirm(c.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                          </button>
                          <button
                            title="Delete"
                            onClick={() => handleDelete(c.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                          <button
                            title="Duplicate"
                            onClick={() => handleDuplicate(c.id)}
                            disabled={duplicateLoading === c.id}
                            className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            {duplicateLoading === c.id ? (
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                              </svg>
                            )}
                          </button>
                        </>
                      )}
                      {c.status === 'failed' && c.totalFailed > 0 && (
                        <button
                          title="Retry"
                          onClick={() => handleRetry(c.id)}
                          disabled={retryLoading === c.id}
                          className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
                        >
                          {retryLoading === c.id ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                            </svg>
                          )}
                        </button>
                      )}
                      {canResend(c) && (
                        <button
                          title="Resend"
                          onClick={() => setResendConfirm(c.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <p className="text-muted-foreground">No campaigns found</p>
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
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <CampaignFormDialog
        open={showCreateDialog || !!editCampaign}
        onOpenChange={(open) => { if (!open) { setShowCreateDialog(false); setEditCampaign(null) } }}
        onSaved={() => { setShowCreateDialog(false); setEditCampaign(null); fetchCampaigns(); fetchStats() }}
        editCampaign={editCampaign}
      />

      <Dialog open={!!sendConfirm} onOpenChange={() => setSendConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Campaign</DialogTitle>
            <DialogDescription>
              This will prepare recipients and send the campaign via email. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendConfirm(null)}>Cancel</Button>
            <Button onClick={() => sendConfirm && handleSend(sendConfirm)} loading={sendLoading}>Send Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resendConfirm} onOpenChange={() => setResendConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resend Campaign</DialogTitle>
            <DialogDescription>
              This will re-send the campaign to all original recipients. Only available 72 hours after the last send. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResendConfirm(null)}>Cancel</Button>
            <Button onClick={() => resendConfirm && handleResend(resendConfirm)} loading={resendLoading}>Resend Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
