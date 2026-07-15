import Image from 'next/image'
import { NewsletterForm } from './newsletter-form'

const COLUMNS = [
  { title: 'Product', links: ['General Ledger', 'AI Invoicing', 'Financial Reports', 'VAT & Tax', 'Asset Register', 'Bank Reconciliation'] },
  { title: 'Solutions', links: ['Freelance Accountants', 'Small Firms', 'Mid-Size Firms', 'Enterprise Firms', 'Tax Consultants', 'Audit Firms'] },
]

const SOCIALS = ['fa-x-twitter', 'fa-linkedin', 'fa-instagram', 'fa-youtube', 'fa-whatsapp']

export function Footer() {
  return (
    <footer className="footer-section" style={{ padding: '72px 0 48px' }}>
      <div className="max-w-page">
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 64, marginBottom: 64 }}>
          {/* Left Column — About */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <Image src="/bilanix-logo-white.png" alt="Bilanix" width={120} height={32} style={{ height: 26, width: 'auto' }} />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.65, marginBottom: 24, maxWidth: 360 }}>
              The AI-powered multi-client accounting platform for accounting firms, consultants, and finance teams in Nigeria.
            </p>
            <div style={{ marginBottom: 28 }}>
              <NewsletterForm />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {SOCIALS?.map?.((s) => (
                <a key={s} href="#" aria-label="Social link" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 0.2s' }}>
                  <i className={`fa-brands ${s}`} style={{ fontSize: '1rem' }} />
                </a>
              ))}
            </div>
          </div>

          {/* Right Column — Product & Solutions */}
          <div className="grid grid-cols-2" style={{ gap: 40 }}>
            {COLUMNS?.map?.((col) => (
              <div key={col.title}>
                <div className="footer-col-title">{col.title}</div>
                {col.links?.map?.((l) => (
                  <a key={l} href="#" className="footer-link">{l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="footer-divider flex flex-col sm:flex-row items-center justify-between" style={{ paddingTop: 32, gap: 16 }}>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.25)' }}>
            © 2026 Bilanix Technologies Ltd. Registered in Nigeria. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
