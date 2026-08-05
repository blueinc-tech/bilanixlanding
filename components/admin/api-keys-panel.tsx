'use client'

import { useState, useEffect, useCallback } from 'react'
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

interface ApiKeyRow {
  id: string
  name: string
  keyId: string
  lastUsedAt: string | null
  revokedAt: string | null
  createdAt: string
  admin: { id: string; name: string } | null
}

interface NewKey {
  id: string
  name: string
  keyId: string
  secret: string
  createdAt: string
}

export function ApiKeysPanel() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const [newKey, setNewKey] = useState<NewKey | null>(null)
  const [copied, setCopied] = useState<'keyId' | 'secret' | null>(null)

  const [revokeConfirm, setRevokeConfirm] = useState<ApiKeyRow | null>(null)
  const [revoking, setRevoking] = useState(false)

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/api-keys')
      const json = await res.json()
      if (json.success) {
        setKeys(json.data)
      } else {
        setError(json.error?.message || 'Failed to load API keys')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchKeys() }, [fetchKeys])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const json = await res.json()
      if (json.success) {
        setShowCreate(false)
        setNewName('')
        setNewKey(json.data)
        fetchKeys()
      } else {
        setError(json.error?.message || 'Failed to create API key')
      }
    } catch {
      setError('Network error')
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async () => {
    if (!revokeConfirm) return
    setRevoking(true)
    try {
      const res = await fetch(`/api/admin/api-keys/${revokeConfirm.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setRevokeConfirm(null)
        fetchKeys()
      }
    } catch { /* silent */ } finally {
      setRevoking(false)
    }
  }

  const copyToClipboard = (value: string, field: 'keyId' | 'secret') => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">API Access</h2>
          <p className="text-sm text-muted-foreground">
            Keys used by app.bilanix.com to check subscriber status and provision access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/api/admin/api-keys/postman-collection" download>
            <Button variant="outline">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 12m0 0l4.5-4.5M12 12V3" />
              </svg>
              Download Postman Collection
            </Button>
          </a>
          <Button onClick={() => { setNewName(''); setShowCreate(true) }}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Generate Key
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key ID</TableHead>
            <TableHead>Created by</TableHead>
            <TableHead>Last used</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                Loading…
              </TableCell>
            </TableRow>
          ) : keys.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                No API keys yet. Generate one for app.bilanix.com to authenticate with.
              </TableCell>
            </TableRow>
          ) : (
            keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium text-foreground">{key.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{key.keyId}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{key.admin?.name || '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}
                </TableCell>
                <TableCell>
                  {key.revokedAt ? (
                    <Badge variant="destructive">Revoked</Badge>
                  ) : (
                    <Badge variant="default" className="bg-emerald-600">Active</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!key.revokedAt && (
                    <Button variant="ghost" size="sm" onClick={() => setRevokeConfirm(key)}>
                      Revoke
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Inline integration docs */}
      <div className="mt-8 space-y-4 border-t border-border pt-6">
        <div>
          <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
            Integration Reference
          </h3>
          <p className="text-sm text-muted-foreground">
            For the app.bilanix.com team. Import the Postman collection above, or wire it up directly using this reference.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Authentication</p>
          <p className="text-sm text-muted-foreground">
            Send both headers on every request, using the Key ID and Secret from a key generated above:
          </p>
          <pre className="rounded-lg border border-border bg-muted p-3 text-xs font-mono overflow-x-auto">
{`X-API-Key: <key id>
X-API-Secret: <secret>`}
          </pre>
          <p className="text-xs text-muted-foreground">Rate limit: 120 requests/minute per key.</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">GET /api/v1/subscribers/:email</p>
          <p className="text-sm text-muted-foreground">
            Real-time single lookup — use at login on app.bilanix.com to gate access. Returns 404 if the email never registered.
          </p>
          <pre className="rounded-lg border border-border bg-muted p-3 text-xs font-mono overflow-x-auto">
{`curl -H "X-API-Key: <key id>" \\
     -H "X-API-Secret: <secret>" \\
     "https://bilanixlanding.com/api/v1/subscribers/jane@example.com"`}
          </pre>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">GET /api/v1/subscribers?cursor=&amp;limit=</p>
          <p className="text-sm text-muted-foreground">
            Full roster, paginated via <code className="text-xs">nextCursor</code>. Poll on a schedule (e.g. hourly) — status is
            computed from each subscription&apos;s end date, so nothing pushes a notification when access should be suspended.
          </p>
          <pre className="rounded-lg border border-border bg-muted p-3 text-xs font-mono overflow-x-auto">
{`curl -H "X-API-Key: <key id>" \\
     -H "X-API-Secret: <secret>" \\
     "https://bilanixlanding.com/api/v1/subscribers?limit=100"`}
          </pre>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Status values</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Meaning</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">pending</TableCell>
                <TableCell className="text-sm text-muted-foreground">Registered, payment not completed</TableCell>
                <TableCell className="text-sm text-muted-foreground">Do not provision</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">active</TableCell>
                <TableCell className="text-sm text-muted-foreground">Paid, end date in the future</TableCell>
                <TableCell className="text-sm text-muted-foreground">Provision / keep running</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">expired</TableCell>
                <TableCell className="text-sm text-muted-foreground">Paid, end date has passed</TableCell>
                <TableCell className="text-sm text-muted-foreground">Suspend</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">cancelled</TableCell>
                <TableCell className="text-sm text-muted-foreground">Subscription explicitly cancelled</TableCell>
                <TableCell className="text-sm text-muted-foreground">Suspend</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create key dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
            <DialogDescription>
              Give this key a name so you know what it&apos;s for, e.g. &quot;app.bilanix.com production&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="app.bilanix.com production"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating} disabled={!newName.trim()}>
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal secret dialog — shown exactly once, right after creation */}
      <Dialog open={!!newKey} onOpenChange={(open) => { if (!open) setNewKey(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy the secret now — it won&apos;t be shown again. Store it securely on app.bilanix.com.
            </DialogDescription>
          </DialogHeader>
          {newKey && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">X-API-Key</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-xs break-all">
                    {newKey.keyId}
                  </code>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(newKey.keyId, 'keyId')}>
                    {copied === 'keyId' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">X-API-Secret</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-xs break-all">
                    {newKey.secret}
                  </code>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(newKey.secret, 'secret')}>
                    {copied === 'secret' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-700 dark:text-amber-400">
                This secret is not stored anywhere in readable form. If you lose it, revoke this key and generate a new one.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setNewKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirmation */}
      <Dialog open={!!revokeConfirm} onOpenChange={(open) => { if (!open) setRevokeConfirm(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              {revokeConfirm && (
                <>Revoke &quot;{revokeConfirm.name}&quot;? Any integration using this key will immediately lose access.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRevoke} loading={revoking}>Revoke</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
