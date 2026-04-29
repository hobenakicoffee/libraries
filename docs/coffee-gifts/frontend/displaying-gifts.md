# Displaying Coffee Gifts

This page covers how to fetch and render coffee gift data — from a creator's public gift feed to a supporter's personal gift history.

## Reading Gift Data Directly from Supabase

Gift data is public. You can query the `coffee_gifts` table directly from the browser using the anon key. No backend proxy is needed for reads.

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## TypeScript Type

Define a type for the data shape you'll receive:

```typescript
interface CoffeeGift {
  id: string
  creator_profile_id: string
  supporter_profile_id: string | null   // null = anonymous
  supporter_name: string | null
  supporter_platform: string | null
  supporter_identity_hash: string | null
  message: string | null
  coffee_count: number
  is_monthly: boolean
  transaction_reference_id: string
  created_at: string
  updated_at: string
}
```

---

## Creator's Gift Feed (Public)

Fetch all gifts received by a specific creator, ordered newest first:

```typescript
async function getCreatorGiftFeed(
  creatorId: string,
  limit = 20,
  cursor?: string        // last gift's created_at for pagination
): Promise<CoffeeGift[]> {
  let query = supabase
    .from('coffee_gifts')
    .select(`
      id,
      supporter_name,
      supporter_platform,
      supporter_profile_id,
      message,
      coffee_count,
      is_monthly,
      created_at
    `)
    .eq('creator_profile_id', creatorId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}
```

### Cursor Pagination

The database has a composite index `(creator_profile_id, created_at DESC)` that makes this query very efficient. Use cursor-based pagination rather than offset:

```typescript
// First page
const firstPage = await getCreatorGiftFeed(creatorId)

// Next page: pass the last item's created_at as the cursor
const lastItem = firstPage[firstPage.length - 1]
const nextPage = await getCreatorGiftFeed(creatorId, 20, lastItem.created_at)

// Has more? If the returned array length < limit, you're on the last page
const hasMore = firstPage.length === 20
```

---

## Supporter's Gift History (Authenticated)

A logged-in supporter can view their own gift history. Because `supporter_profile_id` is indexed, this query is efficient too:

```typescript
async function getSupporterGiftHistory(
  supporterProfileId: string,
  limit = 20,
  cursor?: string
): Promise<CoffeeGift[]> {
  let query = supabase
    .from('coffee_gifts')
    .select(`
      id,
      creator_profile_id,
      message,
      coffee_count,
      is_monthly,
      created_at
    `)
    .eq('supporter_profile_id', supporterProfileId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}
```

::: info
Only authenticated users can view their own gift history this way, because the RLS on `coffee_gifts` uses `auth.uid()` to validate the session. If you call this without a valid session token, you'll still get all public gifts — the `for authenticated` policy uses `true` in the `USING` clause, so it doesn't restrict visibility further.
:::

---

## Filtering Options

### Monthly gifts only

```typescript
const { data } = await supabase
  .from('coffee_gifts')
  .select('*')
  .eq('creator_profile_id', creatorId)
  .eq('is_monthly', true)
  .order('created_at', { ascending: false })
```

### Gifts from a specific supporter

```typescript
const { data } = await supabase
  .from('coffee_gifts')
  .select('*')
  .eq('creator_profile_id', creatorId)
  .eq('supporter_profile_id', supporterUserId)
  .order('created_at', { ascending: false })
```

### Gifts within a date range

```typescript
const { data } = await supabase
  .from('coffee_gifts')
  .select('*')
  .eq('creator_profile_id', creatorId)
  .gte('created_at', '2026-04-01T00:00:00Z')
  .lte('created_at', '2026-04-30T23:59:59Z')
  .order('created_at', { ascending: false })
```

---

## Rendering a Gift Card

```tsx
// components/GiftCard.tsx
interface GiftCardProps {
  gift: CoffeeGift
}

export function GiftCard({ gift }: GiftCardProps) {
  const isAnonymous = gift.supporter_profile_id === null
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(gift.created_at))

  return (
    <div className="rounded-xl border p-4 space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg">
          {isAnonymous ? '?' : (gift.supporter_name?.[0] ?? '?')}
        </div>

        <div>
          <p className="font-semibold text-sm">
            {gift.supporter_name ?? 'Someone'}
            {gift.supporter_platform && (
              <span className="ml-2 text-xs text-gray-400">
                via {gift.supporter_platform}
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>

        <div className="ml-auto text-right">
          <span className="text-sm font-medium">
            ☕ × {gift.coffee_count}
          </span>
          {gift.is_monthly && (
            <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
              Monthly
            </span>
          )}
        </div>
      </div>

      {gift.message && (
        <p className="text-sm text-gray-700 italic border-l-2 border-amber-300 pl-3">
          "{gift.message}"
        </p>
      )}
    </div>
  )
}
```

---

## Rendering a Gift Feed

```tsx
// components/GiftFeed.tsx
import { useState, useEffect } from 'react'
import { GiftCard } from './GiftCard'

interface GiftFeedProps {
  creatorId: string
}

export function GiftFeed({ creatorId }: GiftFeedProps) {
  const [gifts, setGifts] = useState<CoffeeGift[]>([])
  const [cursor, setCursor] = useState<string | undefined>()
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  async function loadMore() {
    if (loading || !hasMore) return
    setLoading(true)

    const newGifts = await getCreatorGiftFeed(creatorId, 20, cursor)
    setGifts(prev => [...prev, ...newGifts])
    setHasMore(newGifts.length === 20)
    setCursor(newGifts[newGifts.length - 1]?.created_at)

    setLoading(false)
  }

  useEffect(() => { loadMore() }, [creatorId])

  if (gifts.length === 0 && !loading) {
    return <p className="text-center text-gray-400">No gifts yet. Be the first! ☕</p>
  }

  return (
    <div className="space-y-3">
      {gifts.map(gift => (
        <GiftCard key={gift.id} gift={gift} />
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}
```

---

## Real-Time Updates (Optional)

You can subscribe to new gifts in real-time using Supabase Realtime:

```typescript
useEffect(() => {
  const channel = supabase
    .channel(`creator-gifts-${creatorId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'coffee_gifts',
        filter: `creator_profile_id=eq.${creatorId}`,
      },
      (payload) => {
        const newGift = payload.new as CoffeeGift
        setGifts(prev => [newGift, ...prev])
      }
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [creatorId])
```

::: warning
Make sure Realtime is enabled on the `coffee_gifts` table in your Supabase project settings before using this.
:::
