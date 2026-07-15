'use client'

import { MockupPanel } from './feature-section'

export function JournalEntryMockup() {
  return (
    <MockupPanel>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="font-heading" style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff' }}>Journal Entry #JE-00418</span>
        <span style={{ background: 'rgba(96,183,70,0.15)', color: '#60B746', borderRadius: 100, padding: '4px 12px', fontSize: '0.6875rem', fontWeight: 700 }}>Posted</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Account</span>
          <div style={{ display: 'flex', gap: 40 }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Debit</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Credit</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#60B746' }}>DR</span>
            <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.75)' }}>Accounts Receivable</span>
          </div>
          <div style={{ display: 'flex', gap: 40, fontSize: '0.8125rem' }}>
            <span style={{ fontWeight: 600, color: '#60B746' }}>₦240,000</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>CR</span>
            <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.75)' }}>Sales Revenue</span>
          </div>
          <div style={{ display: 'flex', gap: 40, fontSize: '0.8125rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
            <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>₦240,000</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>Totals</span>
          <div style={{ display: 'flex', gap: 40, fontSize: '0.8125rem', fontWeight: 700 }}>
            <span style={{ color: '#60B746' }}>₦240,000</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>₦240,000</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(96,183,70,0.08)', border: '1px solid rgba(96,183,70,0.12)', borderRadius: 10, padding: '10px 14px', marginTop: 14 }}>
        <div style={{ width: 6, height: 6, background: '#60B746', borderRadius: '50%' }} />
        <span style={{ fontSize: '0.75rem', color: 'rgba(96,183,70,0.9)' }}>Debit = Credit · Audit trail recorded</span>
      </div>
    </MockupPanel>
  )
}

export function InvoiceAIMockup() {
  return (
    <MockupPanel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Uploaded Invoice</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Supplier</span>
              <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>Dangote Supplies Ltd</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Amount</span>
              <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>₦180,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>VAT (7.5%)</span>
              <span style={{ fontWeight: 600, color: '#60B746' }}>₦13,500</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>AI suggested journal entry</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Draft Journal</span>
            <span style={{ fontSize: '0.6875rem', color: '#60B746' }}>95% confidence</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>Purchases DR</span>
              <span style={{ fontWeight: 500, color: '#60B746' }}>₦180,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>VAT Input DR</span>
              <span style={{ fontWeight: 500, color: '#60B746' }}>₦13,500</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>AP Control CR</span>
              <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>₦193,500</span>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: '#60B746', borderRadius: 10, padding: '10px 0',
          fontSize: '0.8125rem', fontWeight: 600, color: '#fff', cursor: 'pointer',
        }}>
          Approve &amp; Post
        </div>
      </div>
    </MockupPanel>
  )
}

export function VATEngineMockup() {
  return (
    <MockupPanel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="font-heading" style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff' }}>VAT Engine</span>
          <span style={{ background: 'rgba(96,183,70,0.15)', color: '#60B746', borderRadius: 100, padding: '4px 12px', fontSize: '0.6875rem', fontWeight: 700 }}>Nigeria FIRS</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Q1 2024</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Rate: 7.5%</p>
          </div>
          <span style={{ background: 'rgba(96,183,70,0.15)', color: '#60B746', borderRadius: 100, padding: '4px 12px', fontSize: '0.6875rem', fontWeight: 700 }}>Filed</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Q2 2024</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Rate: 7.5%</p>
          </div>
          <span style={{ background: 'rgba(96,183,70,0.15)', color: '#60B746', borderRadius: 100, padding: '4px 12px', fontSize: '0.6875rem', fontWeight: 700 }}>Filed</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Q3 2024</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Rate: 7.5%</p>
          </div>
          <span style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', borderRadius: 100, padding: '4px 12px', fontSize: '0.6875rem', fontWeight: 700 }}>Due</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Period Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>Output VAT</span>
              <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>₦84,750</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>Input VAT</span>
              <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>₦36,500</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 4 }}>
              <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Net VAT Due</span>
              <span style={{ fontWeight: 700, color: '#60B746' }}>₦48,250</span>
            </div>
          </div>
        </div>
      </div>
    </MockupPanel>
  )
}

export function ClientPortfolioMockup() {
  const clients = [
    { initial: 'K', name: 'Kolade Bakeries Ltd', code: 'KBL-001', journals: 48 },
    { initial: 'Z', name: 'Zenith Trading Co.', code: 'ZTC-002', journals: 31 },
    { initial: 'A', name: 'Apex Properties', code: 'APX-003', journals: 19 },
    { initial: 'T', name: 'TechBridge Nigeria', code: 'TBN-004', journals: 27 },
  ]

  return (
    <MockupPanel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="font-heading" style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff' }}>Client Portfolio</span>
          <span style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', borderRadius: 100, padding: '4px 12px', fontSize: '0.6875rem' }}>48 active clients</span>
        </div>
        {clients.map((c) => (
          <div key={c.code} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, background: 'rgba(96,183,70,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#60B746' }}>{c.initial}</div>
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{c.name}</p>
                <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)' }}>{c.code} · {c.journals} journals</p>
              </div>
            </div>
            <span style={{ background: 'rgba(96,183,70,0.12)', color: '#60B746', borderRadius: 100, padding: '4px 10px', fontSize: '0.6875rem', fontWeight: 600 }}>Active</span>
          </div>
        ))}
      </div>
    </MockupPanel>
  )
}

