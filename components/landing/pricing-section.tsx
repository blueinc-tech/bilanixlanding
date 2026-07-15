'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { openDemo } from './demo-modal'

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

const plans: Plan[] = [
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
    badge: 'MOST POPULAR',
    features: [
      'Up to 50 clients',
      'Bookkeeping & bank reconciliation',
      'Asset register & financial statements',
      'AI invoicing entries & lettering',
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
      'Everything in Professional',
      'Bank connection & statement integration',
      'Accounting Entry File (FEC) integration',
      'VAT remittance & tax filing',
      'Annual Returns Filing with CAC',
    ],
  },
  {
    name: 'Premium',
    audience: 'Large Accounting Firms',
    price: { yearly: '₦1,200,000', monthly: '₦150,000' },
    period: { yearly: '/yr/10 users', monthly: '/mo/10 users' },
    cta: 'Talk to sales',
    features: [
      'Everything in Enterprise',
      'Bank & payment gateway integrations',
      'ERP & third-party app connections',
      'Client access portal',
      'Electronic invoicing for clients',
      'Direct document uploads by clients',
    ],
  },
]

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>('yearly')

  return (
    <section id="pricing" className="bg-white py-24 sm:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        {/* Heading */}
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

        {/* Billing toggle */}
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

        {/* Cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => {
            const featured = plan.featured
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className={`flex flex-col rounded-[20px] p-8 transition-shadow duration-300 ${
                  featured
                    ? 'bg-[#0D0D0D] shadow-[0_20px_50px_rgba(0,0,0,0.25)] hover:shadow-[0_28px_60px_rgba(0,0,0,0.35)]'
                    : 'border border-[#E5E7EB] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_18px_44px_rgba(0,0,0,0.1)]'
                }`}
              >
                {plan.badge && (
                  <span className="font-inter mb-5 inline-flex w-fit items-center rounded-full bg-[#60B746] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    {plan.badge}
                  </span>
                )}

                <h3
                  className={`font-jakarta text-lg font-bold ${
                    featured ? 'text-white' : 'text-[#0F0F0F]'
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`font-inter mt-1 text-sm ${
                    featured ? 'text-white/50' : 'text-[#6B7280]'
                  }`}
                >
                  {plan.audience}
                </p>

                <div className="mt-6">
                  <div
                    className={`font-jakarta text-3xl font-bold tracking-[-0.02em] ${
                      featured ? 'text-white' : 'text-[#0F0F0F]'
                    }`}
                  >
                    {plan.price[billing]}
                  </div>
                  <div
                    className={`font-inter mt-1 text-sm ${
                      featured ? 'text-white/50' : 'text-[#6B7280]'
                    }`}
                  >
                    {plan.period[billing]}
                  </div>
                </div>

                <motion.button
                  onClick={openDemo}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className={`font-inter mt-6 flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors ${
                    featured
                      ? 'bg-[#60B746] text-white hover:bg-[#55a53e]'
                      : 'border border-[#E5E7EB] bg-white text-[#0F0F0F] hover:border-[#0F0F0F]'
                  }`}
                >
                  {plan.cta}
                </motion.button>

                <ul className="mt-8 flex flex-col gap-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        size={18}
                        strokeWidth={2.5}
                        className="mt-0.5 shrink-0 text-[#60B746]"
                      />
                      <span
                        className={`font-inter text-sm leading-snug ${
                          featured ? 'text-white/80' : 'text-[#374151]'
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
