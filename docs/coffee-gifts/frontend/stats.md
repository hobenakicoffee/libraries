# Stats & Analytics

The coffee gifts service exposes two analytics RPCs that power dashboard cards. Both return aggregate numbers with period-over-period change percentages.

::: warning Backend Proxy Required
These RPCs are `SECURITY DEFINER` and take a profile ID as a parameter — your backend must validate that the requesting user is allowed to view the stats before calling them. Never expose these to the browser directly.
:::

---

## Creator Dashboard Stats

Call `get_creator_coffee_gifts_stats` to populate the creator analytics dashboard.

### Backend API Route

```typescript
// GET /api/creators/[creatorId]/stats?from=2026-04-01&to=2026-04-30
export async function GET(
  req: Request,
  { params }: { params: { creatorId: string } }
) {
  const session = await getSession(req)

  // Validate: only the creator themselves can view their own stats
  if (session?.user?.id !== params.creatorId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const fromDate = url.searchParams.get('from') ?? getDefaultFromDate()
  const toDate   = url.searchParams.get('to')   ?? getDefaultToDate()

  const { data, error } = await supabaseAdmin.rpc(
    'get_creator_coffee_gifts_stats',
    {
      p_creator_profile_id: params.creatorId,
      p_from_date: fromDate,
      p_to_date:   toDate,
    }
  )

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data[0])
}
```

### Frontend Fetch Hook

```typescript
// hooks/useCreatorGiftStats.ts
import { useState, useEffect } from 'react'

interface CreatorGiftStats {
  total_earnings:           number
  total_earnings_change:    number
  total_coffees:            number
  total_coffees_change:     number
  unique_supporters:        number
  unique_supporters_change: number
}

export function useCreatorGiftStats(
  creatorId: string,
  fromDate: string,
  toDate: string
) {
  const [stats, setStats] = useState<CreatorGiftStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/creators/${creatorId}/stats?from=${fromDate}&to=${toDate}`)
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [creatorId, fromDate, toDate])

  return { stats, loading, error }
}
```

### Rendering the Stats Cards

```tsx
// components/CreatorStatsCards.tsx
interface StatCardProps {
  label: string
  value: string
  change: number
  icon: string
}

function StatCard({ label, value, change, icon }: StatCardProps) {
  const isPositive = change > 0
  const isNeutral  = change === 0

  return (
    <div className="rounded-xl border p-5 space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <div className={`text-sm flex items-center gap-1 ${
        isNeutral  ? 'text-gray-400' :
        isPositive ? 'text-green-600' :
                     'text-red-500'
      }`}>
        <span>{isPositive ? '↑' : isNeutral ? '→' : '↓'}</span>
        <span>{Math.abs(change)}% vs last period</span>
      </div>
    </div>
  )
}

interface CreatorStatsCardsProps {
  creatorId: string
  fromDate: string
  toDate: string
}

export function CreatorStatsCards({
  creatorId,
  fromDate,
  toDate,
}: CreatorStatsCardsProps) {
  const { stats, loading } = useCreatorGiftStats(creatorId, fromDate, toDate)

  if (loading) return <StatsCardSkeleton count={3} />
  if (!stats)  return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label="Total Earnings"
        value={`৳${stats.total_earnings.toLocaleString()}`}
        change={stats.total_earnings_change}
        icon="💰"
      />
      <StatCard
        label="Coffees Received"
        value={stats.total_coffees.toLocaleString()}
        change={stats.total_coffees_change}
        icon="☕"
      />
      <StatCard
        label="Unique Supporters"
        value={stats.unique_supporters.toLocaleString()}
        change={stats.unique_supporters_change}
        icon="🤝"
      />
    </div>
  )
}
```

---

## Supporter Dashboard Stats

Call `get_supporter_coffee_gifts_stats` to show a supporter how much they've given.

### Backend API Route

```typescript
// GET /api/supporters/stats?from=2026-04-01&to=2026-04-30
export async function GET(req: Request) {
  const session = await getSession(req)

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const fromDate = url.searchParams.get('from') ?? getDefaultFromDate()
  const toDate   = url.searchParams.get('to')   ?? getDefaultToDate()

  const { data, error } = await supabaseAdmin.rpc(
    'get_supporter_coffee_gifts_stats',
    {
      p_supporter_profile_id: session.user.id,
      p_from_date: fromDate,
      p_to_date:   toDate,
    }
  )

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data[0])
}
```

### Frontend Fetch Hook

```typescript
interface SupporterGiftStats {
  total_spent:        number
  coffees_gifted:     number
  creators_supported: number
}

export function useSupporterGiftStats(fromDate: string, toDate: string) {
  const [stats, setStats] = useState<SupporterGiftStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/supporters/stats?from=${fromDate}&to=${toDate}`)
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false) })
  }, [fromDate, toDate])

  return { stats, loading }
}
```

### Rendering

```tsx
export function SupporterStatsCards({ fromDate, toDate }: { fromDate: string; toDate: string }) {
  const { stats, loading } = useSupporterGiftStats(fromDate, toDate)

  if (loading) return <StatsCardSkeleton count={3} />
  if (!stats)  return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="stat-card">
        <p className="label">Total Spent</p>
        <p className="value">৳{stats.total_spent.toLocaleString()}</p>
      </div>
      <div className="stat-card">
        <p className="label">Coffees Gifted</p>
        <p className="value">☕ {stats.coffees_gifted}</p>
      </div>
      <div className="stat-card">
        <p className="label">Creators Supported</p>
        <p className="value">{stats.creators_supported}</p>
      </div>
    </div>
  )
}
```

---

## Date Range Picker

Both stats RPCs accept a `from` and `to` date. Here's a simple preset picker:

```typescript
type Preset = '7d' | '30d' | '90d' | 'custom'

function getDateRange(preset: Preset): { from: string; to: string } {
  const now   = new Date()
  const today = now.toISOString().split('T')[0]

  const daysAgo = (n: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() - n)
    return d.toISOString().split('T')[0]
  }

  switch (preset) {
    case '7d':  return { from: daysAgo(7),  to: today }
    case '30d': return { from: daysAgo(30), to: today }
    case '90d': return { from: daysAgo(90), to: today }
    default:    return { from: daysAgo(30), to: today }
  }
}

// Usage in a component
const [preset, setPreset] = useState<Preset>('30d')
const { from, to } = getDateRange(preset)
```

---

## Change Percentage Display Tips

The backend returns the percentage change as a `numeric` value. Some edge cases to handle:

| Value | Meaning | How to Display |
|---|---|---|
| `0` | No change (or both periods were zero) | "No change" or `→ 0%` |
| `100` | Previous period was zero, now has activity | `↑ New` |
| Positive (e.g. `14.29`) | Growth | `↑ 14.29%` |
| Negative (e.g. `-8.5`) | Decline | `↓ 8.5%` |

```typescript
function formatChange(change: number): string {
  if (change === 0)   return '→ No change'
  if (change === 100) return '↑ New this period'
  return change > 0
    ? `↑ ${change.toFixed(1)}%`
    : `↓ ${Math.abs(change).toFixed(1)}%`
}
```
