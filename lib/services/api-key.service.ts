import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { NotFoundError } from '@/lib/api-response'

// ─── External API Key Service (app.bilanix.com integration) ───────
// Key ID is a non-secret identifier (safe to display/log).
// Secret is only ever returned once, at creation time, then stored as a bcrypt hash.

function generateKeyId() {
  return `blx_${crypto.randomBytes(12).toString('hex')}`
}

function generateSecret() {
  return crypto.randomBytes(32).toString('hex')
}

export const ApiKeyService = {
  async list() {
    return prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyId: true,
        lastUsedAt: true,
        revokedAt: true,
        createdAt: true,
        admin: { select: { id: true, name: true } },
      },
    })
  },

  async create(name: string, adminId: string) {
    const keyId = generateKeyId()
    const secret = generateSecret()
    const secretHash = await bcrypt.hash(secret, 12)

    const key = await prisma.apiKey.create({
      data: { name: name.trim(), keyId, secretHash, createdBy: adminId },
    })

    return { id: key.id, name: key.name, keyId: key.keyId, secret, createdAt: key.createdAt }
  },

  async revoke(id: string) {
    const key = await prisma.apiKey.findUnique({ where: { id } })
    if (!key) throw new NotFoundError('API key')
    if (key.revokedAt) return key
    return prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } })
  },

  async verify(keyId: string, secret: string): Promise<boolean> {
    if (!keyId || !secret) return false

    const key = await prisma.apiKey.findUnique({ where: { keyId } })
    if (!key || key.revokedAt) return false

    const valid = await bcrypt.compare(secret, key.secretHash)
    if (!valid) return false

    prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } }).catch(() => {})

    return true
  },
}
