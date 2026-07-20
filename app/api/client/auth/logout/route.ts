import { NextResponse } from 'next/server'
import { removeClientCookie } from '@/lib/client-auth'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'

export const POST = withErrorHandling(async () => {
  const response = NextResponse.json(apiSuccess({ message: 'Logged out successfully' }))
  removeClientCookie(response)
  return response
})
