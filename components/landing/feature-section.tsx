'use client'

import { Reveal } from './reveal'

interface FeatureSectionProps {
  id?: string
  label: string
  title: React.ReactNode
  description: string
  bullets: string[]
  reverse?: boolean
  dark?: boolean
  children: React.ReactNode
  cta?: React.ReactNode
}

export function FeatureSection({ id, label, title, description, bullets, reverse = false, dark = false, children, cta }: FeatureSectionProps) {
  const textColor = dark ? '#fff' : '#0F0F0F'
  const mutedColor = dark ? 'rgba(255,255,255,0.5)' : '#737373'

  return (
    <section id={id} className={dark ? 'spotlight-dark' : 'spotlight-light'} style={{ padding: '120px 0' }}>
      <div className="max-w-page">
        <div
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: 80, alignItems: 'center' }}
        >
          {reverse && (
            <Reveal delay={2}>
              {children}
            </Reveal>
          )}

          <Reveal>
            <span className="section-label">{label}</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em', color: textColor, lineHeight: 1.15, marginBottom: 20 }}>
              {title}
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: mutedColor, marginBottom: 32 }}>
              {description}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: cta ? 36 : 0 }}>
              {bullets.map((bullet, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{
                    width: 20, height: 20,
                    background: dark ? 'rgba(96,183,70,0.15)' : 'rgba(96,183,70,0.1)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#60B746" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="font-body" style={{ fontSize: '0.9375rem', color: dark ? 'rgba(255,255,255,0.6)' : '#737373' }}>
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
            {cta && <div style={{ marginTop: 36 }}>{cta}</div>}
          </Reveal>

          {!reverse && (
            <Reveal delay={2}>
              {children}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}

export function MockupPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{
      background: '#161616',
      borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
      padding: 24,
    }}>
      {children}
    </div>
  )
}

export function MockupPanelLight({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{
      background: '#fff',
      borderRadius: 20,
      border: '1px solid rgba(0,0,0,0.07)',
      overflow: 'hidden',
      padding: 28,
      boxShadow: '0 8px 48px rgba(0,0,0,0.06)',
    }}>
      {children}
    </div>
  )
}
