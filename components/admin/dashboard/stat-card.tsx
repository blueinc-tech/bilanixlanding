'use client'

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
}

export function StatCard({ label, value, change, changeType = 'neutral', icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent/50">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {change && (
        <div className="mt-1 flex items-center gap-1">
          <span
            className={`text-xs font-medium ${
              changeType === 'positive'
                ? 'text-emerald-600'
                : changeType === 'negative'
                ? 'text-red-600'
                : 'text-muted-foreground'
            }`}
          >
            {change}
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  )
}
