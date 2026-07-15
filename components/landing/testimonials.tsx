'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reveal } from './reveal'

const TESTIMONIALS = [
  { initials: 'AO', bg: '#60B746', quote: '"Managing 30 client accounts on spreadsheets was unsustainable. Bilanix gave us one workspace for every client, every journal, every report. Our month-end close dropped from days to hours."', name: 'Akin Oladipo', role: 'Managing Partner, Oladipo & Associates • Lagos' },
  { initials: 'FN', bg: '#3B82F6', quote: '"The AI invoice processing is a game-changer. We upload invoices and Bilanix extracts amounts, VAT, and suggests the right ledger accounts automatically. Our juniors are now twice as productive."', name: 'Fatima Nwosu', role: 'Senior Accountant, FinEdge Consulting • Abuja' },
  { initials: 'CE', bg: '#8B5CF6', quote: '"Every journal entry is immutable with full audit trails. When clients ask for compliance reports, we generate them in two clicks. No more digging through Excel files at midnight."', name: 'Chidi Emenike', role: 'Audit Manager, Emenike & Partners • PH' },
  { initials: 'BK', bg: '#F59E0B', quote: '"As a freelance accountant handling 15 SME clients, I needed something affordable that still handled double-entry properly. Bilanix does that and the fixed asset register saves me hours every quarter."', name: 'Bisola Kadiri', role: 'Independent Accountant • Lagos' },
  { initials: 'OA', bg: '#EF4444', quote: '"VAT calculations used to be our biggest pain point. Bilanix automates the rates, tracks periods, and generates FIRS-ready reports. We went from dreading tax season to barely noticing it."', name: 'Olumide Adeyinka', role: 'Tax Lead, Adeyinka Consulting • Ibadan' },
  { initials: 'NE', bg: '#14B8A6', quote: '"The role-based access control means our accountants, supervisors, and auditors each see exactly what they need. The immutable audit trail gives our clients complete confidence in our work."', name: 'Nneka Eze', role: 'Firm Director, Eze Accounting Group • Enugu' },
]

const TRUST = [
  { value: '6+', label: 'Firms featured' },
  { value: '4.9', label: 'Average Rating', isRating: true },
  { value: '30+', label: 'Clients managed' },
]

/* Position configs for the 5-card fan */
const POSITIONS = [
  { x: -140, rotate: -14, scale: 0.88, zIndex: 1, opacity: 0.5 },  // far left
  { x: -70,  rotate: -8,  scale: 0.94, zIndex: 2, opacity: 0.7 },  // near left
  { x: 0,    rotate: 0,   scale: 1,    zIndex: 5, opacity: 1 },     // center
  { x: 70,   rotate: 8,   scale: 0.94, zIndex: 2, opacity: 0.7 },  // near right
  { x: 140,  rotate: 14,  scale: 0.88, zIndex: 1, opacity: 0.5 },  // far right
]

function getOrderedIndices(centerIdx: number, total: number) {
  const indices: number[] = []
  for (let offset = -2; offset <= 2; offset++) {
    indices.push(((centerIdx + offset) % total + total) % total)
  }
  return indices
}

