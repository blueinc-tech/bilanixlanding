export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess, apiCreated, apiForbidden } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { ApiKeyService } from '@/lib/services/api-key.service'
import { AuditService } from '@/lib/services/audit.service'
import { parseBody, getClientInfo } from '@/lib/validation'
import { ROLES } from '@/types/admin'

// API keys grant read access to every client's subscription status and
// contact details, so key management is restricted to super admins —
// same restriction as the Admins module.

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  if (auth.admin.role !== ROLES.SUPER_ADMIN) {
    return apiForbidden('Only super admins can manage API keys')
  }

  const keys = await ApiKeyService.list()
  return apiSuccess(keys)
})

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  if (auth.admin.role !== ROLES.SUPER_ADMIN) {
    return apiForbidden('Only super admins can manage API keys')
  }

  const parsed = await parseBody(req, createSchema)
  if (!parsed.success) return parsed.response

  const key = await ApiKeyService.create(parsed.data.name, auth.admin.id)

  const { ipAddress, userAgent } = getClientInfo(req)
  await AuditService.log({
    adminId: auth.admin.id,
    action: 'create',
    entityType: 'api_key',
    entityId: key.id,
    newValues: { name: key.name, keyId: key.keyId },
    ipAddress,
    userAgent,
  })

  // secret is included here only — never returned again after this response
  return apiCreated(key)
})
