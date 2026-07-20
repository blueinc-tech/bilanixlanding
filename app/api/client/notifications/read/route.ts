export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiBadRequest } from '@/lib/api-response'
import { authenticateClient } from '@/lib/client-auth'
import { prisma } from '@/lib/db'

const markReadSchema = z.object({
  notificationId: z.string().optional(),
  markAll: z.boolean().optional(),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticateClient(req)
  if (!auth.success) return auth.response
  const userId = auth.client.id

  const body = await req.json()
  const parsed = markReadSchema.safeParse(body)

  if (!parsed.success) {
    return apiBadRequest(parsed.error.errors[0].message)
  }

  const { notificationId, markAll } = parsed.data
  const now = new Date()

  if (notificationId) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    })

    if (!notification) {
      return apiBadRequest('Notification not found')
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: now },
    })
  } else if (markAll) {
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: now },
    })
  } else {
    return apiBadRequest('Provide notificationId or markAll')
  }

  return apiSuccess({ message: 'Notifications marked as read' })
})
