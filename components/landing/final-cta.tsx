'use client'

import { Reveal } from './reveal'
import { openDemo } from './demo-modal'
import { Lock, ShieldCheck, History, Headset } from 'lucide-react'

const PROOF = [
  { icon: Lock, label: 'Immutable audit trails' },
  { icon: ShieldCheck, label: 'FIRS & VAT compliant' },
  { icon: History, label: 'Setup in under 24 hours' },
  { icon: Headset, label: 'Role-based access control' },
]

export function FinalCta() {
  return (
    <section className="cta-section" style={{ padding: '140px 0' }}>
      <div className="max-w-page text-center">
        <Reveal>
          <span className="section-label">Get started</span>
          <h2 className="cta-big" style={{ maxWidth: 700, margin: '0 auto 24px' }}>
            Your clients,<br /><span style={{ color: '#60B746' }}>your ledger, your control.</span>
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto 48px', lineHeight: 1.65 }}>
            Join accounting firms across Nigeria using Bilanix to manage multi-client portfolios with AI-powered automation.
          </p>
          <div className="flex items-center justify-center flex-wrap" style={{ gap: 16 }}>
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '0 20px', minHeight: 48 }} onClick={openDemo}>Start free today</button>
            <button className="btn-ghost" style={{ fontSize: '1rem', padding: '0 20px', minHeight: 48 }} onClick={openDemo}>Talk to sales</button>
          </div>
          <div className="flex items-center justify-center flex-wrap" style={{ gap: 32, marginTop: 48 }}>
            {PROOF?.map?.((p) => {
              const Icon = p.icon
              return (
                <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={15} color="#60B746" />
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>{p.label}</span>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
