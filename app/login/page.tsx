'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ClientLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/client/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error?.message || 'Login failed')
        setLoading(false)
        return
      }

      if (data.data?.user?.name) {
        localStorage.setItem('client_name', data.data.user.name)
      }

      router.push('/client')
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
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
            Welcome Back
          </h1>
          <p
            style={{
              color: '#888888',
              fontSize: '14px',
              margin: 0,
            }}
          >
            Sign in to your account
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
              htmlFor="email"
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
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #2A2A2A',
                color: '#FFFFFF',
                height: '44px',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="password"
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
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
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

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#AAAAAA',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: '#60B746',
                  width: '16px',
                  height: '16px',
                }}
              />
              Remember me
            </label>
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
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link
            href="/"
            style={{
              color: '#888888',
              fontSize: '13px',
              textDecoration: 'none',
            }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
