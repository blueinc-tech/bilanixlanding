'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/components/admin/auth-provider'
import { StatCard, RecentUsersTable, ActivityFeed, ChartPlaceholder } from '@/components/admin/dashboard'

interface DashboardData {
  stats: {
    totalUsers: number
    activeUsers: number
    expiringSoon: number
    inactiveUsers: number
    totalSubscriptions: number
    activeSubscriptions: number
    monthlyRevenue: number
    newUsersThisMonth: number
  }
  recentUsers: {
    id: string
    name: string
    email: string
    company: string | null
    plan: string | null
    status: string
    createdAt: string
  }[]
  userGrowth: { label: string; value: number }[]
  revenueByMonth: { label: string; value: number }[]
  topPlans: { name: string; count: number; percentage: number }[]
}

export default function AdminPage() {
  const { admin } = useAdminAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard')
        const json = await res.json()
        if (json.success) {
          setData(json.data)
        }
      } catch {
        // Dashboard data unavailable
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border border-border bg-card" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
          <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
        </div>
      </div>
    )
  }

  const stats = data?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    expiringSoon: 0,
    inactiveUsers: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    newUsersThisMonth: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back{admin ? `, ${admin.name}` : ''}. Here&apos;s your admin overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={stats.newUsersThisMonth > 0 ? `+${stats.newUsersThisMonth} this month` : undefined}
          changeType="positive"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatCard
          label="Active Users"
          value={stats.activeUsers.toLocaleString()}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Expiring Soon"
          value={stats.expiringSoon.toLocaleString()}
          change={stats.expiringSoon > 0 ? `${stats.expiringSoon} within 14 days` : undefined}
          changeType={stats.expiringSoon > 0 ? 'negative' : 'neutral'}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Inactive Users"
          value={stats.inactiveUsers.toLocaleString()}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      {admin?.role === 'super_admin' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartPlaceholder
            title="User Growth"
            subtitle="New signups over the last 12 months"
            type="line"
          />
          <ChartPlaceholder
            title="Revenue"
            subtitle="Monthly recurring revenue"
            type="bar"
          />
        </div>
      )}

      {/* Recent Users + Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentUsersTable users={data?.recentUsers || []} />
        {admin?.role === 'super_admin' && <ActivityFeed activities={[]} />}
      </div>

      {/* Subscription Breakdown - Super Admin only */}
      {admin?.role === 'super_admin' && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Subscription Overview
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-semibold text-foreground">{stats.totalSubscriptions.toLocaleString()}</p>
              <p className="mt-1 text-sm text-muted-foreground">Total Subscriptions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-emerald-600">{stats.activeSubscriptions.toLocaleString()}</p>
              <p className="mt-1 text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-foreground">₦{stats.monthlyRevenue.toLocaleString()}</p>
              <p className="mt-1 text-sm text-muted-foreground">Monthly Revenue</p>
            </div>
          </div>
          {(!data?.topPlans || data.topPlans.length === 0) && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Plan breakdown will appear when subscriptions are active.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
