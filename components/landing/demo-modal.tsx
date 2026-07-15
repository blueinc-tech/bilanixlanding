'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, CheckCircle2 } from 'lucide-react'

export function openDemo() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bilanix:open-demo'))
  }
}

export function DemoModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  })

  useEffect(() => {
    const handler = () => {
      setDone(false)
      setError('')
      setOpen(true)
    }
    window.addEventListener('bilanix:open-demo', handler)
    return () => window.removeEventListener('bilanix:open-demo', handler)
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const update = (k: string, v: string) => setForm((f) => ({ ...(f ?? {}), [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e?.preventDefault?.()
    setError('')
    if (!form?.name?.trim() || !form?.email?.trim()) {
      setError('Please enter your name and email.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(form ?? {}), formType: 'demo' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? 'Something went wrong. Please try again.')
      } else {
        setDone(true)
        setForm({ name: '', email: '', company: '', phone: '', message: '' })
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="scrollbar-none"
        style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          maxWidth: 480,
          width: '100%',
          padding: 32,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div className="flex items-start justify-between" style={{ marginBottom: 20 }}>
          <div>
            <h3 className="font-heading" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
              See Bilanix in action
            </h3>
          </div>
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '28px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <CheckCircle2 size={48} color="#60B746" />
            </div>
            <p style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, marginBottom: 8 }}>
              Thank you for reaching out.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              Our team will contact you shortly to schedule your personalized demo.
            </p>
            <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col" style={{ gap: 14 }}>
            <Field label="Full name *" value={form.name} onChange={(v) => update('name', v)} placeholder="Jane Adeyemi" />
            <Field label="Work email *" type="email" value={form.email} onChange={(v) => update('email', v)} placeholder="jane@company.com" />
            <Field label="Company" value={form.company} onChange={(v) => update('company', v)} placeholder="Your business name" />
            <Field label="Phone" value={form.phone} onChange={(v) => update('phone', v)} placeholder="+234 ..." />
            <div>
              <label style={labelStyle}>What would you like to see?</label>
              <textarea
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                rows={3}
                placeholder="Tell us about your business..."
                style={{
                  width: '100%',
                  resize: 'none',
                  fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '12px 18px',
                  fontSize: '0.9375rem',
                  color: '#fff',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>
            {error ? (
              <p style={{ fontSize: '0.8125rem', color: '#EF4444' }}>{error}</p>
            ) : null}
            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: 4 }} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Sending...' : 'Request demo'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: 'rgba(255,255,255,0.7)',
  marginBottom: 6,
  fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="newsletter-input"
        style={{ width: '100%' }}
      />
    </div>
  )
}
