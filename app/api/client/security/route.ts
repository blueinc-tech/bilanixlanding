export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiBadRequest } from '@/lib/api-response'
import { authenticateClient } from '@/lib/client-auth'
import { prisma } from '@/lib/db'
import { ClientAuthService } from '@/lib/services/client-auth.service'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticateClient(req)
  if (!auth.success) return auth.response
  const userId = auth.client.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lastLoginAt: true,
      lastLoginIp: true,
      createdAt: true,
    },
  })

  return apiSuccess({
    lastLoginAt: user?.lastLoginAt,
    lastLoginIp: user?.lastLoginIp,
    accountCreatedAt: user?.createdAt,
  })
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticateClient(req)
  if (!auth.success) return auth.response
  const userId = auth.client.id

  const body = await req.json()
  const parsed = changePasswordSchema.safeParse(body)

  if (!parsed.success) {
    return apiBadRequest(parsed.error.errors[0].message)
  }

  const { currentPassword, newPassword } = parsed.data

  await ClientAuthService.changeClientPassword(userId, currentPassword, newPassword)

  return apiSuccess({ message: 'Password changed successfully' })
})
