import { z } from 'zod'
import { apiBadRequest } from './api-response'

// ─── Common Validation Schemas ─────────────────────────────────────

export const emailSchema = z.string().email('Invalid email address').toLowerCase().trim()

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')

export const nameSchema = z.string().min(1, 'Name is required').max(255).trim()

export const idSchema = z.string().cuid('Invalid ID format')

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// ─── Request Body Parser ───────────────────────────────────────────

export async function parseBody<T>(req: Request, schema: z.ZodSchema<T>): Promise<
  | { success: true; data: T }
  | { success: false; response: ReturnType<typeof apiBadRequest> }
> {
  try {
    const body = await req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of result.error.issues) {
        const path = issue.path.join('.')
        if (!fieldErrors[path]) fieldErrors[path] = []
        fieldErrors[path].push(issue.message)
      }

      return {
        success: false,
        response: apiBadRequest('Validation failed', fieldErrors),
      }
    }

    return { success: true, data: result.data }
  } catch {
    return {
      success: false,
      response: apiBadRequest('Invalid JSON body'),
    }
  }
}

// ─── Query Params Parser ───────────────────────────────────────────

export function parseQuery<T>(url: string, schema: z.ZodSchema<T>): {
  success: true
  data: T
} | {
  success: false
  response: ReturnType<typeof apiBadRequest>
} {
  try {
    const { searchParams } = new URL(url)
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    const result = schema.safeParse(params)

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of result.error.issues) {
        const path = issue.path.join('.')
        if (!fieldErrors[path]) fieldErrors[path] = []
        fieldErrors[path].push(issue.message)
      }

      return {
        success: false,
        response: apiBadRequest('Invalid query parameters', fieldErrors),
      }
    }

    return { success: true, data: result.data }
  } catch {
    return {
      success: false,
      response: apiBadRequest('Invalid URL'),
    }
  }
}

// ─── Extract IP & User Agent ───────────────────────────────────────

export function getClientInfo(req: Request): { ipAddress: string; userAgent: string } {
  const forwarded = req.headers.get('x-forwarded-for')
  const ipAddress = forwarded?.split(',')[0]?.trim() || '127.0.0.1'
  const userAgent = req.headers.get('user-agent') || 'Unknown'
  return { ipAddress, userAgent }
}
