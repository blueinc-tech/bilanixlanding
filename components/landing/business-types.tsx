'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Reveal } from './reveal'

const SOLUTIONS = [
  {
    title: 'Freelancers',
    tagline: 'Built for independent professionals managing their own finances.',
    image: '/solutions/freelancer-rocket.png',
  },
  {
    title: 'SMEs Startups',
    tagline: 'Designed to help growing businesses stay on top of their accounting.',
    image: '/solutions/sme-shop.png',
  },
  {
    title: 'Large Business',
    tagline: 'Robust tools for businesses with more complex financial operations.',
    image: '/solutions/large-building.png',
  },
  {
    title: 'Enterprises',
    tagline: 'Enterprise-grade accounting for organizations operating at scale.',
    image: '/solutions/enterprise-tower.png',
  },
]

function SolutionCard({ title, tagline, image }: (typeof SOLUTIONS)[number]) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.article
      className="group relative flex flex-col rounded-2xl bg-[#181818] p-8 outline-none"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      animate={{
        y: hovered ? -4 : 0,
        boxShadow: hovered
          ? '0 12px 32px rgba(0,0,0,0.35)'
          : '0 2px 8px rgba(0,0,0,0.2)',
        borderColor: hovered
          ? 'rgba(255,255,255,0.12)'
          : 'rgba(255,255,255,0.06)',
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Illustration */}
      <div className="relative mx-auto mb-6 aspect-square w-full max-w-[200px]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain"
          sizes="200px"
        />
      </div>

      {/* Title */}
      <h4 className="font-heading text-[30px] font-semibold leading-tight tracking-tight text-white">
        {title}
      </h4>

      {/* Tagline — desktop: reveal on hover; mobile: always visible */}
      <div className="hidden md:block">
        <AnimatePresence>
          {hovered && (
            <motion.p
              className="mt-3 max-w-[90%] font-body text-base font-normal leading-relaxed text-[rgba(255,255,255,0.45)]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {tagline}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Tagline — mobile: always visible */}
      <p className="mt-3 max-w-[90%] font-body text-base font-normal leading-relaxed text-[rgba(255,255,255,0.45)] md:hidden">
        {tagline}
      </p>
    </motion.article>
  )
}

export function BusinessTypes() {
  return (
    <section
      id="solutions"
      className="biz-section"
      style={{ padding: '120px 0' }}
    >
      <div className="max-w-page">
        <Reveal className="text-center" style={{ marginBottom: 64 }}>
          <span className="section-label">Solutions</span>
          <h2 className="font-heading text-[2.5rem] font-semibold leading-[1.15] tracking-tight text-white">
            Built for accounting<br />professionals at every scale.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Whether you manage 5 clients or 100+, Bilanix scales with your practice.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SOLUTIONS.map((s, i) => (
            <Reveal key={s.title} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <SolutionCard {...s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
