# Creator Dashboard, Widgets & Social Lists

This page covers the memberships sidebar widget, the creator stats tab, and the following/followers dialogs.

---

## Memberships Sidebar Widget

Shows the current user's active memberships with creator info and total spend.

### Hook

```typescript
// hooks/use-memberships-widget.ts
import { useQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '@/lib/supabase'
import { feedQueryKeys } from '@/features/feed/query-keys'

export function useMembershipsWidget() {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: feedQueryKeys.membershipsWidget,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_my_memberships_widget')
      if (error) throw error
      return data
    },
  })
}
```

### Component

```tsx
// components/memberships-widget.tsx
import { useMembershipsWidget } from '@/features/feed/hooks/use-memberships-widget'
import { formatCurrency } from '@/lib/format'

export function MembershipsWidget() {
  const { data: memberships, isLoading } = useMembershipsWidget()

  if (isLoading) return <MembershipsWidgetSkeleton />

  return (
    <aside className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        My Memberships
      </h2>

      {memberships?.length === 0 && (
        <p className="text-sm text-muted-foreground">No active memberships.</p>
      )}

      {memberships?.map(m => (
        <div key={m.membership_id} className="flex items-center gap-3">
          <Avatar src={m.creator_avatar_url} alt={m.creator_display_name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{m.creator_display_name}</p>
            <p className="text-xs text-muted-foreground">
              {m.plan_name} · {m.billing_cycle}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-medium">৳{m.price_at_purchase}</p>
            <p className="text-xs text-muted-foreground">
              ৳{m.total_spend} spent
            </p>
          </div>
        </div>
      ))}
    </aside>
  )
}
```

---

## Recommended Creators Widget

```typescript
// hooks/use-recommended-creators.ts
export function useRecommendedCreators(limit = 5) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: [...feedQueryKeys.recommendedCreators, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_recommended_creators', {
        p_limit: limit,
      })
      if (error) throw error
      return data
    },
  })
}
```

Use `recommendation_reason` to show a contextual hint:

```tsx
const reasonLabel: Record<string, string> = {
  membership:   'You were a member',
  purchased:    'You bought from them',
  interactions: 'Based on your activity',
  popular:      'Popular creator',
}

<p className="text-xs text-muted-foreground">
  {reasonLabel[creator.recommendation_reason]}
</p>
```

---

## Creator Stats Tab

Only loaded when the creator tab is active.

### Hook

```typescript
// hooks/use-creator-stats.ts
import { useQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '@/lib/supabase'
import { feedQueryKeys } from '@/features/feed/query-keys'

export function useCreatorMembershipStats(enabled: boolean) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: feedQueryKeys.creatorStats,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_creator_membership_stats')
      if (error) throw error
      return data
    },
    enabled, // only fetch when creator tab is active
  })
}
```

### Stats Cards Layout

```tsx
// components/creator-stats-tab.tsx
import { useCreatorMembershipStats } from '@/features/feed/hooks/use-creator-stats'

export function CreatorStatsTab({ isActive }: { isActive: boolean }) {
  const { data: stats, isLoading } = useCreatorMembershipStats(isActive)

  if (isLoading) return <StatsTabSkeleton />
  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Membership KPI cards */}
      <section>
        <h3 className="text-sm font-semibold mb-3">Memberships</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Active Members" value={stats.active_members} />
          <StatCard label="Total Revenue" value={`৳${stats.total_revenue.toLocaleString()}`} />
          <StatCard label="This Month" value={`৳${stats.revenue_this_month.toLocaleString()}`} />
          <StatCard label="Churn This Month" value={stats.churn_this_month} />
        </div>
      </section>

      {/* Engagement cards */}
      <section>
        <h3 className="text-sm font-semibold mb-3">Feed Engagement</h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Impressions" value={stats.total_impressions.toLocaleString()} />
          <StatCard label="Likes" value={stats.total_likes.toLocaleString()} />
          <StatCard label="Comments" value={stats.total_comments.toLocaleString()} />
        </div>
      </section>

      {/* Boost stats */}
      <section>
        <h3 className="text-sm font-semibold mb-3">Boost</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Active Campaigns" value={stats.active_boosts} />
          <StatCard label="Total Boost Spend" value={`৳${stats.total_boost_spend.toLocaleString()}`} />
        </div>
      </section>

      {/* Top performing feed item */}
      {stats.top_feed_item && (
        <section>
          <h3 className="text-sm font-semibold mb-3">Top Post</h3>
          <TopFeedItemCard item={stats.top_feed_item} />
        </section>
      )}

      {/* Per-plan breakdown */}
      {stats.plan_breakdown?.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-3">Plan Breakdown</h3>
          <PlanBreakdownTable plans={stats.plan_breakdown} />
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  )
}
```

### Plan Breakdown Table

