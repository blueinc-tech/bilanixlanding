import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess, apiNotFound } from '@/lib/api-response'
import { authenticateClient } from '@/lib/client-auth'
import { prisma } from '@/lib/db'

export const GET = withErrorHandling(async (req: NextRequest, context) => {
  const auth = await authenticateClient(req)
  if (!auth.success) return auth.response
  const userId = auth.client.id
  const id = context?.params?.id

  if (!id) {
    return apiNotFound('Support ticket')
  }

  const ticket = await prisma.contactSubmission.findFirst({
    where: { id, userId },
  })

  if (!ticket) {
    return apiNotFound('Support ticket')
  }

  return apiSuccess(ticket)
})
