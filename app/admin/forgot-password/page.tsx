'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (data.success) {
        setSubmitted(true)
      } else {
        setError(data.error?.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0d1f0a 100%)' }}>
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/admin-logo.png" alt="Bilanix" width={140} height={36} style={{ height: 36, width: 'auto' }} priority />
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-sm">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#60B746]/10">
                <svg className="h-6 w-6 text-[#60B746]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
                Check your email
              </h1>
              <p className="mt-3 text-sm text-white/50">
                If an account exists with <span className="text-white/70">{email}</span>, we&apos;ve sent a password reset link.
              </p>
              <p className="mt-2 text-xs text-white/30">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => { setSubmitted(false); setEmail('') }}
                  className="flex w-full items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Try another email
                </button>
                <Link
                  href="/admin/login"
                  className="flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-[#60B746] transition-colors hover:text-[#60B746]/80"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
                  Forgot your password?
                </h1>
                <p className="mt-2 text-sm text-white/50">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-white/70">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@bilanix.com"
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#60B746]/50 focus:ring-1 focus:ring-[#60B746]/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#60B746] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4c9636] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                <Link
                  href="/admin/login"
                  className="flex w-full items-center justify-center text-sm text-white/50 transition-colors hover:text-white/70"
                >
                  Back to sign in
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
