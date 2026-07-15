'use client'

import { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { DemoModal } from '@/components/landing/demo-modal'
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

const PLANS: Plan[] = [
  {
    name: 'Basic',
    audience: 'Freelancers & Small Accounting Firms',
    price: { yearly: '₦200,000', monthly: '₦25,000' },
    period: { yearly: '/yr/user', monthly: '/mo/user' },
    cta: 'Get started',
    features: [
      'Up to 20 clients',
      'Bookkeeping & bank reconciliation',
      'Asset register',
      'Accounting & financial statement presentation',
      'Invoice attachment',
    ],
  },
  {
    name: 'Professional',
    audience: 'Medium Sized Accounting Firms',
    price: { yearly: '₦500,000', monthly: '₦60,000' },
    period: { yearly: '/yr/2 users', monthly: '/mo/2 users' },
    cta: 'Get started',
    featured: true,
    badge: 'Most Popular',
    features: [
      'Up to 50 clients',
      'Bookkeeping & bank reconciliation',
      'Asset register',
      'Accounting & financial statement presentation',
      'AI invoicing entries',
      'Invoice attachments & lettering',
      'Accountant validation feature',
      'Supervisor role',
    ],
  },
  {
    name: 'Enterprise',
    audience: 'Big Accounting Firms',
    price: { yearly: '₦750,000', monthly: '₦90,000' },
    period: { yearly: '/yr/5 users', monthly: '/mo/5 users' },
    cta: 'Get started',
    features: [
      'Up to 100 clients',
      'Bookkeeping & bank reconciliation',
      'Asset register',
      'Accounting & financial statement presentation',
      'AI invoicing entries',
      'Invoice attachments & lettering',
      'Accountant validation & supervisor role',
      'Bank connection for statement integration',
      'Accounting Entry File (FEC) integration',
      'VAT remittance, tax filing & CAC Annual Returns',
    ],
  },
  {
    name: 'Premium',
    audience: 'Large Accounting Firms',
    price: { yearly: '₦1,200,000', monthly: '₦150,000' },
    period: { yearly: '/yr/10 users', monthly: '/mo/10 users' },
    cta: 'Talk to sales',
    features: [
      'Up to 100 clients',
      'Bookkeeping & bank reconciliation',
      'Asset register',
      'Accounting & financial statement presentation',
      'AI invoicing entries',
      'Invoice attachments & lettering',
      'Accountant validation & supervisor role',
      'Bank connection for statement integration',
      'Accounting Entry File (FEC) integration',
      'VAT remittance, tax filing & CAC Annual Returns',
      'Integration with banks, payment gateways & ERP systems',
      'Client access for electronic invoicing & document uploads',
    ],
  },
]

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>('yearly')
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})
  const [lockedHeight, setLockedHeight] = useState<number | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

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
  }, [billing])

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
              {PLANS.map((plan, i) => (
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
              ))}
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
      <DemoModal />
    </div>
  )
}
