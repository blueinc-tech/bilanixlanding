'use client'

import { Reveal } from './reveal'
import { openRegistration } from './registration-modal'
import { ArrowRight } from 'lucide-react'

export function ContactCta() {
  return (
    <section className="cta-section" style={{ padding: '120px 0' }}>
      <div className="max-w-page" style={{ textAlign: 'center' }}>
        <Reveal>
          <p className="section-label" style={{ textAlign: 'center' }}>Get started today</p>
        </Reveal>
        <Reveal>
          <h2 className="cta-big font-heading" style={{ maxWidth: 680, margin: '20px auto 0' }}>
            Ready to transform <span style={{ color: '#60B746' }}>your accounting practice?</span>
          </h2>
        </Reveal>
        <Reveal>
          <p style={{
            maxWidth: 480,
            margin: '20px auto 0',
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.5)',
          }}>
            Join accounting firms across Nigeria using Bilanix to manage multi-client portfolios with AI-powered automation.
          </p>
        </Reveal>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
            <button className="btn-primary" onClick={openRegistration} style={{ fontSize: '0.9375rem', padding: '0 24px', minHeight: 48 }}>
              Start Now
              <ArrowRight size={15} />
            </button>
            <a href="/pricing" className="btn-ghost" style={{ fontSize: '0.9375rem', padding: '0 24px', minHeight: 48 }}>
              View Pricing
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
