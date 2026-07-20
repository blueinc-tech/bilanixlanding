'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

type VerifyState = 'loading' | 'success' | 'failed' | 'canceled'

export default function RegisterSuccessPage() {
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled') === 'true'
  const reference = searchParams.get('reference')
  const sessionId = searchParams.get('session_id')

  const [state, setState] = useState<VerifyState>(canceled ? 'canceled' : 'loading')
  const [message, setMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    if (canceled || (!reference && !sessionId)) return

    let attempts = 0
    const maxAttempts = 5

    async function verify() {
      try {
        const params = new URLSearchParams()
        if (reference) params.set('reference', reference)
        if (sessionId) params.set('session_id', sessionId)

        const res = await fetch(`/api/checkout/verify?${params}`)
        const json = await res.json()

        if (json.data?.status === 'paid' || json.data?.alreadyProcessed) {
          setState('success')
          if (json.data?.email) setUserEmail(json.data.email)
          setMessage(json.data?.alreadyProcessed
            ? 'Your subscription is already active.'
            : 'Your subscription is now active.')
        } else if (json.data?.status === 'failed') {
          setState('failed')
          setMessage('We could not confirm your payment. Please contact support with your reference.')
        } else if (json.data?.status === 'pending') {
          if (attempts < maxAttempts) {
            attempts++
            setTimeout(verify, 2000)
          } else {
            setState('failed')
            setMessage('Payment is still processing. Please check again later.')
          }
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(verify, 2000)
        } else {
          setState('failed')
          setMessage('Could not verify your payment. Please contact support.')
        }
      } catch {
        if (attempts < maxAttempts) {
          attempts++
          setTimeout(verify, 2000)
        } else {
          setState('failed')
          setMessage('Something went wrong. Please contact support.')
        }
      }
    }

    verify()
  }, [canceled, reference, sessionId])

  useEffect(() => {
    if (state === 'success' && userEmail) {
      const timer = setTimeout(() => {
        window.location.href = `/register/set-password?email=${encodeURIComponent(userEmail)}`
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [state, userEmail])

  const isCanceled = state === 'canceled'
  const isSuccess = state === 'success'
  const isFailed = state === 'failed'
  const isLoading = state === 'loading'

  const title = isCanceled
    ? 'Payment Canceled'
    : isSuccess
      ? 'Welcome to Bilanix!'
      : isFailed
        ? 'Payment Verification Failed'
        : 'Verifying Payment...'

  const displayMessage = isCanceled
    ? 'Your payment was not completed.'
    : isLoading
      ? 'Please wait while we confirm your payment.'
      : message

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
          {isLoading ? (
            <Loader2 size={56} color="#60B746" className="animate-spin" />
          ) : (
            <CheckCircle2 size={56} color={isSuccess ? '#60B746' : '#EF4444'} />
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
          {title}
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
          {displayMessage}
        </p>

        {!isCanceled && !isLoading && isSuccess && (
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

        {isFailed && (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.25)',
              marginBottom: 32,
              fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
            }}
          >
            Reference: {reference || sessionId}
          </p>
        )}

        {(isCanceled || isFailed) && (
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
              padding: '0 28px',
              borderRadius: 99,
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: '0.9375rem',
              fontWeight: 600,
              fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
              transition: 'background 0.25s, transform 0.25s',
            }}
          >
            Try Again
          </Link>
        )}

        {isSuccess && (
          <Link
            href={userEmail ? `/register/set-password?email=${encodeURIComponent(userEmail)}` : '/login'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
              padding: '0 28px',
              borderRadius: 99,
              background: '#60B746',
              color: '#fff',
              fontSize: '0.9375rem',
              fontWeight: 600,
              fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
              textDecoration: 'none',
              transition: 'background 0.25s, transform 0.25s',
            }}
          >
            Set Your Password
          </Link>
        )}
      </div>
    </div>
  )
}
