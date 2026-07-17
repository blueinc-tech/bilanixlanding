'use client'

import { useState, useEffect, useCallback } from 'react'
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

interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  amount: number
  currency: string
  interval: string
  features: string[] | null
  isActive: boolean
  sortOrder: number
  audience: string | null
  badge: string | null
  ctaText: string | null
  monthlyAmount: number | null
  yearlyAmount: number | null
  _count: { paymentLogs: number }
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/plans?includeInactive=true')
      const json = await res.json()
      if (json.success) setPlans(json.data)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  const handleDelete = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/plans/${slug}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setDeleteConfirm(null)
        fetchPlans()
      }
    } catch { /* silent */ }
  }

  const handleToggleActive = async (plan: Plan) => {
    try {
      await fetch(`/api/admin/plans/${plan.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !plan.isActive }),
      })
      fetchPlans()
    } catch { /* silent */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/admin/payments" className="hover:text-foreground">Payments</Link>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-foreground">Plans</span>
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Subscription Plans
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your subscription plans and pricing.
          </p>
        </div>
        <Button onClick={() => { setEditingPlan(null); setShowDialog(true) }}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Plan
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
                <TableRow>
               <TableHead>Plan</TableHead>
               <TableHead>Pricing</TableHead>
              <TableHead>Payments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-32 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-12 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-5 w-16 animate-pulse rounded-full bg-muted" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : plans.length > 0 ? (
              plans.map((plan) => (
                <TableRow key={plan.slug}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{plan.name}</p>
                      {plan.audience && (
                        <p className="text-xs text-muted-foreground">{plan.audience}</p>
                      )}
                      {plan.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{plan.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {plan.monthlyAmount != null && (
                      <div>{plan.currency} {plan.monthlyAmount.toLocaleString()}/mo</div>
                    )}
                    {plan.yearlyAmount != null && (
                      <div>{plan.currency} {plan.yearlyAmount.toLocaleString()}/yr</div>
                    )}
                    {plan.monthlyAmount == null && plan.yearlyAmount == null && (
                      <div>{plan.currency} {plan.amount.toLocaleString()}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{plan._count.paymentLogs}</TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(plan)}
                      >
                        {plan.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingPlan(plan); setShowDialog(true) }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setDeleteConfirm(plan.slug)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <p className="text-muted-foreground">No plans configured</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <PlanFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        plan={editingPlan}
        onSaved={() => { setShowDialog(false); setEditingPlan(null); fetchPlans() }}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PlanFormDialog({
  open,
  onOpenChange,
  plan,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: Plan | null
  onSaved: () => void
}) {
  const isEdit = !!plan
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: plan?.name || '',
    slug: plan?.slug || '',
    description: plan?.description || '',
    amount: plan?.amount || 0,
    interval: plan?.interval || 'monthly',
    features: plan?.features?.join('\n') || '',
    audience: plan?.audience || '',
    badge: plan?.badge || '',
    ctaText: plan?.ctaText || 'Get started',
    monthlyAmount: plan?.monthlyAmount ?? '',
    yearlyAmount: plan?.yearlyAmount ?? '',
  })

  useEffect(() => {
    if (plan) {
      setForm({
        name: plan.name,
        slug: plan.slug,
        description: plan.description || '',
        amount: plan.amount,
        interval: plan.interval,
        features: plan.features?.join('\n') || '',
        audience: plan.audience || '',
        badge: plan.badge || '',
        ctaText: plan.ctaText || 'Get started',
        monthlyAmount: plan.monthlyAmount ?? '',
        yearlyAmount: plan.yearlyAmount ?? '',
      })
    } else {
      setForm({ name: '', slug: '', description: '', amount: 0, interval: 'monthly', features: '', audience: '', badge: '', ctaText: 'Get started', monthlyAmount: '', yearlyAmount: '' })
    }
  }, [plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const body = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        description: form.description || undefined,
        amount: Number(form.amount),
        interval: form.interval,
        features: form.features ? form.features.split('\n').filter(Boolean) : [],
        audience: form.audience || undefined,
        badge: form.badge || undefined,
        ctaText: 'Get started',
        monthlyAmount: form.monthlyAmount !== '' ? Number(form.monthlyAmount) : undefined,
        yearlyAmount: form.yearlyAmount !== '' ? Number(form.yearlyAmount) : undefined,
      }

      const url = isEdit ? `/api/admin/plans/${plan!.slug}` : '/api/admin/plans'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (json.success) {
        onSaved()
      } else {
        setErrors({ submit: json.error?.message || 'Something went wrong' })
      }
    } catch {
      setErrors({ submit: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>{isEdit ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update plan details.' : 'Add a new subscription plan.'}</DialogDescription>
        </DialogHeader>
        <form id="plan-form" onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-6 pb-4 pt-2 flex-1 min-h-0">
          {errors.submit && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errors.submit}</div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name *</label>
            <Input placeholder="e.g., Premium" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Slug</label>
              <Input placeholder="auto-generated from name" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Input placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Audience</label>
            <Input placeholder="e.g., Freelancers & Small Firms" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Badge</label>
            <Input placeholder="e.g., Most Popular" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">CTA Text</label>
            <Input value="Get started" disabled />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount *</label>
              <Input type="number" min="0" step="100" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Monthly Amount</label>
              <Input type="number" min="0" step="100" value={form.monthlyAmount} onChange={(e) => setForm({ ...form, monthlyAmount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Yearly Amount</label>
              <Input type="number" min="0" step="100" value={form.yearlyAmount} onChange={(e) => setForm({ ...form, yearlyAmount: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Interval</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={form.interval}
              onChange={(e) => setForm({ ...form, interval: e.target.value })}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="one_time">One-time</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Features (one per line)</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </div>
        </form>
        <div className="px-6 pb-6 pt-2 border-t shrink-0">
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" form="plan-form" loading={loading}>{isEdit ? 'Save Changes' : 'Create Plan'}</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
