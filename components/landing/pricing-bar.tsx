'use client'

import { ArrowRight } from 'lucide-react'
import { Reveal } from './reveal'
import { openRegistration } from './registration-modal'

export function PricingBar() {
  return (
    <section id="pricing" style={{ background: '#0F0F0F', padding: '72px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-page">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between" style={{ gap: 32 }}>
          <Reveal>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60B746', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Simple pricing</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', marginBottom: 8 }}>No hidden fees. No surprises.</h2>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.45)' }}>Start free, upgrade when you need to. Cancel anytime.</p>
          </Reveal>
          <Reveal delay={2} className="flex items-center flex-wrap" style={{ gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em' }}>Free</div>
              <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>Forever, no credit card</div>
            </div>
            <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.08)' }} className="hidden sm:block" />
            <div style={{ textAlign: 'center' }}>
              <div className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em' }}>₦9,900<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }}>/mo</span></div>
              <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>Pro plan, all features</div>
            </div>
            <button className="btn-primary" style={{ marginLeft: 8 }} onClick={openRegistration}>View pricing <ArrowRight size={15} /></button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
