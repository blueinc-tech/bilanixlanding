'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Badge } from '@/components/ui/badge'
import { useAdminAuth } from '@/components/admin/auth-provider'

interface ProfileData {
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
  updatedAt: string
}

export default function ProfilePage() {
  const { admin, refresh } = useAdminAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/admin/profile')
        const json = await res.json()
        if (json.success) {
          setProfile(json.data)
          setName(json.data.name)
          setEmail(json.data.email)
          setPhone(json.data.phone || '')
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      })
      const json = await res.json()
      if (json.success) {
        setProfile(json.data)
        setSaved(true)
        refresh()
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(json.error?.message || 'Failed to save')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordError('')
    setPasswordSaved(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      setPasswordSaving(false)
      return
    }

    try {
      const res = await fetch('/api/admin/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const json = await res.json()
      if (json.success) {
        setPasswordSaved(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSaved(false), 3000)
      } else {
        setPasswordError(json.error?.message || 'Failed to change password')
      }
    } catch {
      setPasswordError('Network error')
    } finally {
      setPasswordSaving(false)
    }
  }

  const roleBadge = (role: string) => {
    switch (role) {
      case 'super_admin': return <Badge className="bg-primary/10 text-primary border-primary/20">Super Admin</Badge>
      case 'admin': return <Badge variant="outline">Admin</Badge>
      default: return <Badge variant="secondary">{role}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Info Card */}
      {profile && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{profile.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {roleBadge(profile.role)}
                <Badge variant={profile.status === 'active' ? 'default' : 'secondary'} className={profile.status === 'active' ? 'bg-emerald-600' : ''}>
                  {profile.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-muted-foreground">Last Login</p>
              <p className="text-foreground">
                {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last IP</p>
              <p className="text-foreground">{profile.lastLoginIp || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="text-foreground">{new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Updated</p>
              <p className="text-foreground">{new Date(profile.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground mb-4">
          Edit Profile
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Phone</label>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            {saved && <Badge variant="default" className="bg-emerald-600">Saved successfully</Badge>}
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground mb-4">
          Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Current Password</label>
            <PasswordInput value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">New Password</label>
            <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Confirm New Password</label>
            <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
          </div>

          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={passwordSaving}>
              {passwordSaving ? 'Saving...' : 'Change Password'}
            </Button>
            {passwordSaved && <Badge variant="default" className="bg-emerald-600">Password changed</Badge>}
          </div>
        </form>
      </div>
    </div>
  )
}
