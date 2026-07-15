'use client'

import { motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { openDemo } from './demo-modal'

type Billing = 'monthly' | 'yearly'

interface PricingCardProps {
  name: string
  audience: string
  price: Record<Billing, string>
  period: Record<Billing, string>
  cta: string
  features: string[]
  featured?: boolean
  badge?: string
  index: number
  billing: Billing
  expanded?: boolean
  onToggleExpand?: () => void
  cardHeight?: number | null
}

export function PricingCard({
  name,
  audience,
  price,
  period,
  cta,
  features,
  featured,
  badge,
  index,
  billing,
  expanded = false,
  onToggleExpand,
  cardHeight,
}: PricingCardProps) {
  const visibleFeatures = expanded ? features : features.slice(0, 5)
  const hasMore = features.length > 5

  const cardBg = featured ? '#0D0D0D' : '#fff'
  const cardColor = featured ? '#fff' : '#0F0F0F'
  const mutedColor = featured ? 'rgba(255,255,255,0.55)' : '#9CA3AF'
  const featureColor = featured ? 'rgba(255,255,255,0.7)' : '#525252'

  return (
    <motion.div
      data-card
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 16,
        padding: 24,
        background: cardBg,
        color: cardColor,
        boxShadow: featured ? '0 12px 32px rgba(0,0,0,0.18)' : '0 6px 20px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.3s',
        ...(cardHeight ? { minHeight: expanded ? 'auto' : cardHeight } : {}),
      }}
    >
      {/* Badge area — always same height */}
      <div style={{ minHeight: 22, marginBottom: 16 }}>
        {badge && (
          <span style={{ display: 'inline-block', width: 'fit-content', borderRadius: 999, background: '#60B746', padding: '4px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff' }}>
            {badge}
          </span>
        )}
      </div>

      <h3 style={{ fontFamily: 'var(--font-jakarta)', fontSize: 16, fontWeight: 600 }}>{name}</h3>
      <p style={{ marginTop: 2, fontSize: 12, color: mutedColor }}>{audience}</p>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {price[billing]}
        </div>
        <p style={{ marginTop: 2, fontSize: 11, color: mutedColor }}>
          {period[billing]}
        </p>
      </div>

      <button
        onClick={openDemo}
        style={{
          marginTop: 20,
          cursor: 'pointer',
          borderRadius: 12,
          padding: '10px 0',
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 600,
          border: featured ? 'none' : '1px solid #E5E7EB',
          background: featured ? '#60B746' : 'transparent',
          color: featured ? '#fff' : '#0F0F0F',
          width: '100%',
          transition: 'all 0.2s',
        }}
      >
        {cta}
      </button>

      {/* Features — show first 5, or all when expanded */}
      <ul style={{
        marginTop: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        listStyle: 'none',
        padding: 0,
      }}>
        {visibleFeatures.map((feature) => (
          <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5 }}>
            <Check size={14} strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0, color: '#60B746' }} />
            <span style={{ color: featureColor }}>{feature}</span>
          </li>
        ))}
      </ul>

      {hasMore ? (
        <button
          onClick={onToggleExpand}
          style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 500,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: featured ? 'rgba(255,255,255,0.5)' : '#9CA3AF',
          }}
        >
          {expanded ? 'Show less' : 'Read more'}
          <ChevronDown
            size={13}
            style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}
          />
        </button>
      ) : (
        <div style={{ marginTop: 16, height: 28 }} />
      )}
    </motion.div>
  )
}

export function ComparisonCheck({ included }: { included: boolean }) {
  return included ? (
    <Check size={16} style={{ color: '#60B746' }} />
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
  )
}

export function ComparisonValue({ value }: { value: string }) {
  return <span style={{ fontSize: 13, fontWeight: 600, color: '#0F0F0F' }}>{value}</span>
}
