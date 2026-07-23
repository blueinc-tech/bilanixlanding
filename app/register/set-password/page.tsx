'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { CheckCircle2 } from 'lucide-react'

function SetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/register/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error?.message || 'Failed to set password')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B0B0B',
          padding: '1rem',
        }}
      >
        <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <CheckCircle2 size={56} color="#60B746" />
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: 8,
            }}
          >
            Password Set Successfully
          </h1>
          <p style={{ color: '#888888', fontSize: '14px', marginBottom: 32 }}>
            Redirecting you to login...
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 44,
              padding: '0 28px',
              borderRadius: 8,
              background: '#60B746',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0B0B0B',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#111111',
          borderRadius: '12px',
          border: '1px solid #1E1E1E',
          padding: '40px 32px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Image
            src="/bilanix-logo-white.png"
            alt="Bilanix"
            width={140}
            height={32}
            style={{ display: 'block', margin: '0 auto 24px auto' }}
          />
          <h1
            style={{
              color: '#FFFFFF',
              fontSize: '24px',
              fontWeight: 700,
              margin: '0 0 8px 0',
            }}
          >
            Set Your Password
          </h1>
          <p style={{ color: '#888888', fontSize: '14px', margin: 0 }}>
            Create a password for your account
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#2D1215',
              border: '1px solid #5C1D22',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#F87171',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                color: '#AAAAAA',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '6px',
              }}
            >
              Email
            </label>
            <Input
              value={email}
              readOnly
              disabled
              style={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #2A2A2A',
                color: '#FFFFFF',
                height: '44px',
                opacity: 0.7,
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                color: '#AAAAAA',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <PasswordInput
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #2A2A2A',
                color: '#FFFFFF',
                height: '44px',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                color: '#AAAAAA',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '6px',
              }}
            >
              Confirm Password
            </label>
            <PasswordInput
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #2A2A2A',
                color: '#FFFFFF',
                height: '44px',
              }}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '44px',
              backgroundColor: '#60B746',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Setting password...' : 'Set Password'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link
            href="/login"
            style={{
              color: '#888888',
              fontSize: '13px',
              textDecoration: 'none',
            }}
          >
            Already have a password? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0B0B' }}>
        <p style={{ color: '#888888' }}>Loading...</p>
      </div>
    }>
      <SetPasswordForm />
    </Suspense>
  )
}