export function RevenueChartMockup() {
  const bars = [
    { m: 'Jul', h: 68 },
    { m: 'Aug', h: 45 },
    { m: 'Sep', h: 82 },
    { m: 'Oct', h: 60 },
    { m: 'Nov', h: 91 },
    { m: 'Dec', h: 55 },
    { m: 'Jan', h: 76 },
  ]

  return (
    <MockupPanel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="font-heading" style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff' }}>Revenue Overview</span>
          <span style={{ background: 'rgba(96,183,70,0.15)', color: '#60B746', borderRadius: 100, padding: '4px 12px', fontSize: '0.6875rem', fontWeight: 700 }}>+24% YoY</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
            <span>₦0</span><span>₦500k</span><span>₦1M</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, height: 80 }}>
            {bars.map((b) => (
              <div key={b.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: 'rgba(96,183,70,0.7)', height: `${b.h}%` }} />
                <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)' }}>{b.m}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#60B746' }}>₦4.2M</p>
            <p style={{ fontSize: '0.5625rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Revenue</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#60B746' }}>₦1.8M</p>
            <p style={{ fontSize: '0.5625rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Expenses</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#60B746' }}>₦2.4M</p>
            <p style={{ fontSize: '0.5625rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Net Profit</p>
          </div>
        </div>
      </div>
    </MockupPanel>
  )
}

export function AccessControlMockup() {
  const roles = [
    { initial: 'A', color: '#EF4444', name: 'Admin', tags: ['Full access', 'User mgmt'] },
    { initial: 'A', color: '#60B746', name: 'Accountant', tags: ['Journals', 'Reports'] },
    { initial: 'V', color: '#3B82F6', name: 'Viewer', tags: ['Read-only'] },
    { initial: 'A', color: '#8B5CF6', name: 'Auditor', tags: ['Audit logs'] },
  ]

  return (
    <MockupPanel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60B746" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="font-heading" style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff' }}>Access Control</span>
        </div>
        {roles.map((r) => (
          <div key={r.name} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700, color: r.color }}>{r.initial}</div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{r.name}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {r.tags.map((tag) => (
                <span key={tag} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '3px 8px', fontSize: '0.5625rem', color: 'rgba(255,255,255,0.45)' }}>{tag}</span>
              ))}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(96,183,70,0.08)', border: '1px solid rgba(96,183,70,0.12)', borderRadius: 10, padding: '10px 14px', marginTop: 4 }}>
          <div style={{ width: 6, height: 6, background: '#60B746', borderRadius: '50%' }} />
          <span style={{ fontSize: '0.75rem', color: 'rgba(96,183,70,0.9)' }}>SOC2-aligned · End-to-end encrypted</span>
        </div>
      </div>
    </MockupPanel>
  )
}

export function MobileDashboardMockup() {
  return (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
      <div style={{ width: 208, overflow: 'hidden', borderRadius: 28, background: '#0d1f0b', border: '6px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 4px' }}>
          <span style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>9:41</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 4, borderRadius: 2, background: 'rgba(255,255,255,0.4)', height: 12 }} />
            <div style={{ width: 4, borderRadius: 2, background: 'rgba(255,255,255,0.4)', height: 10 }} />
            <div style={{ width: 4, borderRadius: 2, background: 'rgba(255,255,255,0.4)', height: 8 }} />
          </div>
        </div>
        <div style={{ padding: '8px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Dashboard</span>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(96,183,70,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#60B746" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
              </svg>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12 }}>
              <p style={{ fontSize: '0.5625rem', color: 'rgba(255,255,255,0.35)' }}>Revenue</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#60B746', marginTop: 2 }}>₦4.2M</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12 }}>
              <p style={{ fontSize: '0.5625rem', color: 'rgba(255,255,255,0.35)' }}>Invoices</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#60B746', marginTop: 2 }}>248</p>
            </div>
          </div>
          <p style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Recent entries</p>
          {[
            { i: 'K', n: 'Kolade Bakeries' },
            { i: 'Z', n: 'Zenith Trading' },
            { i: 'A', n: 'Apex Properties' },
          ].map((c) => (
            <div key={c.i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(96,183,70,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.4375rem', fontWeight: 700, color: '#60B746' }}>{c.i}</div>
                <span style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.6)' }}>{c.n}</span>
              </div>
              <span style={{ fontSize: '0.5625rem', color: '#60B746' }}>Active</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60B746" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 21v-6" /><path d="M12 21V3" /><path d="M19 21V9" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
            <path d="M14 2v5a1 1 0 0 0 1 1h5" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
