export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiBadRequest } from '@/lib/api-response'
import { authenticateClient } from '@/lib/client-auth'
import { prisma } from '@/lib/db'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  address: z.string().optional(),
})

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticateClient(req)
  if (!auth.success) return auth.response
  const userId = auth.client.id

  const user = await prisma.user.findUnique({ where: { id: userId } })

  return apiSuccess(user)
})

export const PUT = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticateClient(req)
  if (!auth.success) return auth.response
  const userId = auth.client.id

  const body = await req.json()
  const parsed = updateProfileSchema.safeParse(body)

  if (!parsed.success) {
    return apiBadRequest(parsed.error.errors[0].message)
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
  })

  return apiSuccess(updated)
})
