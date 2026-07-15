'use client'

import { ArrowRight, Check } from 'lucide-react'
import { Reveal } from './reveal'
import { openDemo } from './demo-modal'

function CheckItem({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <span style={{ width: 20, height: 20, background: 'rgba(96,183,70,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <Check size={11} color="#60B746" />
      </span>
      <span className="font-body" style={{ fontSize: '0.9375rem', color: dark ? 'rgba(255,255,255,0.6)' : '#737373' }}>{children}</span>
    </li>
  )
}

export function SpotlightAI() {
  return (
    <section className="spotlight-dark" style={{ padding: '120px 0' }}>
      <div className="max-w-page">
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 80, alignItems: 'center' }}>
          <Reveal>
            <span className="section-label">AI Invoice Processing</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>Upload invoices. AI does the rest.</h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>Bilanix AI extracts supplier information, identifies invoice dates, detects transaction amounts, calculates VAT automatically, and suggests the right ledger accounts—before you review and approve.</p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
              <CheckItem dark>OCR-powered data extraction from any invoice</CheckItem>
              <CheckItem dark>Auto-suggested general ledger account mappings</CheckItem>
              <CheckItem dark>Human review and approval workflow before posting</CheckItem>
            </ul>
            <button className="btn-primary" onClick={openDemo}>See how it works <ArrowRight size={15} /></button>
          </Reveal>

          <Reveal delay={2}>
            <div style={{ background: '#161616', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', padding: 24 }}>
              <div style={{ background: '#1E1E1E', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, border: '1px solid rgba(96,183,70,0.2)' }}>
                <i className="fa-solid fa-brain" style={{ color: '#60B746', fontSize: '0.875rem' }} />
                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Upload invoice…</span>
                <span style={{ fontSize: '0.8125rem', color: '#60B746', marginLeft: 'auto' }}>AI extracting data from INV-2026-0847</span>
              </div>
              <div style={{ background: 'rgba(96,183,70,0.06)', border: '1px solid rgba(96,183,70,0.12)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                <div style={{ fontSize: '0.75rem', color: '#60B746', fontWeight: 600, marginBottom: 8 }}>AI Extraction Complete</div>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>Supplier: <strong style={{ color: '#fff' }}>Zenith Office Supplies</strong> • Amount: ₦840,000 • VAT: <strong style={{ color: '#60B746' }}>₦63,000</strong> • Suggested account: Office Expenses (5100)</p>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Recent journal entries — Auto-generated</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <TxnRow iconBg="rgba(96,183,70,0.1)" iconColor="#60B746" arrow="fa-arrow-down" title="Dr: Office Expenses (5100)" sub="Client: Ade & Co • Today" amount="₦840,000" amountColor="#60B746" tagClass="mini-tag-green" tag="AI Posted" />
                <TxnRow iconBg="rgba(245,158,11,0.1)" iconColor="#F59E0B" arrow="fa-arrow-up" title="Cr: Accounts Payable (2100)" sub="Client: Ade & Co • Today" amount="₦840,000" amountColor="rgba(255,255,255,0.7)" tagClass="mini-tag-yellow" tag="Balanced" />
                <TxnRow iconBg="rgba(239,68,68,0.1)" iconColor="#EF4444" arrow="fa-arrow-up" title="Dr: VAT Input (1500)" sub="Client: Ade & Co • Today" amount="₦63,000" amountColor="rgba(255,255,255,0.7)" tagClass="mini-tag-red" tag="VAT" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function TxnRow({ iconBg, iconColor, arrow, title, sub, amount, amountColor, tagClass, tag }: any) {
  return (
    <div className="invoice-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: iconBg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={`fa-solid ${arrow}`} style={{ fontSize: '0.75rem', color: iconColor }} />
        </div>
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>{title}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{sub}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: amountColor }}>{amount}</div>
        <span className={tagClass}>{tag}</span>
      </div>
    </div>
  )
}

function ApprovalRow({ initials, avatarBg, title, sub, amount }: any) {
  return (
    <div style={{ background: '#F7F8F8', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }} className="flex-nowrap max-sm:flex-wrap">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, background: avatarBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{initials}</div>
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F0F0F' }}>{title}</div>
          <div style={{ fontSize: '0.75rem', color: '#737373' }}>{sub}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="font-heading" style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F0F0F' }}>{amount}</span>
        <span style={{ background: '#60B746', color: '#fff', borderRadius: 99, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600 }}>Approve</span>
        <span style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', borderRadius: 99, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600 }}>Reject</span>
      </div>
    </div>
  )
}

export function SpotlightExpense() {
  return (
    <section className="spotlight-light" style={{ padding: '120px 0' }}>
      <div className="max-w-page">
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 80, alignItems: 'center' }}>
          <Reveal>
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden', padding: 28, boxShadow: '0 8px 48px rgba(0,0,0,0.06)' }}>
              <div className="font-heading" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F0F0F', marginBottom: 16 }}>Client Reports — Ready to Export</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ApprovalRow initials="TC" avatarBg="#60B746" title="Trial Balance — TechCorp Ltd" sub="Q2 2026 • Generated 1h ago" amount="Balanced" />
                <ApprovalRow initials="AK" avatarBg="#3B82F6" title="Profit & Loss — AK Trading" sub="June 2026 • Generated 3h ago" amount="₦4.2M" />
                <ApprovalRow initials="MG" avatarBg="#F59E0B" title="Balance Sheet — MG Holdings" sub="H1 2026 • Generated today" amount="₦18.9M" />
              </div>
              <div style={{ background: 'rgba(96,183,70,0.06)', border: '1px solid rgba(96,183,70,0.15)', borderRadius: 12, padding: '14px 16px', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: '0.8125rem', color: '#0F0F0F', fontWeight: 500 }}>3 reports • All validated</span>
                <span style={{ fontSize: '0.8125rem', color: '#60B746', fontWeight: 600 }}>Export as PDF / CSV</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={2}>
            <span className="section-label">Financial Reporting</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em', color: '#0F0F0F', lineHeight: 1.15, marginBottom: 20 }}>Statements generated. <span style={{ color: '#60B746' }}>Compliance handled.</span></h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#737373', marginBottom: 32 }}>Generate trial balances, profit & loss statements, and balance sheets for each client—monthly, quarterly, or yearly. Export to PDF and CSV in one click.</p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
              <CheckItem>Trial balance generation with validation checks</CheckItem>
              <CheckItem>Client-specific P&L and balance sheet reports</CheckItem>
              <CheckItem>Export in PDF and CSV for auditors and clients</CheckItem>
            </ul>
            <button className="btn-primary" style={{ background: '#0F0F0F', color: '#fff' }} onClick={openDemo}>See reporting features <ArrowRight size={15} /></button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function PayrollRow({ initials, avatarBg, name, role, gross, net }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: avatarBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{initials}</div>
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>{name}</div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{role}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>{gross}</div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>Net: {net}</div>
      </div>
    </div>
  )
}

export function SpotlightPayroll() {
  return (
    <section className="spotlight-dark" style={{ padding: '120px 0' }}>
      <div className="max-w-page">
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 80, alignItems: 'center' }}>
          <Reveal>
            <span className="section-label">General Ledger</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>Every transaction recorded.<br />Every entry traceable.</h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>The general ledger is the foundation of Bilanix. Create, batch, and post journal entries with full reversal tracking, immutable audit logs, and multi-currency architecture.</p>
            <div className="grid grid-cols-2" style={{ gap: 16, marginBottom: 36 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
                <div className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>100%</div>
                <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Debit = Credit guaranteed</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
                <div className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60B746', letterSpacing: '-0.03em' }}>Immutable</div>
                <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Audit trail on every entry</div>
              </div>
            </div>
            <button className="btn-primary" onClick={openDemo}>Explore the ledger <ArrowRight size={15} /></button>
          </Reveal>

          <Reveal delay={2}>
            <div style={{ background: '#161616', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div className="font-heading" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>Journal Batch — July 2026</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(96,183,70,0.1)', color: '#60B746', padding: '4px 12px', borderRadius: 100 }}>Posted</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                <PayrollRow initials="JE" avatarBg="#60B746" name="JE-2026-0412" role="Revenue Recognition" gross="Dr ₦2,400,000" net="Cr ₦2,400,000" />
                <PayrollRow initials="JE" avatarBg="#8B5CF6" name="JE-2026-0413" role="Depreciation — Assets" gross="Dr ₦180,000" net="Cr ₦180,000" />
                <PayrollRow initials="JE" avatarBg="#F59E0B" name="JE-2026-0414" role="VAT Adjustment" gross="Dr ₦95,000" net="Cr ₦95,000" />
              </div>
              <div style={{ background: 'rgba(96,183,70,0.08)', border: '1px solid rgba(96,183,70,0.15)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>Total debits</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff' }}>₦2,675,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>Total credits</span>
                  <span style={{ fontSize: '0.8125rem', color: '#60B746' }}>₦2,675,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>Status</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#60B746' }}>Balanced ✓</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function SpotlightCashflow() {
  const bars = [
    { m: 'Aug', track: 85, fill: 65 },
    { m: 'Sep', track: 110, fill: 80 },
    { m: 'Oct', track: 95, fill: 70 },
    { m: 'Nov', track: 130, fill: 95 },
    { m: 'Dec', track: 150, fill: 110 },
  ]
  return (
    <section className="spotlight-light" style={{ padding: '120px 0' }}>
      <div className="max-w-page">
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 80, alignItems: 'center' }}>
          <Reveal>
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden', padding: 28, boxShadow: '0 8px 48px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div className="font-heading" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F0F0F' }}>VAT & Asset Summary</div>
                  <div style={{ fontSize: '0.75rem', color: '#737373' }}>Q2 2026 • All clients</div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(96,183,70,0.1)', color: '#60B746', padding: '4px 12px', borderRadius: 100 }}>Compliant</span>
              </div>
              <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 8px', marginBottom: 16 }}>
                {bars?.map?.((b) => (
                  <div key={b.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: 'rgba(96,183,70,0.2)', height: b.track, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#60B746', height: b.fill, borderRadius: '6px 6px 0 0' }} />
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#737373' }}>{b.m}</div>
                  </div>
                ))}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: 'rgba(96,183,70,0.15)', height: 140, border: '1.5px dashed rgba(96,183,70,0.5)', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'rgba(96,183,70,0.3)', height: 100, borderRadius: '5px 5px 0 0' }} />
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#60B746' }}>Jan</div>
                </div>
              </div>
              <div className="grid grid-cols-2" style={{ gap: 10 }}>
                <div style={{ background: '#F7F8F8', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#737373', marginBottom: 4 }}>VAT collected (Q2)</div>
                  <div className="font-heading" style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F0F0F', letterSpacing: '-0.02em' }}>₦18.4M</div>
                </div>
                <div style={{ background: '#F7F8F8', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#737373', marginBottom: 4 }}>Asset depreciation</div>
                  <div className="font-heading" style={{ fontSize: '1.125rem', fontWeight: 800, color: '#60B746', letterSpacing: '-0.02em' }}>Auto-posted</div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={2}>
            <span className="section-label">VAT & Asset Management</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.03em', color: '#0F0F0F', lineHeight: 1.15, marginBottom: 20 }}>Tax compliance<br /><span style={{ color: '#60B746' }}>built into every workflow.</span></h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#737373', marginBottom: 32 }}>Configurable VAT rates, automated calculations, and period management. Plus a full fixed asset register with straight-line and reducing balance depreciation—all auto-posted to the ledger.</p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
              <CheckItem>Automated VAT tracking, calculation, and reporting</CheckItem>
              <CheckItem>Fixed asset depreciation with auto journal postings</CheckItem>
              <CheckItem>FIRS-ready compliance workflows for every client</CheckItem>
            </ul>
            <button className="btn-primary" style={{ background: '#0F0F0F', color: '#fff' }} onClick={openDemo}>Explore compliance tools <ArrowRight size={15} /></button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}