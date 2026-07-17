'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useAdminAuth } from '@/components/admin/auth-provider'

interface SettingDefinition {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'json'
  defaultValue: unknown
  helpText?: string
}

interface SettingsGroupData {
  group: string
  settings: Record<string, unknown>
  definition: SettingDefinition[]
}

const GROUP_LABELS: Record<string, string> = {
  general: 'General',
  email: 'Email (AWS SES)',
  stripe: 'Stripe',
  paystack: 'Paystack',
  maintenance: 'Maintenance',
  branding: 'Branding',
  features: 'Features',
}

export default function SettingsPage() {
  const { admin } = useAdminAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('general')
  const [groups, setGroups] = useState<Record<string, SettingsGroupData>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const isSuperAdmin = admin?.role === 'super_admin'

  // Redirect non-super-admins to profile
  if (admin && !isSuperAdmin) {
    router.push('/admin/profile')
    return null
  }

  const fetchGroup = useCallback(async (group: string) => {
    try {
      const res = await fetch(`/api/admin/settings?group=${group}`)
      const json = await res.json()
      if (json.success) {
        setGroups((prev) => ({ ...prev, [group]: json.data }))
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    async function loadAll() {
      setLoading(true)
      const groupList = ['general', 'email', 'stripe', 'paystack', 'maintenance', 'branding', 'features']
      await Promise.all(groupList.map(fetchGroup))
      setLoading(false)
    }
    loadAll()
  }, [fetchGroup])

  const handleValueChange = (group: string, key: string, value: unknown) => {
    setGroups((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        settings: { ...prev[group].settings, [key]: value },
      },
    }))
  }

  const handleSave = async (group: string) => {
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const data = groups[group]
      if (!data) return

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group, values: data.settings }),
      })

      const json = await res.json()
      if (json.success) {
        setSaved(true)
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

  const renderField = (group: string, def: SettingDefinition, value: unknown) => {
    switch (def.type) {
      case 'boolean':
        return (
          <div key={def.key} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">{def.label}</p>
              {def.helpText && <p className="text-xs text-muted-foreground mt-0.5">{def.helpText}</p>}
            </div>
            <Switch
              checked={value === true}
              onCheckedChange={(checked) => handleValueChange(group, def.key, checked)}
            />
          </div>
        )
      case 'number':
        return (
          <div key={def.key} className="space-y-2">
            <label className="text-sm font-medium text-foreground">{def.label}</label>
            <Input
              type="number"
              value={String(value ?? def.defaultValue)}
              onChange={(e) => handleValueChange(group, def.key, Number(e.target.value))}
            />
            {def.helpText && <p className="text-xs text-muted-foreground">{def.helpText}</p>}
          </div>
        )
      case 'json':
        return (
          <div key={def.key} className="space-y-2">
            <label className="text-sm font-medium text-foreground">{def.label}</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={typeof value === 'string' ? value : JSON.stringify(value ?? def.defaultValue, null, 2)}
              onChange={(e) => {
                try {
                  handleValueChange(group, def.key, JSON.parse(e.target.value))
                } catch {
                  handleValueChange(group, def.key, e.target.value)
                }
              }}
            />
            {def.helpText && <p className="text-xs text-muted-foreground">{def.helpText}</p>}
          </div>
        )
      default:
        return (
          <div key={def.key} className="space-y-2">
            <label className="text-sm font-medium text-foreground">{def.label}</label>
            <Input
              type={def.key.includes('key') || def.key.includes('secret') ? 'password' : 'text'}
              value={String(value ?? def.defaultValue)}
              onChange={(e) => handleValueChange(group, def.key, e.target.value)}
              placeholder={String(def.defaultValue)}
            />
            {def.helpText && <p className="text-xs text-muted-foreground">{def.helpText}</p>}
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg border border-border bg-card" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your application settings.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {Object.keys(GROUP_LABELS).map((g) => (
            <TabsTrigger key={g} value={g}>{GROUP_LABELS[g]}</TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(GROUP_LABELS).map(([group, label]) => (
          <TabsContent key={group} value={group}>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{label}</h2>
                  <p className="text-sm text-muted-foreground">
                    {group === 'general' && 'Basic application configuration'}
                    {group === 'email' && 'AWS SES email service settings'}
                    {group === 'stripe' && 'Stripe payment gateway configuration'}
                    {group === 'paystack' && 'Paystack payment gateway configuration'}
                    {group === 'maintenance' && 'Maintenance mode and messaging'}
                    {group === 'branding' && 'Logo, colors, and visual identity'}
                    {group === 'features' && 'Enable or disable features'}
                  </p>
                </div>
              </div>

              {groups[group] ? (
                <div className="space-y-4">
                  {groups[group].definition.map((def) =>
                    renderField(group, def, groups[group].settings[def.key])
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No settings defined for this group.</p>
              )}

              <div className="mt-6 flex items-center gap-3">
                <Button onClick={() => handleSave(group)} loading={saving}>
                  Save Changes
                </Button>
                {saved && (
                  <Badge variant="default" className="bg-emerald-600">
                    Saved successfully
                  </Badge>
                )}
                {error && (
                  <Badge variant="destructive">{error}</Badge>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
