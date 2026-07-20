export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { authenticateClient } from '@/lib/client-auth'
import { ClientAuthService } from '@/lib/services/client-auth.service'
import { withErrorHandling, apiSuccess, apiBadRequest } from '@/lib/api-response'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const auth = await authenticateClient(request)

  if (!auth.success) {
    return auth.response
  }

  const body = await request.json()
  const parsed = changePasswordSchema.safeParse(body)

  if (!parsed.success) {
    return apiBadRequest(parsed.error.errors[0].message)
  }

  const { currentPassword, newPassword } = parsed.data
  const userId = auth.client.id

  await ClientAuthService.changeClientPassword(userId, currentPassword, newPassword)

  return apiSuccess({ message: 'Password changed successfully' })
})
