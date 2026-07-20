import { NextRequest } from 'next/server'
import { authenticateClient } from '@/lib/client-auth'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const auth = await authenticateClient(request)

  if (!auth.success) {
    return auth.response
  }

  return apiSuccess(auth.client)
})
