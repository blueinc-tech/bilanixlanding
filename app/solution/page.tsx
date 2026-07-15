'use client'

import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/landing/reveal'
import { FeatureSection } from '@/components/landing/feature-section'
import {
  JournalEntryMockup,
  InvoiceAIMockup,
  VATEngineMockup,
  ClientPortfolioMockup,
  RevenueChartMockup,
  AccessControlMockup,
  MobileDashboardMockup,
} from '@/components/landing/solution-mockups'
import { openDemo } from '@/components/landing/demo-modal'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { DemoModal } from '@/components/landing/demo-modal'

export default function SolutionPage() {
  return (
    <div className="bilanix">
      <Navbar />
      <main>
        {/* Hero — Green gradient, full viewport */}
        <section className="relative w-full min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #0a1c08, #112a0e, #1c3f19)' }}>
          {/* Grid overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          {/* Glow blob */}
          <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full blur-[100px]" style={{ background: 'rgba(96,183,70,0.1)' }} />
          {/* Content */}
          <div className="relative z-10 mx-auto w-full max-w-page px-6 py-32 text-center sm:px-10 sm:py-36 lg:py-40">
            <Reveal>
              <nav className="mb-6 flex items-center justify-center gap-2 text-[12px] text-white/40">
                <a href="/" className="transition-colors hover:text-white/70">Home</a>
                <span>/</span>
                <span className="text-white/70">Solutions</span>
              </nav>
            </Reveal>
            <Reveal delay={1}>
              <h1 className="font-display text-[48px] font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-[64px] lg:text-[72px]">
                Every feature your firm <span className="text-[#60B746]">needs to grow</span>
              </h1>
            </Reveal>
            <Reveal delay={2}>
              <p className="mx-auto mt-5 max-w-lg text-[16px] leading-[1.7] text-white/55">
                Bilanix combines AI-powered automation, true double-entry accounting, and Nigerian tax compliance into one platform — purpose-built for firms managing multiple clients.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button className="btn-primary" onClick={openDemo}>
                  Start Now <ArrowRight size={15} />
                </button>
                <a href="/pricing" className="btn-ghost">
                  View Pricing
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Core Accounting Engine */}
        <FeatureSection
          label="Core accounting engine"
          title={<>True double-entry accounting, <span style={{ color: '#60B746' }}>built for precision</span></>}
          description="Every transaction is validated against a true double-entry core — debit always equals credit. Bilanix eliminates manual errors with automated balancing, journal batching, and immutable audit logs."
          bullets={[
            'Automated debit/credit validation on every journal entry',
            'Customizable chart of accounts for Nigerian standards',
            'Batch journal posting with reversal and audit linking',
            'Bank reconciliation with automated transaction matching',
            'Immutable audit trail for every change and approval',
          ]}
          dark={false}
        >
          <JournalEntryMockup />
        </FeatureSection>

        {/* AI-Powered Automation */}
        <FeatureSection
          label="AI-powered automation"
          title={<>Process invoices <span style={{ color: '#60B746' }}>10x faster with AI</span></>}
          description="Upload an invoice and Bilanix AI extracts supplier details, dates, and amounts, calculates VAT, suggests the correct ledger account, and drafts the journal entry — ready for your one-click review."
          bullets={[
            'Automatic supplier and customer detail extraction',
            'VAT detection and separation at 7.5% Nigerian rate',
            'AI-suggested ledger account with confidence score',
            'One-click approve and post workflow',
            'Handles multiple invoice formats and currencies',
          ]}
          reverse
          dark
        >
          <InvoiceAIMockup />
        </FeatureSection>

        {/* Tax & VAT Compliance */}
        <FeatureSection
          label="Tax & VAT compliance"
          title={<>Nigerian VAT compliance, <span style={{ color: '#60B746' }}>fully automated</span></>}
          description="A configurable VAT engine handles detection, separation, and automated calculation across every client engagement — with period tracking and FIRS-ready reporting built into every workflow."
          bullets={[
            'Automated 7.5% VAT calculation on every transaction',
            'Input and output VAT tracking per client and period',
            'FIRS-compliant period reporting and filing support',
            'Withholding tax and other Nigerian tax calculations',
            'Real-time VAT liability dashboard across all clients',
          ]}
          dark={false}
        >
          <VATEngineMockup />
        </FeatureSection>

        {/* Multi-Client Management */}
        <FeatureSection
          label="Multi-client management"
          title={<>Manage your entire <span style={{ color: '#60B746' }}>client portfolio in one place</span></>}
          description="Onboard clients with unique client codes, segment companies by industry or size, and manage your entire practice from one centralized workspace — purpose-built for firms running many clients simultaneously."
          bullets={[
            'Unlimited clients with unique client codes',
            'Centralized portfolio dashboard with instant switching',
            'Per-client financial isolation and access control',
            'Client segmentation by industry and engagement type',
            'Bulk reporting across the entire client portfolio',
          ]}
          reverse
          dark
        >
          <ClientPortfolioMockup />
        </FeatureSection>

        {/* Reports & Analytics */}
        <FeatureSection
          label="Reports & analytics"
          title={<>Financial intelligence <span style={{ color: '#60B746' }}>at your fingertips</span></>}
          description="Profit & loss, balance sheet, trial balance, and cash flow statements — available instantly for any client, any period. Export in multiple formats for board presentations or statutory filings."
          bullets={[
            'P&L, balance sheet, and trial balance on demand',
            'Cash flow statement with direct and indirect methods',
            'Comparative period reports with variance analysis',
            'Export to PDF, Excel, and regulatory formats',
            'Custom report builder for client-specific needs',
          ]}
          dark={false}
        >
          <RevenueChartMockup />
        </FeatureSection>

        {/* Security & Access Control */}
        <FeatureSection
          label="Security & access control"
          title={<>Role-based access <span style={{ color: '#60B746' }}>that protects every client</span></>}
          description="Admin, Accountant, Viewer, and Auditor roles control exactly who sees what — across every client in your portfolio. Secure authentication, system monitoring, and regular audits protect your entire practice."
          bullets={[
            'Four distinct roles with granular permission control',
            'Per-client access isolation — no cross-contamination',
            'Secure authentication with session management',
            'System activity monitoring and alerting',
            'SOC2-aligned security practices and regular audits',
          ]}
          reverse
          dark
        >
          <AccessControlMockup />
        </FeatureSection>

        {/* Mobile Experience */}
        <FeatureSection
          label="Mobile experience"
          title={<>Your practice, <span style={{ color: '#60B746' }}>anywhere you are</span></>}
          description="Review dashboards, approve journal entries, monitor client portfolios, and receive real-time alerts — all from your mobile device. Bilanix gives your team full visibility without being tied to a desk."
          bullets={[
            'Full dashboard access on any mobile device',
            'Approve and post journal entries from anywhere',
            'Real-time notifications for client activity and alerts',
            'Secure mobile authentication with biometrics',
            'Optimized for both iOS and Android',
          ]}
          dark={false}
          cta={
            <button className="btn-primary" onClick={openDemo}>
              Start Now <ArrowRight size={15} />
            </button>
          }
        >
          <MobileDashboardMockup />
        </FeatureSection>

        {/* Final CTA */}
        <section className="cta-section" style={{ padding: '120px 0', textAlign: 'center' }}>
          <div className="max-w-page">
            <Reveal>
              <span className="section-label">Get started today</span>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="cta-big" style={{ maxWidth: 700, margin: '20px auto 0' }}>
                Ready to transform <span style={{ color: '#60B746' }}>your accounting practice?</span>
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '20px auto 0' }}>
                Join the waitlist and be among the first accounting professionals to experience Bilanix — AI-powered, compliance-ready, built for Nigeria.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 32 }}>
                <button className="btn-primary" onClick={openDemo}>
                  Start Now <ArrowRight size={15} />
                </button>
                <a href="/pricing" className="btn-ghost">
                  View Pricing
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
      <DemoModal />
    </div>
  )
}
