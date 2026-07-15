// ─── Admin Roles & Permissions ─────────────────────────────────────

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SUPPORT: 'support',
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_DISPLAY_NAMES: Record<RoleName, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.SUPPORT]: 'Support',
}

// ─── Permissions ───────────────────────────────────────────────────

export const MODULES = {
  DASHBOARD: 'dashboard',
  CLIENTS: 'clients',
  MARKETING: 'marketing',
  PAYMENTS: 'payments',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
  ACTIVITY: 'activity',
  AUDIT: 'audit',
  ADMINS: 'admins',
  MAINTENANCE: 'maintenance',
} as const

export const ACTIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
  SEND: 'send',
  MANAGE: 'manage',
} as const

export type ModuleName = (typeof MODULES)[keyof typeof MODULES]
export type ActionName = (typeof ACTIONS)[keyof typeof ACTIONS]

export interface PermissionDefinition {
  name: string
  module: ModuleName
  action: ActionName
  description: string
}

// Generate all permissions dynamically
export function generatePermissions(): PermissionDefinition[] {
  const permissions: PermissionDefinition[] = []

  for (const mod of Object.values(MODULES)) {
    for (const act of Object.values(ACTIONS)) {
      const name = `${mod}:${act}`
      permissions.push({
        name,
        module: mod,
        action: act,
        description: `${act.charAt(0).toUpperCase() + act.slice(1)} ${mod}`,
      })
    }
  }

  return permissions
}

// Role → Permission mapping
export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(MODULES).flatMap((m) =>
    Object.values(ACTIONS).map((a) => `${m}:${a}`)
  ),
  [ROLES.ADMIN]: [
    ...Object.values(MODULES).filter((m) => m !== MODULES.ADMINS && m !== MODULES.MAINTENANCE).flatMap((m) =>
      Object.values(ACTIONS).map((a) => `${m}:${a}`)
    ),
  ],
  [ROLES.SUPPORT]: [
    `${MODULES.DASHBOARD}:${ACTIONS.READ}`,
    `${MODULES.CLIENTS}:${ACTIONS.READ}`,
    `${MODULES.NOTIFICATIONS}:${ACTIONS.READ}`,
    `${MODULES.ACTIVITY}:${ACTIONS.READ}`,
    `${MODULES.AUDIT}:${ACTIONS.READ}`,
  ],
}

// ─── Admin Status ──────────────────────────────────────────────────

export const ADMIN_STATUS = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
} as const

export type AdminStatus = (typeof ADMIN_STATUS)[keyof typeof ADMIN_STATUS]

// ─── Notification Types ────────────────────────────────────────────

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]

// ─── Email Status ──────────────────────────────────────────────────

export const EMAIL_STATUS = {
  QUEUED: 'queued',
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
} as const

export type EmailStatus = (typeof EMAIL_STATUS)[keyof typeof EMAIL_STATUS]

// ─── Email Templates ───────────────────────────────────────────────

export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  PASSWORD_CHANGED: 'password_changed',
  ACCOUNT_CREATED: 'account_created',
  SUBSCRIPTION_ACTIVATED: 'subscription_activated',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',
  SUBSCRIPTION_EXPIRING_SOON: 'subscription_expiring_soon',
} as const

export type EmailTemplateId = (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES]

// ─── Activity Actions ──────────────────────────────────────────────

export const ACTIVITY_ACTIONS = {
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  PASSWORD_RESET_REQUEST: 'auth.password_reset_request',
  PASSWORD_RESET_COMPLETE: 'auth.password_reset_complete',
  PASSWORD_CHANGE: 'auth.password_change',
  CLIENT_VIEW: 'clients.view',
  CLIENT_CREATE: 'clients.create',
  CLIENT_UPDATE: 'clients.update',
  CLIENT_DELETE: 'clients.delete',
  CLIENT_EXPORT: 'clients.export',
  CAMPAIGN_CREATE: 'campaigns.create',
  CAMPAIGN_SEND: 'campaigns.send',
  PLAN_UPDATE: 'plans.update',
  GATEWAY_UPDATE: 'gateways.update',
  SETTINGS_UPDATE: 'settings.update',
  MAINTENANCE_TOGGLE: 'maintenance.toggle',
  ADMIN_CREATE: 'admins.create',
  ADMIN_UPDATE: 'admins.update',
  ADMIN_DISABLE: 'admins.disable',
  ADMIN_DELETE: 'admins.delete',
} as const

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS]

// ─── Settings Groups ───────────────────────────────────────────────

export const SETTINGS_GROUPS = {
  GENERAL: 'general',
  EMAIL: 'email',
  STRIPE: 'stripe',
  PAYSTACK: 'paystack',
  MAINTENANCE: 'maintenance',
  BRANDING: 'branding',
  FEATURES: 'features',
} as const

export type SettingsGroup = (typeof SETTINGS_GROUPS)[keyof typeof SETTINGS_GROUPS]
