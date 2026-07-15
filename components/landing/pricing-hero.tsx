'use client'

import { motion } from 'framer-motion'
import { Reveal } from './reveal'

interface PricingHeroProps {
  billing: 'monthly' | 'yearly'
  onBillingChange: (billing: 'monthly' | 'yearly') => void
}

export function PricingHero({ billing, onBillingChange }: PricingHeroProps) {
  return (
    <section style={{ background: '#fff', paddingTop: 96, paddingBottom: 0, textAlign: 'center' }}>
      <div className="max-w-page" style={{ padding: '0 20px' }}>
        <Reveal>
          <p className="section-label">Pricing</p>
        </Reveal>
        <Reveal delay={1}>
          <h1 className="font-heading" style={{ margin: '20px auto 0', maxWidth: 640, fontSize: 60, fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#0F0F0F' }}>
            Simple, transparent pricing{' '}
            <span style={{ fontWeight: 600, color: '#60B746' }}>for every practice</span>
          </h1>
        </Reveal>
        <Reveal delay={2}>
          <p style={{ margin: '20px auto 0', maxWidth: 480, fontSize: 15, lineHeight: 1.7, color: '#737373' }}>
            Choose the plan that fits your firm. Scale your client portfolio without scaling your overhead.
          </p>
        </Reveal>
        <Reveal delay={3}>
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 999, background: '#F3F4F6', padding: 4 }}>
              {(['monthly', 'yearly'] as const).map((option) => {
                const active = billing === option
                return (
                  <button
                    key={option}
                    onClick={() => onBillingChange(option)}
                    style={{ position: 'relative', borderRadius: 999, padding: '8px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none' }}
                  >
                    {active && (
                      <motion.span
                        layoutId="pricing-billing-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        style={{ position: 'absolute', inset: 0, borderRadius: 999, border: '1px solid #60B746', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
                      />
                    )}
                    <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'capitalize', color: active ? '#0F0F0F' : '#6B7280' }}>
                      {option}
                      {option === 'yearly' && (
                        <span style={{ borderRadius: 999, background: '#E7F5E1', padding: '2px 8px', fontSize: 11, fontWeight: 600, color: '#3F8F2E' }}>
                          Save more
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
