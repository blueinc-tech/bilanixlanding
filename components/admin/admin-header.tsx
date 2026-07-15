'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAdminAuth } from './auth-provider'

interface AdminHeaderProps {
  className?: string
}

export function AdminHeader({ className }: AdminHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { admin, logout } = useAdminAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const adminName = admin?.name || 'Admin'

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch('/api/admin/notifications?limit=1&unreadOnly=true')
        const json = await res.json()
        if (json.success) setUnreadCount(json.meta?.unreadCount || 0)
      } catch { /* silent */ }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 60000)
    return () => clearInterval(interval)
  }, [])

  const segments = pathname.split('/').filter(Boolean)
  const breadcrumb = segments
    .filter((s) => s !== 'admin')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))

  return (
    <header className={cn('flex h-16 items-center border-b border-border bg-card px-4 sm:px-6', className)}>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Admin</span>
        {breadcrumb.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="text-border">/</span>
            <span className={i === breadcrumb.length - 1 ? 'font-medium text-foreground' : ''}>
              {item}
            </span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <button
          className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={() => router.push('/admin/notifications')}
          aria-label="Notifications"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline">{adminName}</span>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs text-muted-foreground">{admin?.email}</p>
                  <p className="text-xs font-medium text-foreground capitalize">{admin?.role?.replace('_', ' ')}</p>
                </div>
                <button
                  className="flex w-full items-center px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => {
                    setDropdownOpen(false)
                    router.push('/admin/settings')
                  }}
                >
                  Settings
                </button>
                <hr className="my-1 border-border" />
                <button
                  className="flex w-full items-center px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setDropdownOpen(false)
                    logout()
                  }}
                >
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
