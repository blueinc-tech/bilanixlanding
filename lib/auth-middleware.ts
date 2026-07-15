import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { ROLES, ROLE_PERMISSIONS, type RoleName } from '@/types/admin'

// ─── JWT Types ─────────────────────────────────────────────────────

export interface JwtPayload {
  adminId: string
  email: string
  role: RoleName
  iat: number
  exp: number
}

// ─── JWT Helpers ───────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'bilanix-admin-dev-secret-change-in-production'
const JWT_EXPIRY = '24h'
const REMEMBER_ME_EXPIRY = '30d'

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>, rememberMe = false): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: rememberMe ? REMEMBER_ME_EXPIRY : JWT_EXPIRY,
  })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

// ─── Cookie Helpers ────────────────────────────────────────────────

const COOKIE_NAME = 'admin_token'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export function setAuthCookie(response: NextResponse, token: string, rememberMe = false): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    ...COOKIE_OPTIONS,
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30d or 24h
  })
  return response
}

export function removeAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete(COOKIE_NAME)
  return response
}

export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(COOKIE_NAME)?.value || null
}

// ─── Auth Middleware ────────────────────────────────────────────────

export interface AuthenticatedAdmin {
  id: string
  name: string
  email: string
  role: RoleName
  status: string
  permissions: string[]
}

export async function authenticate(req: NextRequest): Promise<
  { success: true; admin: AuthenticatedAdmin } | { success: false; response: NextResponse }
> {
  const token = getTokenFromRequest(req)

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      ),
    }
  }

  const payload = verifyToken(token)
  if (!payload) {
    const response = NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } },
      { status: 401 }
    )
    response.cookies.delete(COOKIE_NAME)
    return { success: false, response }
  }

  const admin = await prisma.admin.findUnique({
    where: { id: payload.adminId },
    include: {
      roleRel: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  })

  if (!admin || admin.status !== 'active') {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Account not found or disabled' } },
        { status: 401 }
      ),
    }
  }

  // Determine permissions: from RBAC role or fallback to static mapping
  let permissions: string[] = []
  if (admin.roleRel) {
    permissions = admin.roleRel.permissions.map((rp: { permission: { name: string } }) => rp.permission.name)
  } else {
    // Fallback: use static role→permission mapping for roles not yet in DB
    permissions = ROLE_PERMISSIONS[admin.role as RoleName] || []
  }

  return {
    success: true,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role as RoleName,
      status: admin.status,
      permissions,
    },
  }
}

// ─── Authorization Middleware ───────────────────────────────────────

export function authorize(admin: AuthenticatedAdmin, permission: string): boolean {
  if (admin.role === ROLES.SUPER_ADMIN) return true
  return admin.permissions.includes(permission)
}

export function requirePermission(permission: string) {
  return async (req: NextRequest): Promise<
    { success: true; admin: AuthenticatedAdmin } | { success: false; response: NextResponse }
  > => {
    const auth = await authenticate(req)
    if (!auth.success) return auth

    if (!authorize(auth.admin, permission)) {
      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
          },
          { status: 403 }
        ),
      }
    }

    return auth
  }
}

// ─── Route-Level Middleware ─────────────────────────────────────────

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, admin: AuthenticatedAdmin) => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response
  return handler(req, auth.admin)
}

export async function withPermission(
  req: NextRequest,
  permission: string,
  handler: (req: NextRequest, admin: AuthenticatedAdmin) => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = await requirePermission(permission)(req)
  if (!auth.success) return auth.response
  return handler(req, auth.admin)
}
