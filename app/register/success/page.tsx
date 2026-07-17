'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function RegisterSuccessPage() {
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled') === 'true'

  useEffect(() => {
    if (!canceled) {
      const timer = setTimeout(() => {
        window.location.href = '/admin/login'
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [canceled])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0B0B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          {canceled ? (
            <XCircle size={56} color="#EF4444" />
          ) : (
            <CheckCircle2 size={56} color="#60B746" />
          )}
        </div>

        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.03em',
            marginBottom: 12,
            fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
          }}
        >
          {canceled ? 'Payment Canceled' : 'Welcome to Bilanix!'}
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.6,
            marginBottom: 8,
            fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
          }}
        >
          {canceled
            ? 'Your payment was not completed.'
            : 'Your subscription is now active.'}
        </p>

        {!canceled && (
          <p
            style={{
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: 32,
              fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
            }}
          >
            Redirecting you shortly...
          </p>
        )}

        {canceled && (
          <p
            style={{
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: 32,
              fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
            }}
          >
            You can try again whenever you&apos;re ready.
          </p>
        )}

        <Link
          href={canceled ? '/' : '/admin/login'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 48,
            padding: '0 28px',
            borderRadius: 99,
            background: canceled ? 'rgba(255,255,255,0.08)' : '#60B746',
            color: '#fff',
            fontSize: '0.9375rem',
            fontWeight: 600,
            fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
            textDecoration: 'none',
            border: canceled ? '1px solid rgba(255,255,255,0.12)' : 'none',
            transition: 'background 0.25s, transform 0.25s',
          }}
        >
          {canceled ? 'Try Again' : 'Go to Dashboard'}
        </Link>
      </div>
    </div>
  )
}
