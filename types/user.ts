// ─── User (Client) Types ──────────────────────────────────────────

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PAST_DUE: 'past_due',
} as const

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS]

export const USER_SORT_FIELDS = {
  NAME: 'name',
  EMAIL: 'email',
  COMPANY: 'company',
  STATUS: 'status',
  CREATED_AT: 'createdAt',
  LAST_LOGIN_AT: 'lastLoginAt',
} as const

export type UserSortField = (typeof USER_SORT_FIELDS)[keyof typeof USER_SORT_FIELDS]

export const PLAN_NAMES = {
  BASIC: 'Basic',
  PREMIUM: 'Premium',
  ENTERPRISE: 'Enterprise',
} as const

export type PlanName = (typeof PLAN_NAMES)[keyof typeof PLAN_NAMES]

// ─── API Types ────────────────────────────────────────────────────

export interface UserListItem {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  avatar: string | null
  status: string
  createdAt: string
  lastLoginAt: string | null
  subscription: {
    planName: string
    status: string
  } | null
}

export interface UserDetail {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  avatar: string | null
  status: string
  emailVerified: string | null
  lastLoginAt: string | null
  lastLoginIp: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  subscriptions: {
    id: string
    planName: string
    status: string
    startDate: string
    endDate: string | null
    cancelledAt: string | null
    paymentMethod: string | null
    amount: number
    currency: string
  }[]
}

export interface UserListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  plan?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface BulkActionRequest {
  action: 'activate' | 'deactivate' | 'suspend' | 'delete'
  userIds: string[]
}
