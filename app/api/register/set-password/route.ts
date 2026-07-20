import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiBadRequest } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

const setPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json()
  const parsed = setPasswordSchema.safeParse(body)

  if (!parsed.success) {
    return apiBadRequest(parsed.error.errors[0].message)
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })

  if (!user) {
    return apiBadRequest('No account found with this email. Please register first.')
  }

  if (user.passwordHash) {
    return apiBadRequest('Password already set. Please log in instead.')
  }

  if (user.status !== 'active' && user.status !== 'pending_payment') {
    return apiBadRequest('Your account is not available. Please contact support.')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  })

  return apiSuccess({ message: 'Password set successfully. You can now log in.' })
})
