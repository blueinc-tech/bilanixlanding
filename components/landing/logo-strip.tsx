import { Reveal } from './reveal'

const COMPANIES = [
  'Accounting Firms', 'Tax Consultants', 'Audit Practices', 'Finance Teams', 'Bookkeeping Services',
  'SME Advisors', 'Freelance Accountants', 'CFO Offices', 'Corporate Finance', 'Business Consultants',
]

export function LogoStrip() {
  const all = [...COMPANIES, ...COMPANIES]
  return (
    <section className="logos-section" style={{ padding: '48px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-page" style={{ marginBottom: 24, textAlign: 'center' }}>
        <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Built for professionals like
        </p>
      </div>
      <div className="logo-ticker-wrap">
        <div className="logo-ticker">
          {all?.map?.((c, i) => (
            <span key={i} className="company-logo">{c}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
