import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { signClientToken } from '@/lib/client-auth'
import { UnauthorizedError, NotFoundError } from '@/lib/api-response'

// ─── Client Auth Service ──────────────────────────────────────────

export const ClientAuthService = {
  async validateClientCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      throw new UnauthorizedError('Invalid email or password')
    }

    if (user.status !== 'active' && user.status !== 'pending_payment') {
      throw new UnauthorizedError('Your account is not available. Please contact support.')
    }

    if (user.deletedAt) {
      throw new UnauthorizedError('Your account has been deactivated')
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password')
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password')
    }

    return user
  },

  async clientLogin(email: string, password: string, ipAddress?: string) {
    const user = await this.validateClientCredentials(email, password)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress || null,
      },
    })

    const token = signClientToken({
      userId: user.id,
      email: user.email,
    })

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        country: user.country,
        industry: user.industry,
        avatar: user.avatar,
        status: user.status,
      },
    }
  },

  async changeClientPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundError('User')

    if (!user.passwordHash) {
      throw new UnauthorizedError('No password set for this account')
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect')
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    return true
  },
}
