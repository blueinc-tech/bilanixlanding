import { NextRequest, NextResponse } from 'next/server'

// ─── Middleware ─────────────────────────────────────────────────────
// This middleware runs on every request.
//
// Responsibilities:
// 1. Pass maintenance mode flag to admin routes via header
// 2. Admin route protection is handled server-side in each route handler
//    (not in middleware) because we need database access to validate JWTs
//    and check permissions.
//
// The middleware only handles lightweight, non-DB checks.
// For full auth validation, use the `authenticate()` function from
// @/lib/auth-middleware in your route handlers.

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip internal Next.js paths
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  // For admin API routes, add request metadata headers
  if (pathname.startsWith('/api/admin')) {
    const response = NextResponse.next()
    // Forward client info for audit logging
    const forwarded = req.headers.get('x-forwarded-for')
    response.headers.set('x-client-ip', forwarded?.split(',')[0]?.trim() || '127.0.0.1')
    response.headers.set('x-user-agent', req.headers.get('user-agent') || 'Unknown')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
