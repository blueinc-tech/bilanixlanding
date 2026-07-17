'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Loader2, ChevronRight, ChevronLeft, Check, CreditCard } from 'lucide-react'

export function openRegistration() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bilanix:open-registration'))
  }
}

type Billing = 'monthly' | 'yearly'

type Plan = {
  id: string
  slug: string
  name: string
  audience: string
  price: Record<Billing, number>
  features: string[]
}

type Gateways = {
  stripe: { enabled: boolean; publishableKey: string }
  paystack: { enabled: boolean; publicKey: string }
}

export function RegistrationModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    industry: '',
  })

  const [plans, setPlans] = useState<Plan[]>([])
  const [billing, setBilling] = useState<Billing>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [gateways, setGateways] = useState<Gateways | null>(null)

  useEffect(() => {
    const handler = () => {
      setStep(1)
      setError('')
      setLoading(false)
      setSelectedPlan(null)
      setOpen(true)
    }
    window.addEventListener('bilanix:open-registration', handler)
    return () => window.removeEventListener('bilanix:open-registration', handler)
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

  useEffect(() => {
    if (step === 2 && plans.length === 0) {
      fetch('/api/plans')
        .then((r) => r.json())
        .then((json) => {
          const list = Array.isArray(json) ? json : json.data
          if (Array.isArray(list)) {
            setPlans(list.map((p: any) => ({
              ...p,
              price: { monthly: p.monthlyAmount ?? 0, yearly: p.yearlyAmount ?? 0 },
            })))
          }
        })
        .catch(() => {})
    }
  }, [step, plans.length])

  useEffect(() => {
    if (step === 3 && !gateways) {
      fetch('/api/settings/gateways')
        .then((r) => r.json())
        .then((json) => {
          const gw = json?.data || json
          if (gw && typeof gw === 'object' && (gw.stripe || gw.paystack)) setGateways(gw)
        })
        .catch(() => {})
    }
  }, [step, gateways])

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const validateStep1 = useCallback(() => {
    if (!form.name.trim()) {
      setError('Full name is required.')
      return false
    }
    if (!form.email.trim()) {
      setError('Email is required.')
      return false
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(form.email.trim())) {
      setError('Please enter a valid email address.')
      return false
    }
    return true
  }, [form.name, form.email])

  const goNext = () => {
    setError('')
    if (step === 1) {
      if (!validateStep1()) return
    }
    if (step === 2 && !selectedPlan) {
      setError('Please select a plan.')
      return
    }
    setStep((s) => s + 1)
  }

  const goBack = () => {
    setError('')
    setStep((s) => s - 1)
  }

  const handlePayment = async (provider: string) => {
    setError('')
    setLoading(true)
    setStep(4)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          planSlug: selectedPlan?.slug,
          billing,
          gateway: provider,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.url) {
        setError(data?.error || 'Checkout failed. Please try again.')
        setStep(3)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClose = () => {
    if (step === 4) return
    setOpen(false)
  }

  const handleClose = () => {
    if (step === 4) return
    setOpen(false)
  }

  const fmt = (n: number) => n.toLocaleString('en-NG')

  const stripeGw = gateways?.stripe?.enabled ? gateways.stripe : null
  const paystackGw = gateways?.paystack?.enabled ? gateways.paystack : null

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={handleBackdropClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="scrollbar-none"
        style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          maxWidth: 560,
          width: '100%',
          padding: 32,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div className="flex items-start justify-between" style={{ marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                marginBottom: 4,
              }}
            >
              Step {step > 3 ? 3 : step} of 3
            </p>
            <h3
              className="font-heading"
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#fff',
              }}
            >
              {step === 1 && 'Your Information'}
              {step === 2 && 'Choose a Plan'}
              {step === 3 && 'Complete Payment'}
              {step === 4 && 'Processing'}
            </h3>
          </div>
          <button
            aria-label="Close"
            onClick={handleClose}
            style={{
              color: 'rgba(255,255,255,0.5)',
              background: 'none',
              border: 'none',
              cursor: step === 4 ? 'not-allowed' : 'pointer',
              opacity: step === 4 ? 0.3 : 1,
            }}
          >
            <X size={22} />
          </button>
        </div>

        {step === 1 && (
          <div className="flex flex-col" style={{ gap: 14 }}>
            <Field label="Full Name *" value={form.name} onChange={(v) => update('name', v)} placeholder="Jane Adeyemi" />
            <Field label="Email *" type="email" value={form.email} onChange={(v) => update('email', v)} placeholder="jane@company.com" />
            <Field label="Phone" value={form.phone} onChange={(v) => update('phone', v)} placeholder="+234 ..." />
            <Field label="Company" value={form.company} onChange={(v) => update('company', v)} placeholder="Your business name" />
            <Field label="Country" value={form.country} onChange={(v) => update('country', v)} placeholder="Nigeria" />
            <Field label="Industry" value={form.industry} onChange={(v) => update('industry', v)} placeholder="Accounting, Finance..." />
            {error && <p style={{ fontSize: '0.8125rem', color: '#EF4444' }}>{error}</p>}
            <button className="btn-primary" style={{ justifyContent: 'center', marginTop: 4 }} onClick={goNext}>
              Continue
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col" style={{ gap: 20 }}>
            <div className="flex justify-center">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  borderRadius: 99,
                  background: '#F3F4F6',
                  padding: 4,
                }}
              >
                {(['monthly', 'yearly'] as Billing[]).map((option) => {
                  const active = billing === option
                  return (
                    <button
                      key={option}
                      onClick={() => setBilling(option)}
                      style={{
                        position: 'relative',
                        borderRadius: 99,
                        padding: '8px 20px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                      }}
                    >
                      {active && (
                        <span
                          style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: 99,
                            border: '1px solid #60B746',
                            background: '#fff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          }}
                        />
                      )}
                      <span
                        style={{
                          position: 'relative',
                          zIndex: 1,
                          textTransform: 'capitalize',
                          color: active ? '#0F0F0F' : '#6B7280',
                        }}
                      >
                        {option}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {plans.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Loader2 size={24} className="animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} />
              </div>
            )}

            {plans.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id
              const price = plan.price[billing] ?? 0
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  style={{
                    border: isSelected ? '2px solid #60B746' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16,
                    padding: 20,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, background 0.2s',
                    background: isSelected ? 'rgba(96,183,70,0.06)' : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
                          {plan.name}
                        </p>
                        {isSelected && <Check size={16} color="#60B746" />}
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', marginTop: 2, fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
                        {plan.audience}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
                        ₦{fmt(price)}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
                        /{billing === 'monthly' ? 'mo' : 'yr'}
                      </p>
                    </div>
                  </div>
                  {plan.features.length > 0 && (
                    <ul style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {plan.features.slice(0, 5).map((feature) => (
                        <li
                          key={feature}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                            fontSize: '0.8125rem',
                            color: 'rgba(255,255,255,0.6)',
                            fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                          }}
                        >
                          <Check size={14} style={{ marginTop: 2, flexShrink: 0, color: '#60B746' }} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}

            {error && <p style={{ fontSize: '0.8125rem', color: '#EF4444' }}>{error}</p>}

            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button
                className="btn-ghost"
                style={{ justifyContent: 'center', flex: 1 }}
                onClick={goBack}
              >
                <ChevronLeft size={16} />
                Back
              </button>
              <button
                className="btn-primary"
                style={{ justifyContent: 'center', flex: 1 }}
                onClick={goNext}
              >
                Continue
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col" style={{ gap: 20 }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: 20,
              }}
            >
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12, fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
                Order Summary
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.9375rem', color: '#fff', fontWeight: 600, fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
                  {selectedPlan?.name} Plan
                </span>
                <span style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif', textTransform: 'capitalize' }}>
                  {billing}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
                  ₦{fmt(selectedPlan?.price[billing] ?? 0)}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
                  /{billing === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
            </div>

            <div className="flex flex-col" style={{ gap: 12 }}>
              {!stripeGw && !paystackGw && (
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '16px 0', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
                  No payment gateways available. Please contact support.
                </p>
              )}
              {stripeGw && (
                <button
                  onClick={() => handlePayment('stripe')}
                  disabled={loading}
                  style={{
                    fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    width: '100%',
                    minHeight: 48,
                    borderRadius: 12,
                    border: 'none',
                    background: '#635BFF',
                    color: '#fff',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <CreditCard size={18} />
                  Pay with Stripe
                </button>
              )}
              {paystackGw && (
                <button
                  onClick={() => handlePayment('paystack')}
                  disabled={loading}
                  style={{
                    fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    width: '100%',
                    minHeight: 48,
                    borderRadius: 12,
                    border: 'none',
                    background: '#008751',
                    color: '#fff',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <CreditCard size={18} />
                  Pay with Paystack
                </button>
              )}
            </div>

            {error && <p style={{ fontSize: '0.8125rem', color: '#EF4444' }}>{error}</p>}

            <button
              className="btn-ghost"
              style={{ justifyContent: 'center', marginTop: 4 }}
              onClick={goBack}
            >
              <ChevronLeft size={16} />
              Back
            </button>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Loader2
              size={40}
              className="animate-spin"
              style={{ color: '#60B746', margin: '0 auto 20px' }}
            />
            <p style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
              Processing your payment...
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}>
              Please do not close this window.
            </p>
          </div>
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
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="newsletter-input"
        style={{ width: '100%' }}
      />
    </div>
  )
}
