'use client'

import { useState, useEffect } from 'react'
import { useClientAuth } from '@/components/client/client-auth-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface ProfileData {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  country?: string
  industry?: string
  address?: string
  status?: string
  createdAt?: string
  lastLoginAt?: string
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ProfilePage() {
  const { user: authClient, refreshUser: refreshAuth } = useClientAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [country, setCountry] = useState('')
  const [industry, setIndustry] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/client/profile')
        const data = await res.json()
        if (data.success && data.data) {
          const p: ProfileData = data.data
          setProfile(p)
          setName(p.name || '')
          setPhone(p.phone || '')
          setCompany(p.company || '')
          setCountry(p.country || '')
          setIndustry(p.industry || '')
          setAddress(p.address || '')
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  function handleReset() {
    if (profile) {
      setName(profile.name || '')
      setPhone(profile.phone || '')
      setCompany(profile.company || '')
      setCountry(profile.country || '')
      setIndustry(profile.industry || '')
      setAddress(profile.address || '')
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/client/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          company,
          country,
          industry,
          address,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Profile updated successfully')
        if (data.data) {
          setProfile(data.data)
        }
        await refreshAuth()
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const displayName = profile?.name || authClient?.name || 'User'
  const displayEmail = profile?.email || authClient?.email || ''
  const initial = displayName.charAt(0).toUpperCase()

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {initial}
              </div>
              <div>
                <p className="text-lg font-semibold">{displayName}</p>
                <p className="text-sm text-muted-foreground">{displayEmail}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={displayEmail}
                  readOnly
                  disabled
                  className="opacity-60"
                />
                <p className="text-xs text-muted-foreground">
                  Contact support to change your email
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Industry"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your address"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase text-muted-foreground">Member Since</p>
              <p className="text-sm">{formatDate(profile?.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase text-muted-foreground">Account Status</p>
              <div>
                <Badge variant={profile?.status === 'active' ? 'default' : 'secondary'}>
                  {profile?.status || 'Active'}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase text-muted-foreground">Last Login</p>
              <p className="text-sm">{formatDate(profile?.lastLoginAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
