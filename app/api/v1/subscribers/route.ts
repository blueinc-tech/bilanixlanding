export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess, apiBadRequest } from '@/lib/api-response'
import { authenticateApiKey } from '@/lib/api-key-auth'
import { SubscriberService } from '@/lib/services/subscriber.service'

// GET /api/v1/subscribers?cursor=<id>&limit=<n>
//
// Bulk roster of every client that has completed checkout at least once,
// with a computed status (pending | active | expired | cancelled) based on
// the current time vs. their subscription's endDate. Intended for
// app.bilanix.com to periodically page through and reconcile access —
// paginate via `nextCursor` until it comes back null.
//
// Auth: X-API-Key / X-API-Secret headers.
export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticateApiKey(req)
  if (!auth.success) return auth.response

  const url = new URL(req.url)
  const cursor = url.searchParams.get('cursor') || undefined

  const limitParam = url.searchParams.get('limit')
  let limit = 100
  if (limitParam !== null) {
    limit = Number(limitParam)
    if (!Number.isFinite(limit) || limit < 1) {
      return apiBadRequest('limit must be a positive number')
    }
  }

  const { subscribers, nextCursor } = await SubscriberService.list({ cursor, limit })
  return apiSuccess({ subscribers, nextCursor })
})
