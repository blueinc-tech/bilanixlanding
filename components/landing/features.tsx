import { Reveal } from './reveal'

const FEATURES = [
  { icon: 'fa-book-open', title: 'Double-Entry Accounting', desc: 'Full chart of accounts, journal entry creation, batching, and posting. Every debit equals credit, guaranteed.' },
  { icon: 'fa-users', title: 'Multi-Client Management', desc: 'Manage 20 to 100+ client accounts from one workspace with unique client codes and centralized records.' },
  { icon: 'fa-brain', title: 'AI Invoice Processing', desc: 'Upload invoices and let AI extract supplier details, amounts, and VAT—then auto-suggest ledger accounts.' },
  { icon: 'fa-chart-line', title: 'Financial Reporting', desc: 'Generate trial balances, P&L statements, and balance sheets—monthly, quarterly, or yearly. Export to PDF or CSV.' },
  { icon: 'fa-file-shield', title: 'VAT & Tax Compliance', desc: 'Configurable VAT rates, automated calculations, period tracking, and FIRS-ready reports built into every workflow.' },
  { icon: 'fa-building-columns', title: 'Fixed Asset Register', desc: 'Categorize assets, track depreciation using straight-line or reducing balance methods, and auto-post journals.' },
  { icon: 'fa-landmark', title: 'Bank Reconciliation', desc: 'Connect bank accounts for statement integration, auto-match transactions, and maintain audit-ready records.' },
  { icon: 'fa-file-invoice', title: 'Invoice Attachments & Lettering', desc: 'Attach invoices to journal entries with full lettering support. Link payments to invoices for complete traceability.' },
  { icon: 'fa-user-shield', title: 'Role-Based Access', desc: 'Admin, Accountant, Viewer, and Auditor roles with granular permissions. Full audit log for every action.' },
  { icon: 'fa-shield-halved', title: 'Immutable Audit Trail', desc: 'Every financial transaction is logged with an immutable audit trail. Journal reversals link back to originals.' },
  { icon: 'fa-people-group', title: 'Team Management', desc: 'Create teams, invite users, assign roles, and manage organizational hierarchy across your firm.' },
  { icon: 'fa-gauge-high', title: 'Real-Time Dashboard', desc: 'Net worth tracking, balance overview, journal activity, and client performance monitoring at a glance.' },
]

export function Features() {
  return (
    <section id="platform" className="features-section" style={{ padding: '120px 0' }}>
      <div className="max-w-page">
        <Reveal className="text-center" style={{ marginBottom: 72, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
          <span className="section-label">Platform</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em', color: '#0F0F0F', lineHeight: 1.15 }}>
            One platform.<br /><span style={{ color: '#60B746' }}>Every accounting tool</span> your firm needs.
          </h2>
          <p style={{ fontSize: '1rem', color: '#737373', marginTop: 20, lineHeight: 1.65 }}>
            From double-entry bookkeeping to AI invoice processing to Nigerian tax compliance—Bilanix replaces spreadsheets with one centralized platform.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 20 }}>
          {FEATURES?.map?.((f, i) => (
            <Reveal as="article" key={f.title} delay={(i % 4) as 0 | 1 | 2 | 3} className="feature-card">
              <div className="feature-icon" style={{ background: 'rgba(96,183,70,0.1)', color: '#60B746' }}>
                <i className={`fa-solid ${f.icon}`} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
