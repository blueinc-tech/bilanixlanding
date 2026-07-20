'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Ticket {
  id: string
  message: string
  status: string
  category: string
  priority: string
  createdAt: string
  reply?: string
}

interface TicketsResponse {
  success: boolean
  data: Ticket[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

const STATUS_OPTIONS = ['all', 'new', 'open', 'in_progress', 'resolved', 'closed'] as const

const STATUS_LABELS: Record<string, string> = {
  all: 'All',
  new: 'New',
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const CATEGORY_OPTIONS = ['General', 'Billing', 'Technical', 'Feature Request', 'Bug Report']

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']

function getPriorityBadgeVariant(priority: string): 'outline' | 'secondary' | 'destructive' {
  switch (priority?.toLowerCase()) {
    case 'low':
      return 'outline'
    case 'high':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'new':
    case 'open':
      return 'default'
    case 'in_progress':
      return 'secondary'
    case 'resolved':
    case 'closed':
      return 'outline'
    default:
      return 'default'
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function extractSubject(message: string) {
  const match = message.match(/^\[(.+?)\]\s*/)
  if (match) {
    return { subject: match[1], body: message.slice(match[0].length) }
  }
  return { subject: 'Untitled', body: message }
}

export default function SupportPage() {
  const [view, setView] = useState<'list' | 'form'>('list')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)

  const [formSubject, setFormSubject] = useState('')
  const [formCategory, setFormCategory] = useState('General')
  const [formPriority, setFormPriority] = useState('Medium')
  const [formMessage, setFormMessage] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState('')
  const [formError, setFormError] = useState('')

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
      })
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      const res = await fetch(`/api/client/support?${params.toString()}`)
      const data: TicketsResponse = await res.json()
      if (data.success) {
        setTickets(data.data)
        setTotalPages(data.meta?.totalPages ?? 1)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormSubmitting(true)
    setFormError('')
    setFormSuccess('')
    try {
      const res = await fetch('/api/client/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formSubject,
          category: formCategory.toLowerCase().replace(/\s+/g, '_'),
          priority: formPriority.toLowerCase(),
          message: formMessage,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFormSuccess('Ticket submitted successfully!')
        setFormSubject('')
        setFormCategory('General')
        setFormPriority('Medium')
        setFormMessage('')
        setTimeout(() => {
          setView('list')
          setFormSuccess('')
          fetchTickets()
        }, 1500)
      } else {
        setFormError(data.message || 'Failed to submit ticket')
      }
    } catch {
      setFormError('An error occurred. Please try again.')
    } finally {
      setFormSubmitting(false)
    }
  }

  function toggleExpand(id: string) {
    setExpandedTicket(expandedTicket === id ? null : id)
  }

  if (view === 'form') {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setView('list')}>
            ← Back to Tickets
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Submit a Support Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formSuccess && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                  {formSuccess}
                </div>
              )}
              {formError && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Brief description of your issue"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={formPriority} onValueChange={setFormPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Describe your issue in detail..."
                  rows={6}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setView('list')}>
                  Cancel
                </Button>
                <Button type="submit" loading={formSubmitting}>
                  Submit Ticket
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setView('form')}>Submit Ticket</Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <div className="flex gap-3">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <svg
              className="mb-4 h-12 w-12 text-muted-foreground/50"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm text-muted-foreground">No support tickets yet</p>
            <Button className="mt-4" onClick={() => setView('form')}>
              Submit Your First Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const { subject, body } = extractSubject(ticket.message)
            const isExpanded = expandedTicket === ticket.id
            return (
              <Card
                key={ticket.id}
                className="cursor-pointer transition-colors hover:border-primary/20"
                onClick={() => toggleExpand(ticket.id)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{subject}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(ticket.createdAt)}</span>
                        <span>·</span>
                        <span className="capitalize">{ticket.category?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(ticket.status)}>
                        {STATUS_LABELS[ticket.status] || ticket.status}
                      </Badge>
                      <svg
                        className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 space-y-4 border-t border-border pt-4">
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Message</p>
                        <p className="whitespace-pre-wrap text-sm">{body}</p>
                      </div>
                      {ticket.reply && (
                        <div className="rounded-lg bg-primary/5 p-4">
                          <p className="mb-1 text-xs font-medium uppercase text-primary">Admin Reply</p>
                          <p className="whitespace-pre-wrap text-sm">{ticket.reply}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
