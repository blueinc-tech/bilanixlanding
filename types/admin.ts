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
  SUBMISSIONS: 'submissions',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  ADMINS: 'admins',
  ACTIVITY: 'activity',
  AUDIT: 'audit',
  MAINTENANCE: 'maintenance',
  REPORTS: 'reports',
  ANALYTICS: 'analytics',
  SUPPORT: 'support',
  PROFILE: 'profile',
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

// Role → Permission mapping (static fallback)
export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(MODULES).flatMap((m) =>
    Object.values(ACTIONS).map((a) => `${m}:${a}`)
  ),
  [ROLES.ADMIN]: [],  // Admins start with no permissions — assigned individually
  [ROLES.SUPPORT]: [
    `${MODULES.DASHBOARD}:${ACTIONS.READ}`,
    `${MODULES.CLIENTS}:${ACTIONS.READ}`,
    `${MODULES.NOTIFICATIONS}:${ACTIONS.READ}`,
    `${MODULES.ACTIVITY}:${ACTIONS.READ}`,
    `${MODULES.AUDIT}:${ACTIONS.READ}`,
  ],
}

// ─── Restricted Modules (Super Admin only) ─────────────────────────

export const RESTRICTED_MODULES: ModuleName[] = [
  MODULES.ADMINS,
  MODULES.MAINTENANCE,
  MODULES.AUDIT,
  MODULES.ACTIVITY,
]

// Modules that can be assigned to normal Admins
export const ASSIGNABLE_MODULES: ModuleName[] = [
  MODULES.DASHBOARD,
  MODULES.CLIENTS,
  MODULES.MARKETING,
  MODULES.PAYMENTS,
  MODULES.SUBMISSIONS,
  MODULES.NOTIFICATIONS,
  MODULES.SETTINGS,
  MODULES.REPORTS,
  MODULES.ANALYTICS,
  MODULES.SUPPORT,
  MODULES.PROFILE,
]

// Payment sub-permissions: normal admins can ONLY see history/plans, never gateway settings
export const PAYMENT_READONLY_ACTIONS: ActionName[] = [ACTIONS.READ, ACTIONS.EXPORT]

// ─── Sidebar Config ────────────────────────────────────────────────

export interface SidebarItem {
  label: string
  href: string
  module: ModuleName
  icon: string
  superAdminOnly?: boolean
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    module: MODULES.DASHBOARD,
    icon: 'dashboard',
  },
  {
    label: 'Clients',
    href: '/admin/clients',
    module: MODULES.CLIENTS,
    icon: 'clients',
  },
  {
    label: 'Submissions',
    href: '/admin/submissions',
    module: MODULES.SUBMISSIONS,
    icon: 'submissions',
  },
  {
    label: 'Marketing',
    href: '/admin/marketing',
    module: MODULES.MARKETING,
    icon: 'marketing',
  },
  {
    label: 'Payments',
    href: '/admin/payments',
    module: MODULES.PAYMENTS,
    icon: 'payments',
  },
  {
    label: 'Notifications',
    href: '/admin/notifications',
    module: MODULES.NOTIFICATIONS,
    icon: 'notifications',
  },
  {
    label: 'Activity',
    href: '/admin/activity',
    module: MODULES.ACTIVITY,
    icon: 'activity',
    superAdminOnly: true,
  },
  {
    label: 'Audit',
    href: '/admin/audit',
    module: MODULES.AUDIT,
    icon: 'audit',
    superAdminOnly: true,
  },
  {
    label: 'Admins',
    href: '/admin/admins',
    module: MODULES.ADMINS,
    icon: 'admins',
    superAdminOnly: true,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    module: MODULES.SETTINGS,
    icon: 'settings',
  },
]

// ─── Admin Status ──────────────────────────────────────────────────

export const ADMIN_STATUS = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  SUSPENDED: 'suspended',
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
  ADMIN_WELCOME: 'admin_welcome',
  PAYMENT_RECEIPT: 'payment_receipt',
  REGISTRATION_WELCOME: 'registration_welcome',
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
  CLIENT_REGISTER: 'clients.register',
  CAMPAIGN_CREATE: 'campaigns.create',
  CAMPAIGN_SEND: 'campaigns.send',
  PLAN_CREATE: 'plans.create',
  PLAN_UPDATE: 'plans.update',
  PLAN_DELETE: 'plans.delete',
  GATEWAY_UPDATE: 'gateways.update',
  SETTINGS_UPDATE: 'settings.update',
  MAINTENANCE_TOGGLE: 'maintenance.toggle',
  ADMIN_CREATE: 'admins.create',
  ADMIN_UPDATE: 'admins.update',
  ADMIN_DISABLE: 'admins.disable',
  ADMIN_DELETE: 'admins.delete',
  PERMISSION_CHANGE: 'admins.permission_change',
  ROLE_CHANGE: 'admins.role_change',
  PAYMENT_STARTED: 'payments.started',
  PAYMENT_SUCCESS: 'payments.success',
  PAYMENT_FAILED: 'payments.failed',
  SUBSCRIPTION_ACTIVATE: 'subscriptions.activate',
  SUBSCRIPTION_CANCEL: 'subscriptions.cancel',
  CHECKOUT_START: 'checkout.start',
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

// ─── Helper: Check if module requires super admin ──────────────────

export function isRestrictedModule(module: ModuleName): boolean {
  return RESTRICTED_MODULES.includes(module)
}

// ─── Helper: Get assignable module permissions ─────────────────────

export function getModulePermissions(module: ModuleName): string[] {
  if (module === MODULES.PAYMENTS) {
    return PAYMENT_READONLY_ACTIONS.map((a) => `${module}:${a}`)
  }
  return Object.values(ACTIONS).map((a) => `${module}:${a}`)
}
