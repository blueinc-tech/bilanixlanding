'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { RichTextEditor } from './rich-text-editor'

// ─── Types ─────────────────────────────────────────────────────────

type RecipientType = 'single' | 'multiple' | 'subscription_group' | 'csv'

interface RecipientEntry {
  email: string
  name?: string
  userId?: string
}

interface CSVValidation {
  totalImported: number
  valid: number
  invalid: number
  duplicates: number
  invalidEmails: { row: number; email: string; reason: string }[]
}

interface CampaignFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editCampaign?: {
    id: string
    name: string
    subject: string
    body: string
    recipientType?: string
    targetFilter?: Record<string, unknown> | null
  } | null
}

// ─── Email Validation ──────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(email: string): string | null {
  const trimmed = email.toLowerCase().trim()
  if (!trimmed) return 'Email is required'
  if (!EMAIL_REGEX.test(trimmed)) return 'Invalid email format'
  return null
}

// ─── Subscription Group Options ────────────────────────────────────

const SUBSCRIPTION_GROUPS = [
  { value: 'active', label: 'Active Users' },
  { value: 'inactive', label: 'Inactive Users' },
  { value: 'expiring_soon', label: 'Expiring Soon Users' },
  { value: 'all', label: 'All Users' },
  { value: 'newsletter', label: 'Newsletter Subscribers' },
] as const

// ─── Main Component ────────────────────────────────────────────────

