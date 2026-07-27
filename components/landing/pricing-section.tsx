'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PricingCard } from './pricing-card'


type Billing = 'monthly' | 'yearly'

type Plan = {
  name: string
  planType: string
  audience: string
  price: Record<Billing, string>
  period: Record<Billing, string>
  cta: string
  features: string[]
  featured?: boolean
  badge?: string
  includedUsers: number
  activationFee: number
}

const formatNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

function getGridCols(count: number): string {
  if (count >= 4) return 'repeat(4, 1fr)'
  if (count === 3) return 'repeat(3, 1fr)'
  if (count === 2) return 'repeat(2, 1fr)'
  return '1fr'
}

function getGridMaxWidth(count: number): number {
  if (count >= 4) return 1200
  if (count === 3) return 880
  if (count === 2) return 580
  return 280
}

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>('yearly')
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})
  const accountingRef = useRef<HTMLDivElement>(null)
  const invoicingRef = useRef<HTMLDivElement>(null)
  const [cardHeight, setCardHeight] = useState<number | null>(null)

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
          planType: p.planType || 'accounting',
          audience: p.audience,
          price: {
            monthly: formatNaira(p.monthlyAmount),
            yearly: formatNaira(p.yearlyAmount),
          },
          period: {
            monthly: '/mo/user',
            yearly: '/yr/user',
          },
          cta: p.ctaText || 'Get started',
          features: p.features || [],
          featured: !!p.badge,
          badge: p.badge,
          includedUsers: p.includedUsers || 1,
          activationFee: p.activationFee || 0,
        }))
        setPlans(transformed)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const measureCards = useCallback(() => {
    const refs = [accountingRef, invoicingRef]
    let max = 0
    refs.forEach((ref) => {
      if (!ref.current) return
      const cards = ref.current.querySelectorAll<HTMLElement>('[data-card]')
      cards.forEach((card) => {
        if (card.offsetHeight > max) max = card.offsetHeight
      })
    })
    if (max > 0) setCardHeight(max)
  }, [])

  useEffect(() => {
    if (!loading && plans.length > 0) {
      const frame = requestAnimationFrame(measureCards)
      return () => cancelAnimationFrame(frame)
    }
  }, [billing, loading, plans, measureCards])

  const toggleExpand = (name: string) => {
    setExpandedCards((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const accountingPlans = plans.filter(p => p.planType === 'accounting')
  const invoicingPlans = plans.filter(p => p.planType === 'invoicing')

  return (
    <section id="pricing" className="bg-white py-24 sm:py-32">
      <div className="max-w-page mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="font-jakarta text-xs font-semibold uppercase tracking-[0.18em] text-[#60B746]">
            Pricing Built for Practices
          </p>
          <h2 className="font-jakarta mx-auto mt-4 max-w-3xl text-[1.75rem] sm:text-[2.5rem] font-semibold leading-[1.15] tracking-[-0.03em] text-[#0F0F0F]">
            Pricing that scales{' '}
            <span className="font-bold">with your client portfolio</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex justify-center"
        >
          <div className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] p-1">
            {(['monthly', 'yearly'] as Billing[]).map((option) => {
              const active = billing === option
              return (
                <button
                  key={option}
                  onClick={() => setBilling(option)}
                  className="relative rounded-full px-5 py-2 text-sm font-medium transition-colors"
                >
                  {active && (
                    <motion.span
                      layoutId="billing-pill"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-full border border-[#60B746] bg-white shadow-sm"
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-2 font-inter capitalize ${active ? 'text-[#0F0F0F]' : 'text-[#6B7280]'}`}>
                    {option}
                    {option === 'yearly' && (
                      <span className="rounded-full bg-[#E7F5E1] px-2 py-0.5 text-[11px] font-semibold text-[#3F8F2E]">
                        Save more
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>

        <div className="mt-14">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col rounded-[20px] border border-[#E5E7EB] bg-white p-8">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="mt-3 h-3 w-40 animate-pulse rounded bg-gray-200" />
                  <div className="mt-6 h-8 w-28 animate-pulse rounded bg-gray-200" />
                  <div className="mt-1 h-3 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="mt-6 h-12 w-full animate-pulse rounded-full bg-gray-200" />
                  <div className="mt-8 flex flex-col gap-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-3 w-full animate-pulse rounded bg-gray-200" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="col-span-full py-16 text-center">
              <p className="font-inter text-sm text-[#6B7280]">Plans unavailable. Please try again later.</p>
            </div>
          ) : (
            <>
              {accountingPlans.length > 0 && (
                <div className="mb-12">
                  <h3 className="font-jakarta text-center text-lg font-semibold text-[#0F0F0F] mb-6">Accounting Solution</h3>
                  <div ref={accountingRef} style={{ display: 'grid', gridTemplateColumns: getGridCols(accountingPlans.length), gap: 20, maxWidth: getGridMaxWidth(accountingPlans.length), margin: '0 auto', alignItems: 'start' }}>
                    {accountingPlans.map((plan, i) => (
                      <PricingCard
                        key={plan.name}
                        {...plan}
                        index={i}
                        billing={billing}
                        expanded={expandedCards[plan.name] ?? false}
                        onToggleExpand={() => toggleExpand(plan.name)}
                        cardHeight={cardHeight}
                        includedUsers={plan.includedUsers}
                        activationFee={plan.activationFee}
                      />
                    ))}
                  </div>
                </div>
              )}

              {invoicingPlans.length > 0 && (
                <div>
                  <h3 className="font-jakarta text-center text-lg font-semibold text-[#0F0F0F] mb-6">Invoicing Plan</h3>
                  <div ref={invoicingRef} style={{ display: 'grid', gridTemplateColumns: getGridCols(invoicingPlans.length), gap: 20, maxWidth: getGridMaxWidth(invoicingPlans.length), margin: '0 auto', alignItems: 'start' }}>
                    {invoicingPlans.map((plan, i) => (
                      <PricingCard
                        key={plan.name}
                        {...plan}
                        index={i}
                        billing={billing}
                        expanded={expandedCards[plan.name] ?? false}
                        onToggleExpand={() => toggleExpand(plan.name)}
                        cardHeight={cardHeight}
                        includedUsers={plan.includedUsers}
                        activationFee={plan.activationFee}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
