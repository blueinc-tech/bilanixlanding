import { NextRequest } from 'next/server'
import { z } from 'zod'
import { withErrorHandling, apiSuccess } from '@/lib/api-response'
import { authenticate } from '@/lib/auth-middleware'
import { SettingsService } from '@/lib/services/settings.service'
import { parseBody } from '@/lib/validation'
import { getClientInfo } from '@/lib/validation'
import { ActivityService } from '@/lib/services/activity.service'
import { AuditService } from '@/lib/services/audit.service'

const GROUPS = ['general', 'email', 'stripe', 'paystack', 'maintenance', 'branding', 'features'] as const

export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const url = new URL(req.url)
  const group = url.searchParams.get('group')

  if (group && GROUPS.includes(group as typeof GROUPS[number])) {
    const settings = await SettingsService.getGroup(group as typeof GROUPS[number])
    const definition = await SettingsService.getSettingsDefinition(group as typeof GROUPS[number])
    return apiSuccess({ group, settings, definition })
  }

  const allSettings: Record<string, unknown> = {}
  for (const g of GROUPS) {
    allSettings[g] = await SettingsService.getGroup(g)
  }
  return apiSuccess({ groups: GROUPS, settings: allSettings })
})

const updateSchema = z.object({
  group: z.enum([...GROUPS] as [string, ...string[]]),
  values: z.record(z.unknown()),
})

export const PUT = withErrorHandling(async (req: NextRequest) => {
  const auth = await authenticate(req)
  if (!auth.success) return auth.response

  const oldSettings = await SettingsService.getGroup('general')

  const parsed = await parseBody(req, updateSchema)
  if (!parsed.success) return parsed.response

  await SettingsService.setGroup(parsed.data.group as Parameters<typeof SettingsService.setGroup>[0], parsed.data.values)

  const { ipAddress, userAgent } = getClientInfo(req)

  await ActivityService.log({
    adminId: auth.admin.id,
    action: 'settings.update',
    entityType: 'setting',
    entityId: parsed.data.group,
    description: `Updated ${parsed.data.group} settings`,
    metadata: { keys: Object.keys(parsed.data.values) },
    ipAddress,
    userAgent,
  })

  await AuditService.log({
    adminId: auth.admin.id,
    action: 'update',
    entityType: 'setting',
    entityId: parsed.data.group,
    oldValues: oldSettings as Record<string, unknown>,
    newValues: parsed.data.values as Record<string, unknown>,
    ipAddress,
    userAgent,
  })

  return apiSuccess({ updated: true })
})
