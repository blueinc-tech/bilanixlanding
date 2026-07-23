'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
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

interface AdminItem {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  status: string
  avatar: string | null
  lastLoginAt: string | null
  lastLoginIp: string | null
  createdAt: string
  assignedModules: string[]
}

interface AdminListResponse {
  admins: AdminItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const ASSIGNABLE_MODULES = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'clients', label: 'Clients' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'payments', label: 'Payments' },
  { value: 'submissions', label: 'Submissions' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'settings', label: 'Settings' },
  { value: 'reports', label: 'Reports' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'support', label: 'Support' },
  { value: 'profile', label: 'Profile' },
]

export default function AdminsPage() {
  const [data, setData] = useState<AdminListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminItem | null>(null)

  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (roleFilter !== 'all') params.set('role', roleFilter)

      const res = await fetch(`/api/admin/admins?${params}`)
      const json = await res.json()
      if (json.success) {
        setData({ admins: json.data, ...json.meta })
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, roleFilter])

  useEffect(() => { fetchAdmins() }, [fetchAdmins])
  useEffect(() => { setPage(1) }, [search, statusFilter, roleFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this administrator?')) return
    await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' })
    fetchAdmins()
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    await fetch(`/api/admin/admins/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchAdmins()
  }

  const handleResetPassword = async (id: string) => {
    if (!confirm('Reset this admin\'s password? A temporary password will be generated.')) return
    const res = await fetch(`/api/admin/admins/${id}/reset-password`, { method: 'POST' })
    const json = await res.json()
    if (json.success && json.data?.temporaryPassword) {
      alert(`Temporary password: ${json.data.temporaryPassword}`)
    }
  }

  const roleBadge = (role: string) => {
    switch (role) {
      case 'super_admin': return <Badge className="bg-primary/10 text-primary border-primary/20">Super Admin</Badge>
      case 'admin': return <Badge variant="outline">Admin</Badge>
      default: return <Badge variant="secondary">{role}</Badge>
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="default" className="bg-emerald-600">Active</Badge>
      case 'suspended': return <Badge variant="destructive">Suspended</Badge>
      case 'disabled': return <Badge variant="secondary">Disabled</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Administrators
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage administrator accounts, roles, and permissions.
          </p>
        </div>
        <Button onClick={() => { setEditingAdmin(null); setShowCreateDialog(true) }}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Admin
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <Input
            placeholder="Search admins..."
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
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Modules</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-40 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-5 w-20 animate-pulse rounded-full bg-muted" /></TableCell>
                  <TableCell><div className="h-5 w-16 animate-pulse rounded-full bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell><div className="h-4 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : data && data.admins.length > 0 ? (
              data.admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{admin.name}</p>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                        {admin.phone && <p className="text-xs text-muted-foreground">{admin.phone}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{roleBadge(admin.role)}</TableCell>
                  <TableCell>{statusBadge(admin.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(admin.lastLoginAt)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {admin.role === 'super_admin' ? 'All' : `${admin.assignedModules.length} modules`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => { setEditingAdmin(admin); setShowCreateDialog(true) }}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleToggleStatus(admin.id, admin.status)}>
                        {admin.status === 'active' ? (
                          <svg className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleResetPassword(admin.id)}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(admin.id)}>
                        <svg className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <p className="text-muted-foreground">No administrators found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {((data.page - 1) * data.limit) + 1}–{Math.min(data.page * data.limit, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      {showCreateDialog && (
        <AdminFormDialog
          admin={editingAdmin}
          onClose={() => { setShowCreateDialog(false); setEditingAdmin(null) }}
          onSaved={() => { setShowCreateDialog(false); setEditingAdmin(null); fetchAdmins() }}
        />
      )}
    </div>
  )
}

function AdminFormDialog({ admin, onClose, onSaved }: {
  admin: AdminItem | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!admin
  const [name, setName] = useState(admin?.name || '')
  const [email, setEmail] = useState(admin?.email || '')
  const [phone, setPhone] = useState(admin?.phone || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(admin?.role || 'admin')
  const [status, setStatus] = useState(admin?.status || 'active')
  const [assignedModules, setAssignedModules] = useState<string[]>(admin?.assignedModules || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleModule = (mod: string) => {
    setAssignedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEdit) {
        const res = await fetch(`/api/admin/admins/${admin.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, role, status, assignedModules }),
        })
        const json = await res.json()
        if (!json.success) {
          setError(json.error?.message || 'Failed to update')
          return
        }
      } else {
        const res = await fetch('/api/admin/admins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone, role, status, assignedModules }),
        })
        const json = await res.json()
        if (!json.success) {
          setError(json.error?.message || 'Failed to create')
          return
        }
      }
      onSaved()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {isEdit ? 'Edit Administrator' : 'Create Administrator'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email *</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Phone</label>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" />
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password *</label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="Minimum 8 characters" />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role *</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === 'admin' && (
            <div className="space-y-3 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Assigned Modules</p>
                <p className="text-xs text-muted-foreground">Select which modules this admin can access</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ASSIGNABLE_MODULES.map((mod) => (
                  <label key={mod.value} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <Checkbox
                      checked={assignedModules.includes(mod.value)}
                      onCheckedChange={() => toggleModule(mod.value)}
                    />
                    {mod.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Admin'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
