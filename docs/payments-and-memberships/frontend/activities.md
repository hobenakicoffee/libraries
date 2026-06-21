# Activities

The activities table powers two distinct UI surfaces:

- **Public creator feed** — visible to anyone who visits a creator's page, showing who supported them.
- **Private notification list** — visible only to the logged-in user, showing their own sent gifts, received payments, and system notifications (e.g. membership expiry reminders).

The Activities page also has a **Weekly Pulse** panel (earnings, new followers,
active supporters, plus an AI coaching tip) — see
[Weekly Pulse Panel & Coaching Tip](../backend/activities.md#weekly-pulse-panel--coaching-tip)
in the backend docs for the RPCs and caching behavior behind it.

---

## Data shape

```ts
interface Activity {
  id: string
  transaction_id: string | null
  reference_id: string
  user_profile_id: string
  counterparty_profile_id: string | null
  role: 'creator' | 'supporter' | 'system'
  service_type: string
  metadata: ActivityMetadata
  visibility: 'public' | 'private'
  is_dismissed: boolean
  created_at: string
  updated_at: string
}

// Unified ActivityMetadata type - fields vary by activity_type and service_type
interface ActivityMetadata {
  // Common fields
  type?: string
  activity_type?: ActivityType
  service_type?: string
  message?: string

  // Financial fields
  amount?: number
  net_amount?: number
  platform_fee?: number
  price_at_purchase?: number

  // Supporter fields
  supporter_id?: string
  supporter_name?: string
  supporter_platform?: string
  supporter_anonymous?: boolean
  identity_hash?: string
  coffee_count?: number
  is_monthly?: boolean

  // Buyer/recipient fields
  buyer_name?: string
  buyer_platform?: string
  commission_type?: string

  // Follower fields
  follower_name?: string
  follower_username?: string
  action?: 'follow' | 'unfollow'

  // Post fields (coffee gifts, newsletter)
  source?: string
  post_id?: string
  post_slug?: string
  post_title?: string
  gift_message?: string

  // Membership fields
  plan_id?: string
  plan_name?: string
  billing_cycle?: string
  period_end?: string

  // Shop: category fields
  category_id?: string
  category_name?: string

  // Shop: product fields
  product_id?: string
  product_title?: string

  // Moderation fields
  rejection_reason?: string
  requester_name?: string
  grant_id?: string
}

type ActivityType =
  | 'category_approved'
  | 'category_rejected'
  | 'product_approved'
  | 'product_rejected'
  | 'post_gifted'
  | 'post_gift_sent'
  | 'post_approved'
  | 'post_rejected'

// Legacy shape interfaces for backward compatibility
interface GiftCreatorMetadata {
  type: 'gift'
  amount: number            // net amount (after platform fee)
  supporter_id: string
  supporter_anonymous: boolean
  coffee_count?: number
  message?: string
}

interface GiftSupporterMetadata {
  type: 'gift'
  amount: number            // gross amount
  supporter_id: string
  coffee_count?: number
  message?: string
}

interface MembershipExpiryMetadata {
  notification_type: '5_days' | '3_days' | '1_day' | 'expired' | '3_days_post' | '7_days_post'
  plan_name: string
  service_type: string
  period_end: string
  creator_name: string
  creator_username: string
  membership_id: string
}
```

---

## Public creator feed

This is visible to anonymous users. No authentication required.

```ts
interface FeedActivity extends Activity {
  counterparty: {
    display_name: string | null
    username: string | null
    avatar_url: string | null
  } | null
}

export async function fetchCreatorFeed(
  creatorProfileId: string,
  limit = 20,
  cursor?: string
) {
  let query = supabase
    .from('activities')
    .select(`
      id,
      reference_id,
      service_type,
      metadata,
      created_at,
      counterparty_profile_id,
      profiles!counterparty_profile_id (
        display_name,
        username,
        avatar_url
      )
    `)
    .eq('user_profile_id', creatorProfileId)
    .eq('visibility', 'public')
    .eq('role', 'creator')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}
```

---

## Private notification list

Only works for authenticated users — RLS handles scoping to the current user.

```ts
export async function fetchNotifications(
  limit = 20,
  cursor?: string,
  onlyUnread = false
) {
  let query = supabase
    .from('activities')
    .select('*')
    .eq('visibility', 'private')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  if (onlyUnread) {
    query = query.eq('is_dismissed', false)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Activity[]
}
```

### Unread notification count

```ts
export async function fetchUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('activities')
    .select('*', { count: 'exact', head: true })
    .eq('visibility', 'private')
    .eq('is_dismissed', false)

  if (error) throw error
  return count ?? 0
}
```

### Real-time unread count

```ts
useEffect(() => {
  const channel = supabase
    .channel('activities-unread')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activities',
        filter: `user_profile_id=eq.${userId}`,
      },
      () => {
        // A new activity arrived — re-fetch the count
        queryClient.invalidateQueries({ queryKey: ['unread-count'] })
      }
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [userId])
```

---

## Dismissing a notification

```ts
export async function dismissActivity(activityId: string) {
  const { error } = await supabase
    .from('activities')
    .update({ is_dismissed: true })
    .eq('id', activityId)

  if (error) throw error
}

export async function dismissAllNotifications() {
  const { error } = await supabase
    .from('activities')
    .update({ is_dismissed: true })
    .eq('visibility', 'private')
    .eq('is_dismissed', false)

  if (error) throw error
}
```

Note: you cannot set `is_dismissed` back to `false` — the database policy prevents this.

---

## Rendering activity items

```tsx
function ActivityItem({ activity }: { activity: Activity }) {
  const meta = activity.metadata as Record<string, unknown>

  if (activity.role === 'system') {
    return <MembershipExpiryNotification activity={activity} />
  }

  if (activity.service_type === 'gift') {
    return <GiftActivityItem activity={activity} meta={meta} />
  }

  if (activity.service_type === 'newsletter') {
    return <NewsletterActivityItem activity={activity} meta={meta} />
  }

  return <GenericActivityItem activity={activity} />
}

function GiftActivityItem({
  activity,
  meta,
}: {
  activity: Activity
  meta: Record<string, unknown>
}) {
  const isCreator = activity.role === 'creator'
  const amount = meta.amount as number
  const isAnonymous = meta.supporter_anonymous as boolean | undefined
  const message = meta.message as string | undefined

  return (
    <div className="flex gap-3 p-4">
      <div className="flex-1">
        <p>
          {isCreator
            ? isAnonymous
              ? 'Anonymous'
              : 'Someone'
            : 'You'}{' '}
          {isCreator ? 'gifted you' : 'gifted'} ৳{amount.toFixed(2)}
        </p>
        {message && <p className="text-sm text-gray-500 mt-1">"{message}"</p>}
        <p className="text-xs text-gray-400 mt-1">
          {new Date(activity.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

function MembershipExpiryNotification({ activity }: { activity: Activity }) {
  const meta = activity.metadata as MembershipExpiryMetadata
  const isExpired = ['expired', '3_days_post', '7_days_post'].includes(
    meta.notification_type
  )

  const messages: Record<string, string> = {
    '5_days': `Your ${meta.plan_name} membership expires in 5 days`,
    '3_days': `Your ${meta.plan_name} membership expires in 3 days`,
    '1_day':  `Your ${meta.plan_name} membership expires tomorrow`,
    expired:  `Your ${meta.plan_name} membership has expired`,
    '3_days_post': `Your ${meta.plan_name} membership expired 3 days ago`,
    '7_days_post': `Your ${meta.plan_name} membership expired 7 days ago`,
  }

  return (
    <div className={`p-4 rounded-lg ${isExpired ? 'bg-red-50' : 'bg-yellow-50'}`}>
      <p className="font-medium">{messages[meta.notification_type]}</p>
      <p className="text-sm text-gray-500">
        {meta.creator_name} · {meta.service_type}
      </p>
      <a href={`/@${meta.creator_username}`} className="text-sm text-blue-600 mt-2 block">
        Renew membership →
      </a>
    </div>
  )
}
```

---

## Filtering by service type

```ts
export async function fetchActivitiesByService(
  serviceType: string,
  limit = 20
) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('service_type', serviceType)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Activity[]
}
```
