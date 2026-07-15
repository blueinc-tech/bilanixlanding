'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e?.preventDefault?.()
    setMsg('')
    setErr(false)
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email?.trim() ?? '')) {
      setErr(true)
      setMsg('Please enter a valid email.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr(true)
        setMsg(data?.error ?? 'Something went wrong.')
      } else {
        setErr(false)
        setMsg('Subscribed. Thank you.')
        setEmail('')
      }
    } catch {
      setErr(true)
      setMsg('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
        <input
          className="newsletter-input"
          type="email"
          placeholder="Enter your email"
          style={{ width: 180 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
        />
        <button type="submit" className="btn-primary" style={{ padding: '0 20px', whiteSpace: 'nowrap', fontSize: '0.875rem' }} disabled={loading}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : 'Subscribe'}
        </button>
      </form>
      {msg ? (
        <p style={{ fontSize: '0.75rem', marginTop: 8, color: err ? '#EF4444' : '#60B746' }}>{msg}</p>
      ) : null}
    </div>
  )
}
