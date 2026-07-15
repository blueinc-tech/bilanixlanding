'use client'

import { ArrowRight } from 'lucide-react'
import { Reveal } from './reveal'
import { openDemo } from './demo-modal'

export function PricingCTA() {
  return (
    <section id="contact-pricing" className="cta-section py-16 sm:py-20 lg:py-24">
      <div className="max-w-page mx-auto text-center">
        <Reveal>
          <p className="section-label">Get started today</p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="cta-big" style={{ maxWidth: 700, margin: '20px auto 0' }}>
            Ready to transform{' '}
            <span style={{ color: '#60B746' }}>your accounting practice?</span>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: 520,
              margin: '20px auto 0',
            }}
          >
            Join the waitlist and be among the first accounting professionals to experience
            Bilanix — AI-powered, compliance-ready, built for Nigeria.
          </p>
        </Reveal>
        <Reveal delay={3}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
              marginTop: 32,
            }}
          >
            <button className="btn-primary" onClick={openDemo}>
              Request Early Access <ArrowRight size={15} />
            </button>
            <a href="#pricing" className="btn-ghost">
              View Pricing
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
