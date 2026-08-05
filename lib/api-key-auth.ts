import { NextRequest, NextResponse } from 'next/server'
import { ApiKeyService } from '@/lib/services/api-key.service'
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limiter'

// ─── Public API Authentication (app.bilanix.com integration) ──────
// Callers send X-API-Key (key ID, public) and X-API-Secret (private) headers.

export async function authenticateApiKey(req: NextRequest): Promise<
  { success: true } | { success: false; response: NextResponse }
> {
  const keyId = req.headers.get('x-api-key')
  const secret = req.headers.get('x-api-secret')

  if (!keyId || !secret) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing X-API-Key / X-API-Secret headers' } },
        { status: 401 }
      ),
    }
  }

  const rate = checkRateLimit(`apikey:${keyId}`, RATE_LIMITS.publicApi)
  if (!rate.allowed) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rate) }
      ),
    }
  }

  const valid = await ApiKeyService.verify(keyId, secret)
  if (!valid) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API credentials' } },
        { status: 401 }
      ),
    }
  }

  return { success: true }
}
