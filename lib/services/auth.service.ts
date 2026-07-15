import crypto from 'crypto'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth-middleware'
import { UnauthorizedError, NotFoundError, ConflictError } from '@/lib/api-response'
import { ROLES, type RoleName } from '@/types/admin'

// ─── Auth Service ──────────────────────────────────────────────────

export const AuthService = {
  async validateCredentials(email: string, password: string) {
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        roleRel: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    })

    if (!admin) {
      throw new UnauthorizedError('Invalid email or password')
    }

    if (admin.status !== 'active') {
      throw new UnauthorizedError('Your account has been disabled. Contact a super admin.')
    }

    if (admin.deletedAt) {
      throw new UnauthorizedError('Your account has been deactivated')
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash)
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password')
    }

    return admin
  },

  async login(email: string, password: string, ipAddress?: string) {
    const admin = await this.validateCredentials(email, password)

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress || null,
      },
    })

    const token = signToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role as RoleName,
    })

    return {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
      },
    }
  },

  async createAdmin(data: {
    name: string
    email: string
    password: string
    role?: RoleName
  }) {
    const existing = await prisma.admin.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    })

    if (existing) {
      throw new ConflictError('An admin with this email already exists')
    }

    const passwordHash = await bcrypt.hash(data.password, 12)

    const admin = await prisma.admin.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role || ROLES.ADMIN,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    return admin
  },

  async changePassword(adminId: string, currentPassword: string, newPassword: string) {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } })
    if (!admin) throw new NotFoundError('Admin')

    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash)
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect')
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.admin.update({
      where: { id: adminId },
      data: { passwordHash },
    })

    return true
  },

  async createResetToken(adminId: string): Promise<string> {
    // Invalidate any existing tokens for this admin
    await prisma.passwordResetToken.deleteMany({
      where: { adminId, usedAt: null },
    })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, adminId, expiresAt },
    })

    return token
  },

  async validateResetToken(token: string) {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { admin: true },
    })

    if (!resetToken) throw new NotFoundError('Reset token')
    if (resetToken.usedAt) throw new UnauthorizedError('Token has already been used')
    if (resetToken.expiresAt < new Date()) throw new UnauthorizedError('Token has expired')

    return resetToken
  },

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.validateResetToken(token)

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.$transaction([
      prisma.admin.update({
        where: { id: resetToken.adminId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ])

    return true
  },

  async getAdminById(id: string) {
    const admin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!admin) throw new NotFoundError('Admin')
    return admin
  },
}