export function CampaignFormDialog({ open, onOpenChange, onSaved, editCampaign }: CampaignFormDialogProps) {
  const isEdit = !!editCampaign
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: '',
    subject: '',
    body: '',
  })

  // ─── Recipient State ──────────────────────────────────────────
  const [recipientType, setRecipientType] = useState<RecipientType>('single')
  const [recipients, setRecipients] = useState<RecipientEntry[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [emailInputError, setEmailInputError] = useState('')

  // Single recipient
  const [singleEmail, setSingleEmail] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [clientResults, setClientResults] = useState<RecipientEntry[]>([])
  const [clientSearchLoading, setClientSearchLoading] = useState(false)
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [selectedClient, setSelectedClient] = useState<RecipientEntry | null>(null)
  const [useClientSearch, setUseClientSearch] = useState(false)
  const clientSearchRef = useRef<HTMLDivElement>(null)
  const clientSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Subscription group
  const [subGroup, setSubGroup] = useState<string>('active')
  const [subGroupCount, setSubGroupCount] = useState<number | null>(null)
  const [subGroupLoading, setSubGroupLoading] = useState(false)

  // CSV upload
  const [csvValidation, setCsvValidation] = useState<CSVValidation | null>(null)
  const [csvLoading, setCsvLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Reset on close / populate on edit ────────────────────────
  useEffect(() => {
    if (!open) {
      setForm({ name: '', subject: '', body: '' })
      setRecipientType('single')
      setRecipients([])
      setEmailInput('')
      setEmailInputError('')
      setSingleEmail('')
      setClientSearch('')
      setClientResults([])
      setSelectedClient(null)
      setUseClientSearch(false)
      setSubGroup('active')
      setSubGroupCount(null)
      setCsvValidation(null)
      setErrors({})
    } else if (editCampaign) {
      setForm({
        name: editCampaign.name,
        subject: editCampaign.subject,
        body: editCampaign.body,
      })
      if (editCampaign.recipientType) {
        setRecipientType(editCampaign.recipientType as RecipientType)
      }
      if (editCampaign.targetFilter) {
        const filter = editCampaign.targetFilter as Record<string, unknown>
        if (filter.recipients && Array.isArray(filter.recipients)) {
          setRecipients(filter.recipients as RecipientEntry[])
        }
        if (filter.group) {
          setSubGroup(filter.group as string)
        }
      }
    }
  }, [open, editCampaign])

  // ─── Client Search ────────────────────────────────────────────

  const searchClients = useCallback(async (query: string) => {
    if (query.length < 2) {
      setClientResults([])
      setShowClientDropdown(false)
      return
    }
    setClientSearchLoading(true)
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}&limit=10`)
      const json = await res.json()
      if (json.success && json.data) {
        setClientResults(
          json.data.map((u: { id: string; name: string; email: string; company?: string }) => ({
            email: u.email,
            name: u.name,
            userId: u.id,
          }))
        )
        setShowClientDropdown(true)
      }
    } catch {
      setClientResults([])
    } finally {
      setClientSearchLoading(false)
    }
  }, [])

  useEffect(() => {
    if (clientSearchTimeout.current) clearTimeout(clientSearchTimeout.current)
    clientSearchTimeout.current = setTimeout(() => searchClients(clientSearch), 300)
    return () => {
      if (clientSearchTimeout.current) clearTimeout(clientSearchTimeout.current)
    }
  }, [clientSearch, searchClients])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (clientSearchRef.current && !clientSearchRef.current.contains(e.target as Node)) {
        setShowClientDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ─── Subscription Group Fetch ─────────────────────────────────

  useEffect(() => {
    if (recipientType !== 'subscription_group' || !open) return
    setSubGroupLoading(true)
    setSubGroupCount(null)
    fetch(`/api/admin/campaigns/recipients?group=${subGroup}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSubGroupCount(json.data.total)
      })
      .catch(() => setSubGroupCount(null))
      .finally(() => setSubGroupLoading(false))
  }, [recipientType, subGroup, open])

  // ─── Multi-Email Input ────────────────────────────────────────

  const addEmail = (raw: string) => {
    const email = raw.toLowerCase().trim().replace(/[,;]+$/, '')
    if (!email) return

    const error = validateEmail(email)
    if (error) {
      setEmailInputError(error)
      return
    }

    if (recipients.some((r) => r.email === email)) {
      setEmailInputError('Duplicate email address')
      return
    }

    setRecipients((prev) => [...prev, { email }])
    setEmailInput('')
    setEmailInputError('')
  }

  const removeRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((r) => r.email !== email))
  }

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addEmail(emailInput)
    }
    if (e.key === 'Backspace' && !emailInput && recipients.length > 0) {
      setRecipients((prev) => prev.slice(0, -1))
    }
  }

  // ─── CSV Upload ───────────────────────────────────────────────

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvLoading(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

      // Skip header if present
      const startIdx = lines[0]?.toLowerCase().includes('email') ? 1 : 0
      const emails = lines.slice(startIdx)

      const seen = new Set<string>()
      const valid: string[] = []
      const invalid: { row: number; email: string; reason: string }[] = []
      let duplicates = 0

      emails.forEach((raw, idx) => {
        const email = raw.toLowerCase().trim()
        if (!email) return

        if (seen.has(email)) {
          duplicates++
          return
        }
        seen.add(email)

        const error = validateEmail(email)
        if (error) {
          invalid.push({ row: idx + startIdx + 1, email: raw, reason: error })
        } else {
          valid.push(email)
        }
      })

      setCsvValidation({
        totalImported: emails.length,
        valid: valid.length,
        invalid: invalid.length,
        duplicates,
        invalidEmails: invalid,
      })

      // Set valid emails as recipients
      setRecipients(valid.map((email) => ({ email })))
      setCsvLoading(false)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const downloadErrorReport = () => {
    if (!csvValidation?.invalidEmails.length) return
    const rows = ['Row,Email,Reason']
    csvValidation.invalidEmails.forEach((e) => rows.push(`${e.row},"${e.email}","${e.reason}"`))
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'invalid-emails.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Get Total Recipients Count ───────────────────────────────

  const getTotalRecipients = (): number => {
    switch (recipientType) {
      case 'single':
        return selectedClient || (singleEmail && !validateEmail(singleEmail)) ? 1 : 0
      case 'multiple':
        return recipients.length
      case 'subscription_group':
        return subGroupCount || 0
      case 'csv':
        return recipients.length
      default:
        return 0
    }
  }

  // ─── Submit ───────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate recipients
    const totalRecipients = getTotalRecipients()
    if (totalRecipients === 0) {
      setErrors({ submit: 'Please add at least one recipient' })
      return
    }

    setLoading(true)

    try {
      const body: Record<string, unknown> = {
        name: form.name,
        subject: form.subject,
        body: form.body,
        recipientType,
      }

      switch (recipientType) {
        case 'single': {
          if (selectedClient) {
            body.recipients = [{ email: selectedClient.email, name: selectedClient.name, userId: selectedClient.userId }]
          } else {
            body.recipients = [{ email: singleEmail }]
          }
          body.targetFilter = { recipients: body.recipients }
          break
        }
        case 'multiple':
          body.recipients = recipients
          body.targetFilter = { recipients }
          break
        case 'subscription_group':
          body.targetFilter = { group: subGroup }
          break
        case 'csv':
          body.recipients = recipients
          body.targetFilter = { recipients }
          break
      }

      const url = isEdit ? `/api/admin/campaigns/${editCampaign!.id}` : '/api/admin/campaigns'
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

  // ─── Render: Recipient Type Selector ──────────────────────────

  const recipientTypeOptions: { value: RecipientType; label: string }[] = [
    { value: 'single', label: 'Single Recipient' },
    { value: 'multiple', label: 'Multiple Recipients' },
    { value: 'subscription_group', label: 'Subscription Group' },
    { value: 'csv', label: 'CSV Upload' },
  ]

  // ─── Render: Recipient Section ────────────────────────────────

  const renderRecipientSection = () => {
    switch (recipientType) {
      case 'single':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setUseClientSearch(false); setSelectedClient(null); setClientSearch(''); setSingleEmail('') }}
                className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-md transition-colors',
                  !useClientSearch ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Email Address
              </button>
              <button
                type="button"
                onClick={() => { setUseClientSearch(true); setSingleEmail(''); setSelectedClient(null) }}
                className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-md transition-colors',
                  useClientSearch ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Search Client
              </button>
            </div>

            {!useClientSearch ? (
              <Input
                type="email"
                placeholder="email@example.com"
                value={singleEmail}
                onChange={(e) => { setSingleEmail(e.target.value); setSelectedClient(null) }}
              />
            ) : (
              <div ref={clientSearchRef} className="relative">
                <Input
                  placeholder="Search by name, email, or company..."
                  value={selectedClient ? `${selectedClient.name} (${selectedClient.email})` : clientSearch}
                  onChange={(e) => { setClientSearch(e.target.value); setSelectedClient(null) }}
                  onFocus={() => { if (clientResults.length > 0) setShowClientDropdown(true) }}
                />
                {clientSearchLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
                {showClientDropdown && clientResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
                    {clientResults.map((client) => (
                      <button
                        key={client.email}
                        type="button"
                        onClick={() => {
                          setSelectedClient(client)
                          setClientSearch('')
                          setShowClientDropdown(false)
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {client.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{client.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showClientDropdown && clientResults.length === 0 && !clientSearchLoading && clientSearch.length >= 2 && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg p-4 text-center text-sm text-muted-foreground">
                    No clients found
                  </div>
                )}
              </div>
            )}

            {selectedClient && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 p-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                  {selectedClient.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{selectedClient.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{selectedClient.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )

      case 'multiple':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-input bg-background p-2 min-h-[42px] focus-within:ring-2 focus-within:ring-ring">
              {recipients.map((r) => (
                <span
                  key={r.email}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {r.email}
                  <button
                    type="button"
                    onClick={() => removeRecipient(r.email)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={recipients.length === 0 ? 'Type email and press Enter or comma...' : ''}
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setEmailInputError('') }}
                onKeyDown={handleEmailKeyDown}
                onBlur={() => { if (emailInput.trim()) addEmail(emailInput) }}
                className="flex-1 min-w-[180px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            {emailInputError && (
              <p className="text-xs text-destructive">{emailInputError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Press <kbd className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium">Enter</kbd> or <kbd className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium">,</kbd> to add. Press <kbd className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium">Backspace</kbd> to remove last.
            </p>
          </div>
        )

      case 'subscription_group':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {SUBSCRIPTION_GROUPS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setSubGroup(g.value)}
                  className={cn(
                    'rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                    subGroup === g.value
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20'
                      : 'border-border bg-background text-muted-foreground hover:border-border hover:text-foreground'
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              {subGroupLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              )}
              <span className="text-sm text-foreground font-medium">
                {subGroupLoading ? 'Loading...' : `${subGroupCount ?? 0} recipients`}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Recipients are fetched live from the Clients database using current subscription status.
            </p>
          </div>
        )

      case 'csv':
        return (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />

            {!csvValidation ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={csvLoading}
                className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {csvLoading ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {csvLoading ? 'Processing...' : 'Upload CSV File'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accepts .csv with email column
                  </p>
                </div>
              </button>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-lg font-semibold text-foreground">{csvValidation.totalImported}</p>
                    <p className="text-xs text-muted-foreground">Total Imported</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
                    <p className="text-lg font-semibold text-emerald-600">{csvValidation.valid}</p>
                    <p className="text-xs text-muted-foreground">Valid Emails</p>
                  </div>
                  <div className="rounded-lg bg-red-500/10 p-3 text-center">
                    <p className="text-lg font-semibold text-red-600">{csvValidation.invalid}</p>
                    <p className="text-xs text-muted-foreground">Invalid Emails</p>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 p-3 text-center">
                    <p className="text-lg font-semibold text-amber-600">{csvValidation.duplicates}</p>
                    <p className="text-xs text-muted-foreground">Duplicates</p>
                  </div>
                </div>

                {csvValidation.invalidEmails.length > 0 && (
                  <Button type="button" variant="outline" size="sm" onClick={downloadErrorReport} className="w-full">
                    <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download Error Report ({csvValidation.invalidEmails.length} rows)
                  </Button>
                )}

                {recipients.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {recipients.slice(0, 20).map((r) => (
                      <span
                        key={r.email}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {r.email}
                        <button
                          type="button"
                          onClick={() => removeRecipient(r.email)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    {recipients.length > 20 && (
                      <span className="text-xs text-muted-foreground self-center">+{recipients.length - 20} more</span>
                    )}
                  </div>
                )}

                <Button type="button" variant="outline" size="sm" onClick={() => { setCsvValidation(null); setRecipients([]); }} className="w-full">
                  Upload Different File
                </Button>
              </>
            )}

            <p className="text-xs text-muted-foreground">
              Expected format: CSV with an <code className="rounded bg-muted px-1 py-0.5 text-[11px]">Email</code> column header. Duplicate emails are automatically removed.
            </p>
          </div>
        )
    }
  }

  // ─── Campaign Summary ─────────────────────────────────────────

  const totalRecipients = getTotalRecipients()
  const recipientTypeLabels: Record<RecipientType, string> = {
    single: 'Single Recipient',
    multiple: 'Multiple Recipients',
    subscription_group: `Subscription Group (${SUBSCRIPTION_GROUPS.find((g) => g.value === subGroup)?.label || subGroup})`,
    csv: 'CSV Upload',
  }

  // ─── Render ───────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Campaign' : 'New Campaign'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update campaign details before sending.' : 'Create and send an email campaign.'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.submit && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errors.submit}</div>
          )}

          {/* ─── Campaign Details ──────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Campaign Details</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Campaign Name *</label>
              <Input
                placeholder="e.g., Welcome Series"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Subject *</label>
              <Input
                placeholder="e.g., Welcome to Bilanix!"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Body *</label>
              <RichTextEditor
                content={form.body}
                onChange={(html) => setForm({ ...form, body: html })}
                placeholder="Write your email content..."
                className="min-h-[180px]"
              />
            </div>
          </div>

          {/* ─── Recipient Section ─────────────────────────── */}
          <div className="space-y-3 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Recipients</h3>
              {totalRecipients > 0 && (
                <Badge variant="secondary" className="font-mono">
                  {totalRecipients} recipient{totalRecipients !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Recipient Type Selector */}
            <div className="rounded-lg border border-border bg-muted/30 p-1">
              <div className="grid grid-cols-4 gap-1">
                {recipientTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setRecipientType(opt.value)
                      setRecipients([])
                      setEmailInput('')
                      setEmailInputError('')
                      setCsvValidation(null)
                    }}
                    className={cn(
                      'rounded-md px-2 py-1.5 text-xs font-medium transition-all',
                      recipientType === opt.value
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Recipient Section */}
            {renderRecipientSection()}
          </div>

          {/* ─── Campaign Summary ──────────────────────────── */}
          <div className="border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Campaign Summary</h3>
            <div className="rounded-lg bg-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recipient Type</span>
                <span className="font-medium text-foreground">{recipientTypeLabels[recipientType]}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Recipients</span>
                <span className="font-medium text-foreground">{totalRecipients}</span>
              </div>
              {form.subject && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Campaign Subject</span>
                  <span className="font-medium text-foreground truncate max-w-[250px]">{form.subject}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated Send Count</span>
                <Badge variant={totalRecipients > 0 ? 'default' : 'secondary'} className="font-mono">
                  {totalRecipients}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>{isEdit ? 'Save Changes' : 'Create Campaign'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
