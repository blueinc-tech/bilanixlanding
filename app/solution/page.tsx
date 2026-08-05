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
import { openRegistration } from '@/components/landing/registration-modal'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { RegistrationModal } from '@/components/landing/registration-modal'

export default function SolutionPage() {
  return (
    <div className="bilanix">
      <Navbar />
      <main>
        {/* Hero — Green gradient */}
        <section className="relative w-full flex items-center overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #0a1c08, #112a0e, #1c3f19)', paddingTop: 96, paddingBottom: 96 }}>
          {/* Grid overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          {/* Glow blob */}
          <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full blur-[100px]" style={{ background: 'rgba(96,183,70,0.1)' }} />
          {/* Content */}
          <div className="relative z-10 mx-auto w-full max-w-page text-center">
            <Reveal>
              <h1 className="page-hero-title" style={{ color: '#fff', lineHeight: 1.05 }}>
                Every feature your firm <span className="text-[#60B746]">needs to grow</span>
              </h1>
            </Reveal>
            <Reveal delay={1}>
              <p className="mx-auto mt-5 max-w-3xl text-[16px] leading-[1.7] text-white/55">
                Bilanix combines AI-powered automation, true double-entry accounting, and Nigerian tax compliance into one platform, purpose-built for firms managing multiple clients.
              </p>
            </Reveal>
            <Reveal delay={2}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button className="btn-primary" onClick={() => openRegistration()}>
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
          id="core-accounting"
          label="Core accounting engine"
          title={<>True double-entry accounting, <span style={{ color: '#60B746' }}>built for precision</span></>}
          description="Every transaction is validated against a true double-entry core, so debit always equals credit — no manual errors, ever."
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
          id="ai-automation"
          label="AI-powered automation"
          title={<>Process invoices <span style={{ color: '#60B746' }}>10x faster with AI</span></>}
          description="Upload an invoice and Bilanix AI extracts the details, calculates VAT, and drafts the entry for your one-click review."
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
          id="tax-vat"
          label="Tax & VAT compliance"
          title={<>Nigerian VAT compliance, <span style={{ color: '#60B746' }}>fully automated</span></>}
          description="A configurable VAT engine automates detection, separation, and calculation across every client engagement."
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
          id="multi-client"
          label="Multi-client management"
          title={<>Manage your entire <span style={{ color: '#60B746' }}>client portfolio in one place</span></>}
          description="Onboard clients with unique codes, segment by industry or size, and run your entire practice from one workspace."
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
          id="reports-analytics"
          label="Reports & analytics"
          title={<>Financial intelligence <span style={{ color: '#60B746' }}>at your fingertips</span></>}
          description="Profit & loss, balance sheet, trial balance, and cash flow — instantly, for any client, any period."
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
          id="security-access"
          label="Security & access control"
          title={<>Role-based access <span style={{ color: '#60B746' }}>that protects every client</span></>}
          description="Admin, Accountant, Viewer, and Auditor roles control exactly who sees what, across every client in your portfolio."
          bullets={[
            'Four distinct roles with granular permission control',
            'Per-client access isolation, no cross-contamination',
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
          description="Review dashboards, approve journal entries, and monitor client portfolios, all from your mobile device."
          bullets={[
            'Full dashboard access on any mobile device',
            'Approve and post journal entries from anywhere',
            'Real-time notifications for client activity and alerts',
            'Secure mobile authentication with biometrics',
            'Optimized for both iOS and Android',
          ]}
          dark={false}
          cta={
            <button className="btn-primary" onClick={() => openRegistration()}>
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
              <h2 className="cta-big" style={{ margin: '20px auto 0' }}>
                Ready to transform<br /><span style={{ color: '#60B746' }}>your accounting practice?</span>
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="section-desc" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '20px auto 0' }}>
                Join accounting firms across Nigeria using Bilanix to manage multi-client portfolios with AI-powered automation.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 32 }}>
                <button className="btn-primary" onClick={() => openRegistration()}>
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
      <RegistrationModal />
    </div>
  )
}
