'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Reveal } from './reveal'

const FAQS = [
  {
    q: 'How do I get started with Bilanix?',
    a: 'Sign up for an account, choose your plan, and follow our guided onboarding. You can invite your team members, set up client workspaces, and start managing your first client portfolio within minutes.',
  },
  {
    q: 'Can I manage multiple clients from one account?',
    a: 'Yes. Bilanix is built specifically for firms managing multiple clients. Each plan includes a set number of client workspaces, and you can switch between clients from a centralized dashboard.',
  },
  {
    q: 'What is the AI invoicing feature?',
    a: 'Our AI engine reads your uploaded invoices, extracts key details like supplier name, date, amounts, and VAT, then suggests the correct journal entry and ledger account — ready for your one-click review and posting.',
  },
  {
    q: 'How does Nigerian VAT compliance work?',
    a: 'Bilanix automatically detects and calculates 7.5% Nigerian VAT on applicable transactions. It tracks input and output VAT per client and period, and generates FIRS-compliant reports ready for filing.',
  },
  {
    q: 'Can I upgrade or downgrade my plan?',
    a: 'Yes. You can upgrade or downgrade your plan at any time. When upgrading, the price difference is prorated for the remainder of your billing cycle. Downgrades take effect at the start of the next billing period.',
  },
  {
    q: 'Is there a free trial available?',
    a: 'Yes. We offer a 14-day free trial on all plans so you can explore the full feature set before committing. No credit card required to start your trial.',
  },
  {
    q: "What does 'users' mean in each plan?",
    a: 'Users are team members who have access to your Bilanix account. Each plan includes a set number of users — from 1 user on Basic to 10 users on Premium. Additional users can be added as add-ons.',
  },
  {
    q: 'How is client data kept secure?',
    a: 'All data is encrypted at rest and in transit. Each client workspace is fully isolated, with role-based access control ensuring no cross-contamination. We follow SOC2-aligned security practices with regular audits.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom: '1px solid #F1F5F9' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          padding: '24px 8px',
          textAlign: 'left',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
        }}
        aria-expanded={open}
      >
        <span style={{ fontSize: 15, fontWeight: 500, color: '#0F0F0F' }}>{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0, color: '#60B746' }}
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ padding: '0 8px 24px', fontSize: 14, lineHeight: 1.7, color: '#737373' }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function PricingFAQ() {
  return (
    <section style={{ background: '#fff', padding: '80px 0' }}>
      <div className="max-w-page" style={{ padding: '0 20px' }}>
        <Reveal>
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <p className="section-label">FAQ</p>
            <h2 className="font-heading" style={{ marginTop: 20, fontSize: 46, fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.015em', color: '#0F0F0F' }}>
              Questions before{' '}
              <span style={{ fontWeight: 600, color: '#60B746' }}>you sign up</span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div style={{ borderTop: '1px solid #F1F5F9' }}>
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
