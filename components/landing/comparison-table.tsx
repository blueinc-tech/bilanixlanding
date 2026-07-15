'use client'

import { Reveal } from './reveal'
import { ComparisonCheck, ComparisonValue } from './pricing-card'

type FeatureValue = string | boolean

interface ComparisonSection {
  label: string
  features: {
    name: string
    values: FeatureValue[]
  }[]
}

const COMPARISON_DATA: ComparisonSection[] = [
  {
    label: 'Core',
    features: [
      { name: 'Client workspaces', values: ['20', '50', '100', '100'] },
      { name: 'Included users', values: ['1 user', '2 users', '5 users', '10 users'] },
      { name: 'Bookkeeping', values: [true, true, true, true] },
      { name: 'Bank reconciliation', values: [true, true, true, true] },
      { name: 'Asset register', values: [true, true, true, true] },
      { name: 'Financial statements', values: [true, true, true, true] },
      { name: 'Invoice attachment', values: [true, true, true, true] },
    ],
  },
  {
    label: 'Advanced',
    features: [
      { name: 'AI invoicing entries', values: [false, true, true, true] },
      { name: 'Invoice lettering', values: [false, true, true, true] },
      { name: 'Accountant validation', values: [false, true, true, true] },
      { name: 'Supervisor role', values: [false, true, true, true] },
    ],
  },
  {
    label: 'Enterprise',
    features: [
      { name: 'Bank statement integration', values: [false, false, true, true] },
      { name: 'FEC integration', values: [false, false, true, true] },
      { name: 'VAT remittance', values: [false, false, true, true] },
      { name: 'Tax filing', values: [false, false, true, true] },
      { name: 'CAC Annual Returns filing', values: [false, false, true, true] },
    ],
  },
  {
    label: 'Premium',
    features: [
      { name: 'Bank/payment/ERP integration', values: [false, false, false, true] },
      { name: 'Client electronic invoicing', values: [false, false, false, true] },
      { name: 'Client document uploads', values: [false, false, false, true] },
    ],
  },
  {
    label: 'Support',
    features: [
      { name: 'Email support', values: [true, true, true, true] },
      { name: 'Priority support', values: [false, true, true, true] },
      { name: 'Dedicated onboarding', values: [false, false, false, true] },
    ],
  },
]

function CellValue({ value }: { value: FeatureValue }) {
  if (typeof value === 'boolean') {
    return <ComparisonCheck included={value} />
  }
  return <ComparisonValue value={value} />
}

export function ComparisonTable() {
  const planNames = ['Basic', 'Professional', 'Enterprise', 'Premium']

  return (
    <section style={{ background: '#F7F8F8', padding: '80px 0' }}>
      <div className="max-w-page" style={{ padding: '0 20px' }}>
        <Reveal>
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <p className="section-label">Compare plans</p>
            <h2 className="font-heading" style={{ margin: '20px auto 0', maxWidth: 560, fontSize: 46, fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.015em', color: '#0F0F0F' }}>
              Everything you get,{' '}
              <span style={{ fontWeight: 600, color: '#60B746' }}>side by side</span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div style={{ overflowX: 'auto', margin: '0 -20px', padding: '0 20px' }}>
            <div style={{ minWidth: 760 }}>
              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 2.4fr) repeat(4, minmax(0, 1fr))', borderTop: '2px solid #E5E7EB', borderBottom: '2px solid #E5E7EB' }}>
                <div style={{ padding: '16px 0' }} />
                {planNames.map((name) => (
                  <div
                    key={name}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '2px solid #E5E7EB', padding: '16px 0', textAlign: 'center' }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: name === 'Professional' ? '#60B746' : '#0F0F0F' }}>
                      {name}
                      {name === 'Professional' && (
                        <span style={{ marginLeft: 6, fontSize: 9, color: '#60B746' }}>&#9733;</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Feature sections */}
              {COMPARISON_DATA.map((section) => (
                <div key={section.label}>
                  {/* Section header */}
                  <div style={{ borderBottom: '1px solid #E5E7EB', background: '#F7F8F8', padding: '12px 0' }}>
                    <p style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(15,15,15,0.5)' }}>
                      {section.label}
                    </p>
                  </div>

                  {/* Feature rows */}
                  {section.features.map((feature) => (
                    <div
                      key={feature.name}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(260px, 2.4fr) repeat(4, minmax(0, 1fr))',
                        borderBottom: '1px solid #E5E7EB',
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', padding: '20px 40px 20px 0' }}>
                        <p style={{ fontSize: 14, lineHeight: 1.4, color: '#525252' }}>
                          {feature.name}
                        </p>
                      </div>
                      {feature.values.map((value, vi) => (
                        <div
                          key={vi}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '2px solid #E5E7EB', padding: 20 }}
                        >
                          <CellValue value={value} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}

              <div style={{ borderBottom: '2px solid #E5E7EB' }} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
