export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server'
import { withErrorHandling, apiSuccess, apiForbidden, apiBadRequest } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { ApiKeyService } from '@/lib/services/api-key.service'
import { AuditService } from '@/lib/services/audit.service'
import { getClientInfo } from '@/lib/validation'
import { ROLES } from '@/types/admin'

export const DELETE = withErrorHandling(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  if (auth.admin.role !== ROLES.SUPER_ADMIN) {
    return apiForbidden('Only super admins can manage API keys')
  }

  const id = context?.params?.id
  if (!id) return apiBadRequest('API key id is required')

  const key = await ApiKeyService.revoke(id)

  const { ipAddress, userAgent } = getClientInfo(req)
  await AuditService.log({
    adminId: auth.admin.id,
    action: 'revoke',
    entityType: 'api_key',
    entityId: id,
    newValues: { name: key.name },
    ipAddress,
    userAgent,
  })

  return apiSuccess({ revoked: true })
})
