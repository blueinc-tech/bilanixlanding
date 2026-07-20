import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'

// ─── JWT Types ─────────────────────────────────────────────────────

export interface ClientJwtPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

// ─── JWT Helpers ───────────────────────────────────────────────────

const CLIENT_JWT_SECRET = process.env.CLIENT_JWT_SECRET || 'bilanix-client-dev-secret-change-in-production'
const CLIENT_JWT_EXPIRY = '24h'
const CLIENT_REMEMBER_ME_EXPIRY = '30d'

export function signClientToken(payload: Omit<ClientJwtPayload, 'iat' | 'exp'>, rememberMe = false): string {
  return jwt.sign(payload, CLIENT_JWT_SECRET, {
    expiresIn: rememberMe ? CLIENT_REMEMBER_ME_EXPIRY : CLIENT_JWT_EXPIRY,
  })
}

export function verifyClientToken(token: string): ClientJwtPayload | null {
  try {
    return jwt.verify(token, CLIENT_JWT_SECRET) as ClientJwtPayload
  } catch {
    return null
  }
}

// ─── Cookie Helpers ────────────────────────────────────────────────

const CLIENT_COOKIE_NAME = 'client_token'
const CLIENT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export function setClientCookie(response: NextResponse, token: string, rememberMe = false): NextResponse {
  response.cookies.set(CLIENT_COOKIE_NAME, token, {
    ...CLIENT_COOKIE_OPTIONS,
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
  })
  return response
}

export function removeClientCookie(response: NextResponse): NextResponse {
  response.cookies.delete(CLIENT_COOKIE_NAME)
  return response
}

export function getClientTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(CLIENT_COOKIE_NAME)?.value || null
}

// ─── Auth Middleware ────────────────────────────────────────────────

export interface AuthenticatedClient {
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

export async function authenticateClient(req: NextRequest): Promise<
  { success: true; client: AuthenticatedClient } | { success: false; response: NextResponse }
> {
  const token = getClientTokenFromRequest(req)

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      ),
    }
  }

  const payload = verifyClientToken(token)
  if (!payload) {
    const response = NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } },
      { status: 401 }
    )
    response.cookies.delete(CLIENT_COOKIE_NAME)
    return { success: false, response }
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  })

  if (!user || user.status !== 'active') {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Account not found or disabled' } },
        { status: 401 }
      ),
    }
  }

  return {
    success: true,
    client: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company,
      country: user.country,
      industry: user.industry,
      avatar: user.avatar,
      status: user.status,
    },
  }
}

// ─── Route-Level Middleware ─────────────────────────────────────────

export async function withClientAuth(
  req: NextRequest,
  handler: (req: NextRequest, client: AuthenticatedClient) => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = await authenticateClient(req)
  if (!auth.success) return auth.response
  return handler(req, auth.client)
}