```tsx
function PlanBreakdownTable({ plans }: { plans: typeof stats.plan_breakdown }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Plan</th>
            <th className="px-3 py-2 text-right font-medium">Members</th>
            <th className="px-3 py-2 text-right font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {plans.map(plan => (
            <tr key={plan.plan_id}>
              <td className="px-3 py-2">
                <span className="font-medium">{plan.plan_name}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  ৳{plan.price}/{plan.billing_cycle}
                </span>
              </td>
              <td className="px-3 py-2 text-right">{plan.active_members}</td>
              <td className="px-3 py-2 text-right">৳{plan.total_revenue.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Following & Followers Lists

Both lists use the same pattern: a preview strip with avatars, a "See All" button that opens a full dialog with infinite scroll.

### Hook: Following

```typescript
// hooks/use-following.ts
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '@/lib/supabase'
import { feedQueryKeys } from '@/features/feed/query-keys'

export function useFollowing() {
  const supabase = useSupabaseClient()

  return useInfiniteQuery({
    queryKey: feedQueryKeys.following,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase.rpc('get_my_following', {
        p_limit: 20,
        p_cursor_id: pageParam ?? null,
      })
      if (error) throw error
      const items = data ?? []
      return {
        items,
        nextCursor: items.length === 20 ? items[items.length - 1].follow_id : null,
      }
    },
    initialPageParam: null as number | null,
    getNextPageParam: (page) => page.nextCursor,
    enabled: false, // lazy — only load when dialog opens
  })
}
```

Use the same pattern for `useFollowers` with `get_my_followers`.

### Following/Followers List Component

```tsx
// components/social-list-section.tsx
import { useState } from 'react'
import { useFollowing } from '@/features/feed/hooks/use-following'
import { useFollowers } from '@/features/feed/hooks/use-followers'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'

interface SocialListSectionProps {
  type: 'following' | 'followers'
}

export function SocialListSection({ type }: SocialListSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const hook = type === 'following' ? useFollowing : useFollowers
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = hook()

  const sentinelRef = useInfiniteScroll({
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  })

  const handleOpenDialog = () => {
    setDialogOpen(true)
    refetch()
  }

  const allItems = data?.pages.flatMap(p => p.items) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">
          {type === 'following' ? 'Following' : 'Followers'}
        </h3>
        <button
          onClick={handleOpenDialog}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          See All →
        </button>
      </div>

      {/* Avatar preview strip */}
      <div className="flex -space-x-2">
        {allItems.slice(0, 6).map(item => {
          const profile = type === 'following'
            ? { id: item.creator_profile_id, avatar: item.creator_avatar_url, name: item.creator_display_name }
            : { id: item.follower_profile_id, avatar: item.follower_avatar_url, name: item.follower_display_name }

          return (
            <Avatar
              key={profile.id}
              src={profile.avatar}
              alt={profile.name}
              size="sm"
              className="ring-2 ring-background"
            />
          )
        })}
      </div>

      {/* Full list dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{type === 'following' ? 'Following' : 'Followers'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {allItems.map(item => {
              const profile = type === 'following'
                ? {
                    id: item.creator_profile_id,
                    username: item.creator_username,
                    displayName: item.creator_display_name,
                    avatarUrl: item.creator_avatar_url,
                  }
                : {
                    id: item.follower_profile_id,
                    username: item.follower_username,
                    displayName: item.follower_display_name,
                    avatarUrl: item.follower_avatar_url,
                  }

              return (
                <div key={profile.id} className="flex items-center gap-3">
                  <Avatar src={profile.avatarUrl} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{profile.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{profile.username}</p>
                  </div>
                </div>
              )
            })}

            <InfiniteScrollSentinel ref={sentinelRef} isLoading={isFetchingNextPage} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

---

## Tab Switching

Wire everything together with `nuqs` for URL persistence:

```tsx
// pages/memberships-hub.tsx
import { useQueryState } from 'nuqs'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FeedList } from '@/features/feed/components/feed-list'
import { CreatorStatsTab } from '@/features/feed/components/creator-stats-tab'
import { MembershipsWidget } from '@/features/feed/components/memberships-widget'
import { RecommendedCreators } from '@/features/feed/components/recommended-creators'
import { SocialListSection } from '@/features/feed/components/social-list-section'

export function MembershipsHubPage() {
  const [tab, setTab] = useQueryState('tab', {
    defaultValue: 'user',
    parse: (v) => v === 'creator' ? 'creator' : 'user',
  })

  return (
    <div className="container py-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="user">My Feed</TabsTrigger>
          <TabsTrigger value="creator">My Memberships</TabsTrigger>
        </TabsList>

        <div className="mt-6 flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <TabsContent value="user">
              <FeedList />
              <div className="mt-8 space-y-6">
                <SocialListSection type="following" />
                <SocialListSection type="followers" />
              </div>
            </TabsContent>

            <TabsContent value="creator">
              <CreatorStatsTab isActive={tab === 'creator'} />
            </TabsContent>
          </div>

          {/* Sidebar — always visible */}
          <aside className="w-72 shrink-0 space-y-6">
            <MembershipsWidget />
            <RecommendedCreators />
          </aside>
        </div>
      </Tabs>
    </div>
  )
}
```
