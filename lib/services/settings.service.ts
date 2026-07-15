import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import type { SettingsGroup } from '@/types/admin'

// ─── Settings Service ──────────────────────────────────────────────

export interface SettingDefinition {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'json'
  defaultValue: unknown
  helpText?: string
}

// Default settings for each group
const DEFAULT_SETTINGS: Record<SettingsGroup, SettingDefinition[]> = {
  general: [
    { key: 'site_name', label: 'Site Name', type: 'string', defaultValue: 'Bilanix' },
    { key: 'site_url', label: 'Site URL', type: 'string', defaultValue: 'https://bilanix.com' },
    { key: 'support_email', label: 'Support Email', type: 'string', defaultValue: 'support@bilanix.com' },
  ],
  email: [
    { key: 'ses_region', label: 'AWS SES Region', type: 'string', defaultValue: 'us-east-1' },
    { key: 'ses_from_email', label: 'From Email', type: 'string', defaultValue: 'noreply@bilanix.com' },
    { key: 'ses_from_name', label: 'From Name', type: 'string', defaultValue: 'Bilanix' },
    { key: 'ses_enabled', label: 'SES Enabled', type: 'boolean', defaultValue: false },
  ],
  stripe: [
    { key: 'publishable_key', label: 'Publishable Key', type: 'string', defaultValue: '' },
    { key: 'secret_key', label: 'Secret Key', type: 'string', defaultValue: '' },
    { key: 'webhook_secret', label: 'Webhook Secret', type: 'string', defaultValue: '' },
    { key: 'enabled', label: 'Enable Stripe', type: 'boolean', defaultValue: false },
  ],
  paystack: [
    { key: 'public_key', label: 'Public Key', type: 'string', defaultValue: '' },
    { key: 'secret_key', label: 'Secret Key', type: 'string', defaultValue: '' },
    { key: 'webhook_secret', label: 'Webhook Secret', type: 'string', defaultValue: '' },
    { key: 'enabled', label: 'Enable Paystack', type: 'boolean', defaultValue: false },
  ],
  maintenance: [
    { key: 'enabled', label: 'Maintenance Mode', type: 'boolean', defaultValue: false },
    { key: 'title', label: 'Maintenance Title', type: 'string', defaultValue: 'We\'ll be back soon' },
    { key: 'message', label: 'Maintenance Message', type: 'string', defaultValue: 'We\'re performing scheduled maintenance. We\'ll be back shortly.' },
    { key: 'return_date', label: 'Estimated Return', type: 'string', defaultValue: '' },
    { key: 'contact_email', label: 'Contact Email', type: 'string', defaultValue: 'support@bilanix.com' },
    { key: 'whitelist_ips', label: 'Whitelisted IPs', type: 'json', defaultValue: [] },
  ],
  branding: [
    { key: 'logo_url', label: 'Logo URL', type: 'string', defaultValue: '/bilanix-logo-dark.png' },
    { key: 'primary_color', label: 'Primary Color', type: 'string', defaultValue: '#60B746' },
    { key: 'favicon_url', label: 'Favicon URL', type: 'string', defaultValue: '/favicon.svg' },
  ],
  features: [
    { key: 'maintenance_mode_enabled', label: 'Allow Maintenance Mode Toggle', type: 'boolean', defaultValue: true },
    { key: 'marketing_enabled', label: 'Marketing Module', type: 'boolean', defaultValue: true },
    { key: 'payments_enabled', label: 'Payments Module', type: 'boolean', defaultValue: true },
  ],
}

export const SettingsService = {
  async getGroup(group: SettingsGroup): Promise<Record<string, unknown>> {
    const settings = await prisma.systemSetting.findMany({
      where: { group },
    })

    const result: Record<string, unknown> = {}
    const defaults = DEFAULT_SETTINGS[group] || []

    // Start with defaults
    for (const def of defaults) {
      result[def.key] = def.defaultValue
    }

    // Override with database values
    for (const setting of settings) {
      result[setting.key] = setting.value
    }

    return result
  },

  async get(group: SettingsGroup, key: string): Promise<unknown> {
    const setting = await prisma.systemSetting.findUnique({
      where: { group_key: { group, key } },
    })

    if (setting) return setting.value

    // Fallback to default
    const defaults = DEFAULT_SETTINGS[group] || []
    const def = defaults.find((d) => d.key === key)
    return def?.defaultValue
  },

  async set(group: SettingsGroup, key: string, value: unknown) {
    const jsonValue = value as Prisma.InputJsonValue
    return prisma.systemSetting.upsert({
      where: { group_key: { group, key } },
      update: { value: jsonValue },
      create: {
        group,
        key,
        value: jsonValue,
        type: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string',
      },
    })
  },

  async setGroup(group: SettingsGroup, values: Record<string, unknown>) {
    const operations = Object.entries(values).map(([key, value]) => {
      const jsonValue = value as Prisma.InputJsonValue
      return prisma.systemSetting.upsert({
        where: { group_key: { group, key } },
        update: { value: jsonValue },
        create: {
          group,
          key,
          value: jsonValue,
          type: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string',
        },
      })
    })

    await prisma.$transaction(operations)
  },

  async isMaintenanceMode(): Promise<boolean> {
    const enabled = await this.get('maintenance', 'enabled')
    return enabled === true
  },

  async isGatewayEnabled(gateway: 'stripe' | 'paystack'): Promise<boolean> {
    const enabled = await this.get(gateway, 'enabled')
    return enabled === true
  },

  async getGatewayVisibility(): Promise<'stripe' | 'paystack' | 'both'> {
    const stripeEnabled = await this.isGatewayEnabled('stripe')
    const paystackEnabled = await this.isGatewayEnabled('paystack')

    if (stripeEnabled && paystackEnabled) return 'both'
    if (stripeEnabled) return 'stripe'
    return 'paystack'
  },

  async getSettingsDefinition(group: SettingsGroup): Promise<SettingDefinition[]> {
    return DEFAULT_SETTINGS[group] || []
  },

  async getAllGroups(): Promise<SettingsGroup[]> {
    return Object.keys(DEFAULT_SETTINGS) as SettingsGroup[]
  },
}
