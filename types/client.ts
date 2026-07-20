export interface ClientUser {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  country: string | null
  industry: string | null
  address: string | null
  avatar: string | null
  status: string
  createdAt: string
}

export interface ClientSubscription {
  id: string
  planName: string
  status: string
  amount: number
  currency: string
  startDate: string
  endDate: string | null
  cancelledAt: string | null
  paymentMethod: string | null
}

export interface ClientPayment {
  id: string
  planSlug: string | null
  gateway: string | null
  amount: number
  currency: string
  status: string
  description: string | null
  paidAt: string | null
  createdAt: string
}

export interface ClientSupportTicket {
  id: string
  subject: string
  message: string | null
  category: string
  priority: string
  status: string
  reply: string | null
  createdAt: string
  updatedAt: string
}

export interface ClientNotification {
  id: string
  title: string
  message: string
  type: string
  readAt: string | null
  actionUrl: string | null
  createdAt: string
}

export interface ClientDashboardData {
  user: ClientUser
  subscription: ClientSubscription | null
  stats: {
    totalPayments: number
    successfulPayments: number
    totalSpent: number
    daysRemaining: number | null
  }
  recentPayments: ClientPayment[]
  recentNotifications: ClientNotification[]
  recentTickets: ClientSupportTicket[]
}
