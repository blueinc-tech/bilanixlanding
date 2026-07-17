'use client'

import { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { RegistrationModal } from '@/components/landing/registration-modal'
import { PricingHero } from '@/components/landing/pricing-hero'
import { PricingCard } from '@/components/landing/pricing-card'
import { ComparisonTable } from '@/components/landing/comparison-table'
import { PricingFAQ } from '@/components/landing/pricing-faq'
import { PricingCTA } from '@/components/landing/pricing-cta'
import { Reveal } from '@/components/landing/reveal'

type Billing = 'monthly' | 'yearly'

type Plan = {
  name: string
  audience: string
  price: Record<Billing, string>
  period: Record<Billing, string>
  cta: string
  features: string[]
  featured?: boolean
  badge?: string
}

const formatNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>('yearly')
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})
  const [lockedHeight, setLockedHeight] = useState<number | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/plans')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch plans')
        return res.json()
      })
      .then((json: any) => {
        const list = Array.isArray(json) ? json : json?.data
        if (!Array.isArray(list)) throw new Error('Invalid data')
        const transformed: Plan[] = list.map((p: any) => ({
          name: p.name,
          audience: p.audience,
          price: {
            monthly: formatNaira(p.monthlyAmount),
            yearly: formatNaira(p.yearlyAmount),
          },
          period: {
            monthly: '/mo/user',
            yearly: '/yr/user',
          },
          cta: p.ctaText,
          features: p.features,
          featured: !!p.badge,
          badge: p.badge,
        }))
        setPlans(transformed)
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const toggleExpand = (name: string) => {
    setExpandedCards((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  useEffect(() => {
    if (!gridRef.current) return
    const frame = requestAnimationFrame(() => {
      const cards = gridRef.current!.querySelectorAll<HTMLElement>('[data-card]')
      let max = 0
      cards.forEach((card) => {
        if (card.offsetHeight > max) max = card.offsetHeight
      })
      if (max > 0) setLockedHeight(max)
    })
    return () => cancelAnimationFrame(frame)
  }, [billing, plans])

  return (
    <div className="bilanix">
      <Navbar />
      <main>
        <PricingHero billing={billing} onBillingChange={setBilling} />

        <section style={{ background: '#fff', padding: '64px 0 80px' }}>
          <div className="max-w-page" style={{ padding: '0 20px' }}>
            <div ref={gridRef} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 20,
              maxWidth: 1200,
              margin: '0 auto',
              alignItems: 'start',
            }}>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ background: '#f9fafb', borderRadius: 12, padding: 32 }}>
                      <div style={{ height: 14, width: 80, background: '#e5e7eb', borderRadius: 4, marginBottom: 12 }} />
                      <div style={{ height: 12, width: 160, background: '#e5e7eb', borderRadius: 4, marginBottom: 24 }} />
                      <div style={{ height: 28, width: 110, background: '#e5e7eb', borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 12, width: 60, background: '#e5e7eb', borderRadius: 4, marginBottom: 24 }} />
                      <div style={{ height: 44, width: '100%', background: '#e5e7eb', borderRadius: 22, marginBottom: 24 }} />
                      {[1, 2, 3].map((j) => (
                        <div key={j} style={{ height: 12, width: '90%', background: '#e5e7eb', borderRadius: 4, marginBottom: 10 }} />
                      ))}
                    </div>
                  ))
                : plans.map((plan, i) => (
                    <div key={plan.name}>
                      <PricingCard
                        {...plan}
                        index={i}
                        billing={billing}
                        expanded={expandedCards[plan.name] ?? false}
                        onToggleExpand={() => toggleExpand(plan.name)}
                        cardHeight={lockedHeight}
                      />
                    </div>
                  ))
              }
            </div>

            <Reveal>
              <p style={{ marginTop: 40, textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>
                Prices in Nigerian Naira (₦). VAT-inclusive pricing available on request.
              </p>
            </Reveal>
          </div>
        </section>

        <ComparisonTable />
        <PricingFAQ />
        <PricingCTA />
      </main>
      <Footer />
      <RegistrationModal />
    </div>
  )
}
