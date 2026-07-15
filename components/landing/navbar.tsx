'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { openDemo } from './demo-modal'

const LINKS = [
  { label: 'Solutions', href: '/solution' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', target: 'contact' },
]

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round">
      <motion.line x1="3" y1="6" x2="19" y2="6" animate={open ? { y1: 11, y2: 11, rotate: 45 } : { y1: 6, y2: 6, rotate: 0 }} style={{ transformOrigin: 'center' }} transition={{ duration: 0.25 }} />
      <motion.line x1="3" y1="11" x2="19" y2="11" animate={open ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.15 }} />
      <motion.line x1="3" y1="16" x2="19" y2="16" animate={open ? { y1: 11, y2: 11, rotate: -45 } : { y1: 16, y2: 16, rotate: 0 }} style={{ transformOrigin: 'center' }} transition={{ duration: 0.25 }} />
    </svg>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleNav = useCallback((link: { label: string; href?: string; target?: string }) => {
    setMenuOpen(false)
    if (link.href) {
      window.location.href = link.href
    } else if (link.target) {
      setTimeout(() => {
        const el = document.getElementById(link.target!)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 350)
    }
  }, [])

  return (
    <>
      <nav className={`nav-wrap ${scrolled ? 'scrolled' : ''}`}>
        <div className="max-w-page">
          <div className="flex items-center justify-between" style={{ height: 72 }}>
            <Link href="/" className="flex items-center" aria-label="Bilanix home">
              <Image src="/bilanix-logo-dark.png" alt="Bilanix" width={140} height={36} style={{ height: 28, width: 'auto' }} priority />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {LINKS.map((l) => (
                <button key={l.label} className="nav-link" onClick={() => handleNav(l)}>
                  {l.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button className="nav-signin" onClick={openDemo}>Sign in</button>
              <button className="nav-cta-primary" onClick={openDemo}>Start free</button>
            </div>

            <div className="flex md:hidden items-center gap-3">
              <button className="nav-cta-primary" onClick={openDemo}>Start free</button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center justify-center"
                style={{ width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="Toggle menu"
              >
                <HamburgerIcon open={menuOpen} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(0,0,0,0.35)',
              }}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mobile-menu-panel"
            >
              <div className="flex items-center justify-between" style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
                <Image src="/bilanix-logo-dark.png" alt="Bilanix" width={120} height={32} style={{ height: 24, width: 'auto' }} />
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{ width: 40, height: 40, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Close menu"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="4" y1="4" x2="16" y2="16" />
                    <line x1="16" y1="4" x2="4" y2="16" />
                  </svg>
                </button>
              </div>

              <div style={{ padding: '32px 24px', flex: 1 }}>
                <div className="flex flex-col" style={{ gap: 8 }}>
                  {LINKS.map((l) => (
                    <button
                      key={l.label}
                      onClick={() => handleNav(l)}
                      className="mobile-menu-link"
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding: '0 24px 32px' }}>
                <div className="flex flex-col" style={{ gap: 12 }}>
                  <button
                    className="mobile-menu-btn-secondary"
                    onClick={() => { setMenuOpen(false); openDemo() }}
                  >
                    Sign in
                  </button>
                  <button
                    className="mobile-menu-btn-primary"
                    onClick={() => { setMenuOpen(false); openDemo() }}
                  >
                    Start free
                  </button>
                </div>

                <div className="flex items-center justify-center gap-6" style={{ marginTop: 24 }}>
                  {['Privacy', 'Terms', 'Contact'].map((t) => (
                    <a key={t} href="#" style={{ fontSize: '0.75rem', color: '#9CA3AF', textDecoration: 'none' }}>{t}</a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
