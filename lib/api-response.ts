import { NextRequest, NextResponse } from 'next/server'

// ─── Standard API Response Types ───────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  meta?: Record<string, unknown>
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]> | unknown
  }
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

// ─── Response Helpers ──────────────────────────────────────────────

export function apiSuccess<T>(data: T, status = 200, meta?: Record<string, unknown>): NextResponse {
  const body: ApiSuccessResponse<T> = { success: true, data }
  if (meta) body.meta = meta
  return NextResponse.json(body, { status })
}

export function apiCreated<T>(data: T, meta?: Record<string, unknown>): NextResponse {
  return apiSuccess(data, 201, meta)
}

export function apiError(
  message: string,
  status = 500,
  code = 'INTERNAL_ERROR',
  details?: Record<string, string[]> | unknown
): NextResponse {
  const body: ApiErrorResponse = {
    success: false,
    error: { code, message, details },
  }
  return NextResponse.json(body, { status })
}

// ─── Convenience Error Responses ───────────────────────────────────

export function apiNotFound(resource = 'Resource'): NextResponse {
  return apiError(`${resource} not found`, 404, 'NOT_FOUND')
}

export function apiUnauthorized(message = 'Authentication required'): NextResponse {
  return apiError(message, 401, 'UNAUTHORIZED')
}

export function apiForbidden(message = 'Insufficient permissions'): NextResponse {
  return apiError(message, 403, 'FORBIDDEN')
}

export function apiBadRequest(message: string, details?: Record<string, string[]>): NextResponse {
  return apiError(message, 400, 'BAD_REQUEST', details)
}

export function apiConflict(message: string): NextResponse {
  return apiError(message, 409, 'CONFLICT')
}

export function apiTooManyRequests(message = 'Too many requests. Please try again later.'): NextResponse {
  return apiError(message, 429, 'RATE_LIMITED')
}

// ─── Paginated Response ────────────────────────────────────────────

export function apiPaginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse {
  return apiSuccess(data, 200, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}

// ─── Error Classes ─────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: Record<string, string[]> | unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMITED')
  }
}

// ─── Route Handler Wrapper ─────────────────────────────────────────

type RouteHandler = (req: NextRequest, context?: { params: Record<string, string> }) => Promise<NextResponse>

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      return await handler(req, context)
    } catch (error) {
      if (error instanceof ApiError) {
        return apiError(error.message, error.status, error.code, error.details)
      }

      console.error('[API Error]', error)
      return apiError('An unexpected error occurred', 500, 'INTERNAL_ERROR')
    }
  }
}
