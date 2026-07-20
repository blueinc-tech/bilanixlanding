'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

// ─── Types ─────────────────────────────────────────────────────────

export interface ClientUser {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  country: string | null
  industry: string | null
  avatar: string | null
  status: string
}

interface ClientAuthContextValue {
  user: ClientUser | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const ClientAuthContext = createContext<ClientAuthContextValue | undefined>(undefined)

// ─── Provider ──────────────────────────────────────────────────────

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/client/auth/me')
      const data = await res.json()

      if (data.success && data.data) {
        setUser(data.data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      try {
        const res = await fetch('/api/client/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, rememberMe }),
        })

        const data = await res.json()

        if (!data.success) {
          return { success: false, error: data.error?.message || 'Login failed' }
        }

        if (data.data?.user) {
          setUser({
            id: data.data.user.id,
            name: data.data.user.name,
            email: data.data.user.email,
            phone: data.data.user.phone || null,
            company: data.data.user.company || null,
            country: data.data.user.country || null,
            industry: data.data.user.industry || null,
            avatar: data.data.user.avatar || null,
            status: data.data.user.status || 'active',
          })
        } else {
          await fetchUser()
        }

        return { success: true }
      } catch {
        return { success: false, error: 'An unexpected error occurred' }
      }
    },
    [fetchUser]
  )

  const logout = useCallback(async () => {
    try {
      await fetch('/api/client/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  const value: ClientAuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  }

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>
}

// ─── Hook ──────────────────────────────────────────────────────────

export function useClientAuth(): ClientAuthContextValue {
  const context = useContext(ClientAuthContext)
  if (!context) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider')
  }
  return context
}
