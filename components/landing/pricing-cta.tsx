'use client'

import { ArrowRight } from 'lucide-react'
import { Reveal } from './reveal'
import { openRegistration } from './registration-modal'

export function PricingCTA() {
  return (
    <section id="contact-pricing" className="cta-section section-pad">
      <div className="max-w-page mx-auto text-center">
        <Reveal>
          <p className="section-label">Get started today</p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="cta-big" style={{ margin: '20px auto 0' }}>
            Ready to transform<br />
            <span style={{ color: '#60B746' }}>your accounting practice?</span>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p
            className="section-desc"
            style={{
              color: 'rgba(255,255,255,0.5)',
              maxWidth: 520,
              margin: '20px auto 0',
            }}
          >
            Join accounting firms across Nigeria using Bilanix to manage multi-client portfolios with AI-powered automation.
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
            <button className="btn-primary" onClick={() => openRegistration()}>
              Start Now <ArrowRight size={15} />
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
