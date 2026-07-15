'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
}

interface AuthContextType {
  admin: AdminUser | null
  loading: boolean
  isAuthenticated: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  admin: null,
  loading: true,
  isAuthenticated: false,
  refresh: async () => {},
  logout: async () => {},
})

export function useAdminAuth() {
  return useContext(AuthContext)
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAdmin = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/me')
      const data = await res.json()
      if (data.success && data.data) {
        setAdmin(data.data)
        localStorage.setItem('admin_name', data.data.name)
      } else {
        setAdmin(null)
        localStorage.removeItem('admin_name')
      }
    } catch {
      setAdmin(null)
      localStorage.removeItem('admin_name')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAdmin()
  }, [fetchAdmin])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
    } finally {
      setAdmin(null)
      localStorage.removeItem('admin_name')
      window.location.href = '/admin/login'
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated: !!admin,
        refresh: fetchAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
