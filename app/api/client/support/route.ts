import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiBadRequest } from '@/lib/api-response'
import { authenticateClient } from '@/lib/client-auth'
import { prisma } from '@/lib/db'

const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  category: z.string().default('general'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticateClient(req)
  if (!auth.success) return auth.response
  const userId = auth.client.id

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
  const status = searchParams.get('status') || undefined
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { userId, source: 'client_dashboard' }
  if (status) {
    where.status = status
  }

  const [tickets, total] = await Promise.all([
    prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.contactSubmission.count({ where }),
  ])

  return apiSuccess(tickets, 200, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticateClient(req)
  if (!auth.success) return auth.response

  const body = await req.json()
  const parsed = createTicketSchema.safeParse(body)

  if (!parsed.success) {
    return apiBadRequest(parsed.error.errors[0].message)
  }

  const { subject, message, category, priority } = parsed.data

  const nameParts = auth.client.name.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || '.'

  const ticket = await prisma.contactSubmission.create({
    data: {
      firstName,
      lastName,
      email: auth.client.email,
      userId: auth.client.id,
      source: 'client_dashboard',
      status: 'new',
      message: `[${subject}] ${message}`,
      category,
      priority,
      inquiryType: 'support',
    },
  })

  return apiSuccess(ticket, 201)
})
