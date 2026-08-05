export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess, apiNotFound, apiBadRequest } from '@/lib/api-response'
import { authenticateApiKey } from '@/lib/api-key-auth'
import { SubscriberService } from '@/lib/services/subscriber.service'

// GET /api/v1/subscribers/:email
//
// Real-time single-client lookup, e.g. at login time on app.bilanix.com.
// Returns 404 if no account exists for that email at all.
//
// Auth: X-API-Key / X-API-Secret headers.
export const GET = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticateApiKey(req)
  if (!auth.success) return auth.response

  const raw = context?.params?.email
  if (!raw) return apiBadRequest('Email is required')

  const email = decodeURIComponent(raw).toLowerCase().trim()
  if (!email.includes('@')) return apiBadRequest('Invalid email')

  const subscriber = await SubscriberService.getByEmail(email)
  if (!subscriber) return apiNotFound('Subscriber')

  return apiSuccess(subscriber)
})
