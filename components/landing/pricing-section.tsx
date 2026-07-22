'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { openRegistration } from './registration-modal'

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
}

const formatNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>('yearly')
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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
          cta: p.ctaText,
          features: p.features,
          featured: !!p.badge,
          badge: p.badge,
        }))
        setPlans(transformed)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <section id="pricing" className="bg-white py-24 sm:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
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
                  <span
                    className={`relative z-10 flex items-center gap-2 font-inter capitalize ${
                      active ? 'text-[#0F0F0F]' : 'text-[#6B7280]'
                    }`}
                  >
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
                <div
                  key={i}
                  className="flex flex-col rounded-[20px] border border-[#E5E7EB] bg-white p-8"
                >
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
              {/* Accounting Solutions Row */}
              {plans.some(p => p.planType === 'accounting') && (
                <div className="mb-12">
                  <h3 className="font-jakarta text-center text-lg font-semibold text-[#0F0F0F] mb-6">Accounting Solution</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {plans.filter(p => p.planType === 'accounting').map((plan, i) => (
                      <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -4 }}
                        className={`flex flex-col rounded-[20px] p-8 transition-shadow duration-300 ${
                          plan.featured
                            ? 'bg-[#0D0D0D] shadow-[0_20px_50px_rgba(0,0,0,0.25)] hover:shadow-[0_28px_60px_rgba(0,0,0,0.35)]'
                            : 'border border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_18px_44px_rgba(0,0,0,0.1)]'
                        }`}
                      >
                        {plan.badge && (
                          <span className="font-inter mb-5 inline-flex w-fit items-center rounded-full bg-[#60B746] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                            {plan.badge}
                          </span>
                        )}

                        <h3 className={`font-jakarta text-lg font-bold ${plan.featured ? 'text-white' : 'text-[#0F0F0F]'}`}>
                          {plan.name}
                        </h3>
                        <p className={`font-inter mt-1 text-sm ${plan.featured ? 'text-white/50' : 'text-[#6B7280]'}`}>
                          {plan.audience}
                        </p>

                        <div className="mt-6">
                          <div className={`font-jakarta text-3xl font-bold tracking-[-0.02em] ${plan.featured ? 'text-white' : 'text-[#0F0F0F]'}`}>
                            {plan.price[billing]}
                          </div>
                          <div className={`font-inter mt-1 text-sm ${plan.featured ? 'text-white/50' : 'text-[#6B7280]'}`}>
                            {plan.period[billing]}
                          </div>
                        </div>

                        <motion.button
                          onClick={openRegistration}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.25 }}
                          className={`font-inter mt-6 flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors ${
                            plan.featured
                              ? 'bg-[#60B746] text-white hover:bg-[#55a53e]'
                              : 'border border-[#E5E7EB] bg-white text-[#0F0F0F] hover:border-[#0F0F0F]'
                          }`}
                        >
                          {plan.cta}
                        </motion.button>

                        <ul className="mt-8 flex flex-col gap-4">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3">
                              <Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[#60B746]" />
                              <span className={`font-inter text-sm leading-snug ${plan.featured ? 'text-white/80' : 'text-[#374151]'}`}>
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoicing Plans Row */}
              {plans.some(p => p.planType === 'invoicing') && (
                <div>
                  <h3 className="font-jakarta text-center text-lg font-semibold text-[#0F0F0F] mb-6">Invoicing Plan</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {plans.filter(p => p.planType === 'invoicing').map((plan, i) => (
                      <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -4 }}
                        className={`flex flex-col rounded-[20px] p-8 transition-shadow duration-300 ${
                          plan.featured
                            ? 'bg-[#0D0D0D] shadow-[0_20px_50px_rgba(0,0,0,0.25)] hover:shadow-[0_28px_60px_rgba(0,0,0,0.35)]'
                            : 'border border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_18px_44px_rgba(0,0,0,0.1)]'
                        }`}
                      >
                        {plan.badge && (
                          <span className="font-inter mb-5 inline-flex w-fit items-center rounded-full bg-[#60B746] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                            {plan.badge}
                          </span>
                        )}

                        <h3 className={`font-jakarta text-lg font-bold ${plan.featured ? 'text-white' : 'text-[#0F0F0F]'}`}>
                          {plan.name}
                        </h3>
                        <p className={`font-inter mt-1 text-sm ${plan.featured ? 'text-white/50' : 'text-[#6B7280]'}`}>
                          {plan.audience}
                        </p>

                        <div className="mt-6">
                          <div className={`font-jakarta text-3xl font-bold tracking-[-0.02em] ${plan.featured ? 'text-white' : 'text-[#0F0F0F]'}`}>
                            {plan.price[billing]}
                          </div>
                          <div className={`font-inter mt-1 text-sm ${plan.featured ? 'text-white/50' : 'text-[#6B7280]'}`}>
                            {plan.period[billing]}
                          </div>
                        </div>

                        <motion.button
                          onClick={openRegistration}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.25 }}
                          className={`font-inter mt-6 flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors ${
                            plan.featured
                              ? 'bg-[#60B746] text-white hover:bg-[#55a53e]'
                              : 'border border-[#E5E7EB] bg-white text-[#0F0F0F] hover:border-[#0F0F0F]'
                          }`}
                        >
                          {plan.cta}
                        </motion.button>

                        <ul className="mt-8 flex flex-col gap-4">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3">
                              <Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[#60B746]" />
                              <span className={`font-inter text-sm leading-snug ${plan.featured ? 'text-white/80' : 'text-[#374151]'}`}>
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
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
