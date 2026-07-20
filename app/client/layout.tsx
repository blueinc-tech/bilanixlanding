'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ClientAuthProvider, useClientAuth } from '@/components/client/client-auth-provider'
import { ClientSidebar } from '@/components/client/client-sidebar'
import { ClientHeader } from '@/components/client/client-header'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

const PUBLIC_CLIENT_ROUTES = ['/login']

function ClientShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useClientAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isPublicRoute = PUBLIC_CLIENT_ROUTES.some((r) => pathname.startsWith(r))

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicRoute) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, isPublicRoute, router, pathname])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (isPublicRoute) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-8 w-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex">
        <ClientSidebar />
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <ClientSidebar />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <ClientHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientAuthProvider>
      <ClientShell>{children}</ClientShell>
    </ClientAuthProvider>
  )
}