function DeckCard({
  testimonial,
  posConfig,
  isCenter,
  onHover,
  onLeave,
}: {
  testimonial: (typeof TESTIMONIALS)[number]
  posConfig: (typeof POSITIONS)[number]
  isCenter: boolean
  onHover: () => void
  onLeave: () => void
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-0 w-[300px] cursor-pointer"
      style={{ marginLeft: -150 }}
      animate={{
        x: posConfig.x,
        rotate: posConfig.rotate,
        scale: posConfig.scale,
        opacity: posConfig.opacity,
        zIndex: posConfig.zIndex,
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
    >
      <div
        className="rounded-3xl p-7"
        style={{
          background: '#181818',
          boxShadow: isCenter
            ? '0 20px 60px rgba(0,0,0,0.4)'
            : '0 8px 24px rgba(0,0,0,0.25)',
        }}
      >
        {/* Stars */}
        <div className="mb-5 flex gap-0.5">
          {[0, 1, 2, 3, 4].map((s) => (
            <span key={s} style={{ color: '#FFBB3A', fontSize: '0.875rem' }}>★</span>
          ))}
        </div>

        {/* Quote */}
        <p
          className="font-body mb-6 leading-relaxed"
          style={{
            fontSize: '0.9375rem',
            color: isCenter ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)',
            lineHeight: 1.7,
            minHeight: 120,
          }}
        >
          {testimonial.quote}
        </p>

        {/* Author */}
        <div
          className="flex items-center gap-3 pt-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: testimonial.bg }}
          >
            {testimonial.initials}
          </div>
          <div>
            <div className="font-heading text-sm font-bold text-white">
              {testimonial.name}
            </div>
            <div className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {testimonial.role}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function TestimonialDeck() {
  const [centerIdx, setCenterIdx] = useState(0)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setCenterIdx((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 5000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    startTimer()
    return stopTimer
  }, [startTimer, stopTimer])

  const activeCenter = hoveredIdx !== null ? hoveredIdx : centerIdx
  const ordered = getOrderedIndices(activeCenter, TESTIMONIALS.length)

  return (
    <div className="relative" style={{ height: 380, width: '100%' }}>
      {ordered.map((tIdx, posIdx) => (
        <DeckCard
          key={tIdx}
          testimonial={TESTIMONIALS[tIdx]}
          posConfig={POSITIONS[posIdx]}
          isCenter={posIdx === 2}
          onHover={() => {
            stopTimer()
            setHoveredIdx(tIdx)
          }}
          onLeave={() => {
            setHoveredIdx(null)
            stopTimer()
            startTimer()
          }}
        />
      ))}
    </div>
  )
}

/* Mobile: simple scrollable list */
function MobileTestimonials() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setActive((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => clearInterval(t)
  }, [])

  const testimonial = TESTIMONIALS[active]

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="rounded-3xl p-7"
          style={{ background: '#181818' }}
        >
          <div className="mb-5 flex gap-0.5">
            {[0, 1, 2, 3, 4].map((s) => (
              <span key={s} style={{ color: '#FFBB3A', fontSize: '0.875rem' }}>★</span>
            ))}
          </div>
          <p className="font-body mb-6 leading-relaxed" style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
            {testimonial.quote}
          </p>
          <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: testimonial.bg }}>
              {testimonial.initials}
            </div>
            <div>
              <div className="font-heading text-sm font-bold text-white">{testimonial.name}</div>
              <div className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{testimonial.role}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="mt-6 flex justify-center gap-2">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: i === active ? 24 : 8,
              background: i === active ? '#60B746' : 'rgba(255,255,255,0.15)',
            }}
            aria-label={`Testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export function Testimonials() {
  return (
    <section id="testimonials" className="testimonials-section" style={{ padding: '120px 0', paddingBottom: 0 }}>
      <div className="max-w-page">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* LEFT — Copy */}
          <Reveal>
            <span className="section-label">What firms are saying</span>
            <h2
              className="font-heading"
              style={{
                fontSize: '2.5rem',
                fontWeight: 600,
                letterSpacing: '-0.03em',
                color: '#fff',
                lineHeight: 1.15,
                marginTop: 8,
              }}
            >
              Real firms.{' '}
              <span style={{ color: '#60B746' }}>Real impact.</span>
            </h2>
            <p
              className="font-body"
              style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.4)',
                marginTop: 20,
                lineHeight: 1.7,
                maxWidth: 440,
              }}
            >
              Accounting professionals across Nigeria use Bilanix to manage
              clients, automate entries, and stay compliant.
            </p>

            {/* Trust indicators */}
            <div className="mt-10 flex gap-10">
              {TRUST.map((t) => (
                <div key={t.label}>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-heading"
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#fff',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {t.value}
                    </span>
                    {'isRating' in t && t.isRating && (
                      <span className="flex items-center gap-px" style={{ marginTop: 2 }}>
                        {[0, 1, 2, 3, 4].map((s) => (
                          <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s < 4 ? '#F5B301' : 'none'} stroke="#F5B301" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            {s === 4 && (
                              <defs>
                                <linearGradient id="half-star" x1="0" x2="1" y1="0" y2="0">
                                  <stop offset="80%" stopColor="#F5B301" />
                                  <stop offset="80%" stopColor="transparent" />
                                </linearGradient>
                              </defs>
                            )}
                            {s === 4 && <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#half-star)" />}
                          </svg>
                        ))}
                      </span>
                    )}
                  </div>
                  <div
                    className="font-body"
                    style={{
                      fontSize: '0.8125rem',
                      color: 'rgba(255,255,255,0.35)',
                      marginTop: 4,
                    }}
                  >
                    {t.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* RIGHT — Deck (desktop) / Single card (mobile) */}
          <div>
            <div className="hidden lg:block">
              <TestimonialDeck />
            </div>
            <div className="lg:hidden">
              <MobileTestimonials />
            </div>
          </div>
        </div>
      </div>

      {/* Subtle divider */}
      <div className="max-w-page" style={{ paddingTop: 100 }}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
      </div>
    </section>
  )
}
