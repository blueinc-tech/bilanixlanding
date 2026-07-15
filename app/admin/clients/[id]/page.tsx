'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserFormDialog } from '@/components/admin/users/user-form-dialog'
import type { UserDetail } from '@/types/user'

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showImpersonateDialog, setShowImpersonateDialog] = useState(false)
  const [impersonateReason, setImpersonateReason] = useState('')
  const [impersonateLoading, setImpersonateLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/admin/users/${userId}`)
        const json = await res.json()
        if (json.success) setUser(json.data)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [userId])

  const handleImpersonate = async () => {
    setImpersonateLoading(true)
    try {
      const res = await fetch('/api/admin/users/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason: impersonateReason || undefined }),
      })
      const json = await res.json()
      if (json.success) {
        setShowImpersonateDialog(false)
        // In a real app, this would redirect to the client portal with impersonation token
        window.open(`/?impersonate=${json.data.logId}`, '_blank')
      }
    } finally {
      setImpersonateLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        router.push('/admin/clients')
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    const res = await fetch(`/api/admin/users/${userId}`)
    const json = await res.json()
    if (json.success) setUser(json.data)
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'suspended': return 'destructive'
      default: return 'outline'
    }
  }

  const subscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'cancelled': return 'destructive'
      case 'expired': return 'destructive'
      case 'past_due': return 'secondary'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
          <div className="h-64 animate-pulse rounded-lg border border-border bg-card lg:col-span-2" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">Client not found.</p>
        <Link href="/admin/clients">
          <Button variant="outline">Back to Clients</Button>
        </Link>
      </div>
    )
  }

  const activeSubscription = user.subscriptions.find((s) => s.status === 'active')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/clients">
            <Button variant="ghost" size="icon-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {user.name}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            Edit
          </Button>
          <Button variant="outline" onClick={() => setShowImpersonateDialog(true)}>
            Impersonate
          </Button>
          {user.status === 'active' ? (
            <Button variant="outline" onClick={() => handleStatusChange('suspended')}>
              Suspend
            </Button>
          ) : (
            <Button variant="outline" onClick={() => handleStatusChange('active')}>
              Activate
            </Button>
          )}
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground mb-4">
            Profile
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-foreground">{user.name}</p>
                <Badge variant={statusColor(user.status)}>{user.status}</Badge>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="text-foreground">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="text-foreground">{user.phone}</p>
                </div>
              )}
              {user.company && (
                <div>
                  <p className="text-muted-foreground">Company</p>
                  <p className="text-foreground">{user.company}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Joined</p>
                <p className="text-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Login</p>
                <p className="text-foreground">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="rounded-lg border border-border bg-card p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground mb-4">
            Subscription
          </h2>
          {activeSubscription ? (
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{activeSubscription.planName}</p>
                  <p className="text-sm text-muted-foreground">
                    Started {new Date(activeSubscription.startDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={subscriptionStatusColor(activeSubscription.status)}>
                  {activeSubscription.status}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium text-foreground">
                    {activeSubscription.currency} {activeSubscription.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <p className="text-foreground">{activeSubscription.paymentMethod || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Next Billing</p>
                  <p className="text-foreground">
                    {activeSubscription.endDate
                      ? new Date(activeSubscription.endDate).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No active subscription.</p>
          )}

          {/* Subscription History */}
          {user.subscriptions.length > 1 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-foreground mb-3">History</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.subscriptions.slice(1).map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.planName}</TableCell>
                      <TableCell>
                        <Badge variant={subscriptionStatusColor(sub.status)}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(sub.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {sub.currency} {sub.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <UserFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        user={user}
        onSaved={() => {
          setShowEditDialog(false)
          fetch(`/api/admin/users/${userId}`).then((r) => r.json()).then((j) => {
            if (j.success) setUser(j.data)
          })
        }}
      />

      {/* Impersonate Dialog */}
      <Dialog open={showImpersonateDialog} onOpenChange={setShowImpersonateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impersonate Client</DialogTitle>
            <DialogDescription>
              You will be redirected to the client portal as <strong>{user.name}</strong>.
              This action will be logged for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Reason (optional)</label>
              <Input
                placeholder="e.g., Support ticket #1234"
                value={impersonateReason}
                onChange={(e) => setImpersonateReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImpersonateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImpersonate} loading={impersonateLoading}>
              Start Impersonation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{user.name}</strong>? This will soft-delete
              the account and deactivate their access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={deleteLoading}>
              Delete Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
