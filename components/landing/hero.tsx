'use client'

import Image from 'next/image'
import { ArrowRight, Calendar } from 'lucide-react'
import { Reveal } from './reveal'
import { openDemo } from './demo-modal'

export function Hero() {
  return (
    <header className="hero-bg relative" style={{ paddingTop: 100, paddingBottom: 0 }}>
      <div className="max-w-page relative" style={{ zIndex: 10 }}>
        <div className="text-center" style={{ maxWidth: 720, margin: '0 auto' }}>
          <Reveal delay={1}>
            <h1 className="hero-title">
              Manage every client. <span className="green">Automate every entry.</span> Scale with confidence.
            </h1>
          </Reveal>

          <Reveal delay={2}>
            <p className="hero-sub" style={{ margin: '28px auto 40px', maxWidth: 560 }}>
              The AI-powered multi-client accounting platform built for accounting firms, consultants, and finance teams managing multiple businesses.
            </p>
          </Reveal>

          <Reveal delay={3} className="flex items-center justify-center gap-4 flex-wrap">
            <button className="btn-primary" style={{ padding: '0 22px' }} onClick={openDemo}>
              Start for free
              <ArrowRight size={15} />
            </button>
            <button className="btn-ghost" style={{ padding: '0 22px' }} onClick={openDemo}>
              <Calendar size={15} />
              Book a demo
            </button>
          </Reveal>

          <Reveal delay={4} className="trust-badge justify-center" style={{ marginTop: 24 }}>
            <span className="stars">★★★★★</span>
            <span>
              Trusted by <strong style={{ color: 'rgba(255,255,255,0.75)' }}>accounting firms</strong> across Nigeria
            </span>
          </Reveal>
        </div>

        <Reveal delay={5} className="hero-dashboard-wrap">
          <div className="float-stat" style={{ left: -24, top: 60, zIndex: 10 }}>
            <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Clients managed</div>
            <div className="font-heading" style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>48</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <span style={{ fontSize: '0.75rem', color: '#60B746', fontWeight: 600 }}>↑ 12 new</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>this quarter</span>
            </div>
          </div>

          <div className="float-stat d2 hidden sm:block" style={{ right: 40, top: 40, zIndex: 10 }}>
            <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Journals posted</div>
            <div className="font-heading" style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>1,240</div>
            <div style={{ marginTop: 6 }}>
              <span className="tag-pill" style={{ fontSize: '0.6875rem' }}><span className="dot" style={{ width: 6, height: 6, background: '#60B746', borderRadius: '50%', display: 'inline-block' }} /> All balanced</span>
            </div>
          </div>

          <div className="float-stat d3 hidden sm:block" style={{ right: -12, bottom: 80, zIndex: 10 }}>
            <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Cash flow forecast</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 36 }}>
              {[50, 65, 80, 70, 90, 100].map((h, i) => (
                <div key={i} style={{ width: 8, borderRadius: '2px 2px 0 0', background: i >= 4 ? '#60B746' : `rgba(96,183,70,${0.4 + i * 0.1})`, height: `${h}%` }} />
              ))}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>Next 6 months</div>
          </div>

          <div className="dashboard-frame" style={{ position: 'relative' }}>
            <Image
              src="/hero-dashboard.png"
              alt="Bilanix financial dashboard showing revenue, invoices and cash flow"
              width={1600}
              height={1000}
              priority
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 20 }}
            />
            <div style={{ position: 'absolute', top: 14, left: 18, zIndex: 5 }}>
              <Image
                src="/bilanix-logo.png"
                alt="Bilanix"
                width={100}
                height={28}
                style={{ height: 18, width: 'auto', opacity: 0.95 }}
              />
            </div>
          </div>

          <div className="hero-dashboard-glow" />
        </Reveal>
      </div>
    </header>
  )
}
