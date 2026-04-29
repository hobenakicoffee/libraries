# Feed — Loading & Rendering

This page covers fetching the feed, rendering cards by content type, handling paywalled content, and tracking impressions.

## Fetching the Feed

The feed uses `useInfiniteQuery` with cursor-based pagination. Each page passes `cursor_score` and `cursor_id` from the last item of the previous page.

```typescript
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '@/lib/supabase'
import { feedQueryKeys } from '@/features/feed/query-keys'

interface FeedItem {
  cache_id: number
  rank_score: number
  is_boosted: boolean
  feed_item_id: string
  content_type: string
  content_id: string
  is_paywalled: boolean
  like_count: number
  comment_count: number
  impression_count: number
  metadata: Record<string, unknown>
  expires_at: string
  created_at: string
  creator_profile_id: string
  creator_username: string
  creator_display_name: string
  creator_avatar_url: string | null
  viewer_has_liked: boolean
}

interface FeedPage {
  items: FeedItem[]
  nextCursor: { score: number; id: number } | null
}

export function useMyFeed() {
  const supabase = useSupabaseClient()

  return useInfiniteQuery({
    queryKey: feedQueryKeys.feed,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase.rpc('get_my_feed', {
        p_limit: 20,
        p_cursor_score: pageParam?.score ?? null,
        p_cursor_id: pageParam?.id ?? null,
      })

      if (error) throw error

      const items = data as FeedItem[]
      const last = items[items.length - 1]

      return {
        items,
        nextCursor: items.length === 20
          ? { score: last.rank_score, id: last.cache_id }
          : null,
      } satisfies FeedPage
    },
    initialPageParam: null as { score: number; id: number } | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
```

## Rendering the Feed List

Use your `InfiniteScrollSentinel` pattern to trigger loading the next page:

```tsx
import { useMyFeed } from '@/features/feed/hooks/use-my-feed'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { FeedCard } from './feed-card'

export function FeedList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useMyFeed()
  const sentinelRef = useInfiniteScroll({ onIntersect: fetchNextPage, enabled: hasNextPage })

  if (status === 'pending') return <FeedSkeleton />
  if (status === 'error') return <FeedError />

  const items = data.pages.flatMap(p => p.items)

  if (items.length === 0) {
    return <FeedEmpty />  // "Follow some creators to see their content here"
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <FeedCard key={item.feed_item_id} item={item} />
      ))}
      <InfiniteScrollSentinel ref={sentinelRef} isLoading={isFetchingNextPage} />
    </div>
  )
}
```

## Feed Card by Content Type

All feed items share the same universal card shell, but the body varies by `content_type`. Use a switch to render the right variant:

```tsx
// feed-card.tsx
import { FeedCardShell } from './feed-card-shell'
import { NewsletterPostCard } from './cards/newsletter-post-card'
import { MembershipPlanCard } from './cards/membership-plan-card'
import { ShopProductCard } from './cards/shop-product-card'
import type { FeedItem } from '@/features/feed/types'

interface FeedCardProps {
  item: FeedItem
}

export function FeedCard({ item }: FeedCardProps) {
  return (
    <FeedCardShell item={item}>
      {renderCardBody(item)}
    </FeedCardShell>
  )
}

function renderCardBody(item: FeedItem) {
  switch (item.content_type) {
    case 'newsletter_post':
      return <NewsletterPostCard metadata={item.metadata} isPaywalled={item.is_paywalled} />
    case 'membership_plan':
      return <MembershipPlanCard metadata={item.metadata} />
    case 'shop_product':
      return <ShopProductCard metadata={item.metadata} isPaywalled={item.is_paywalled} />
    default:
      return <GenericFeedCard metadata={item.metadata} />
  }
}
```

### The Universal Card Shell

The shell handles elements that are consistent across all content types: creator info, like/comment counts, promoted badge, and the impression observer.

```tsx
// feed-card-shell.tsx
import { ImpressionTracker } from './impression-tracker'
import { FeedCardActions } from './feed-card-actions'
import type { FeedItem } from '@/features/feed/types'

interface FeedCardShellProps {
  item: FeedItem
  children: React.ReactNode
}

export function FeedCardShell({ item, children }: FeedCardShellProps) {
  return (
    <ImpressionTracker feedItemId={item.feed_item_id}>
      <article className="rounded-xl border bg-card p-4 space-y-3">
        {/* Promoted badge */}
        {item.is_boosted && (
          <span className="text-xs text-muted-foreground font-medium">
            Promoted
          </span>
        )}

        {/* Creator info */}
        <CreatorHeader
          username={item.creator_username}
          displayName={item.creator_display_name}
          avatarUrl={item.creator_avatar_url}
          publishedAt={item.created_at}
        />

        {/* Content body — varies by content_type */}
        {children}

        {/* Like / comment actions */}
        <FeedCardActions
          feedItemId={item.feed_item_id}
          likeCount={item.like_count}
          commentCount={item.comment_count}
          viewerHasLiked={item.viewer_has_liked}
        />
      </article>
    </ImpressionTracker>
  )
}
```

### Newsletter Post Card

```tsx
// cards/newsletter-post-card.tsx
interface NewsletterPostMetadata {
  title: string
  excerpt: string
  banner_image_url?: string
  slug: string
  read_time_minutes?: number
  tags?: string[]
  is_members_only: boolean
  is_pay_per_post: boolean
  price?: number
}

interface NewsletterPostCardProps {
  metadata: Record<string, unknown>
  isPaywalled: boolean
}

export function NewsletterPostCard({ metadata, isPaywalled }: NewsletterPostCardProps) {
  const m = metadata as NewsletterPostMetadata

  return (
    <div className="space-y-2">
      {m.banner_image_url && (
        <img src={m.banner_image_url} alt={m.title} className="rounded-lg w-full object-cover" />
      )}
      <h3 className="font-semibold text-base">{m.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-3">{m.excerpt}</p>

      {isPaywalled && (
        <PaywallBadge price={m.price} isMembersOnly={m.is_members_only} />
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {m.read_time_minutes && <span>{m.read_time_minutes} min read</span>}
        {m.tags?.map(tag => <span key={tag}>#{tag}</span>)}
      </div>
    </div>
  )
}
```

### Membership Plan Card

```tsx
// cards/membership-plan-card.tsx
interface MembershipPlanMetadata {
  title: string
  excerpt: string
  price: number
  billing_cycle: 'monthly' | 'annual' | 'lifetime'
}

export function MembershipPlanCard({ metadata }: { metadata: Record<string, unknown> }) {
  const m = metadata as MembershipPlanMetadata

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-base">{m.title}</h3>
      <p className="text-sm text-muted-foreground">{m.excerpt}</p>
      <div className="flex items-center justify-between">
        <span className="font-medium">
          ৳{m.price} / {m.billing_cycle}
        </span>
        <Button size="sm" variant="default">Subscribe</Button>
      </div>
    </div>
  )
}
```

## Paywall Display

For paywalled items, always show the `excerpt` and `banner_image_url` (from `metadata`) regardless of access. Show a lock/paywall badge but never hide the teaser.

```tsx
function PaywallBadge({ price, isMembersOnly }: { price?: number; isMembersOnly: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm">
      <LockIcon className="h-4 w-4 text-muted-foreground" />
      {isMembersOnly
        ? 'Members only — subscribe to read'
        : `৳${price} to unlock this post`}
    </div>
  )
}
```

## Impression Tracking

Use an `IntersectionObserver` to detect when a card enters the viewport, then call `record_feed_impression`. Debounce to avoid firing on rapid scroll-through.

```tsx
// impression-tracker.tsx
import { useEffect, useRef } from 'react'
import { useSupabaseClient } from '@/lib/supabase'

interface ImpressionTrackerProps {
  feedItemId: string
  children: React.ReactNode
}

export function ImpressionTracker({ feedItemId, children }: ImpressionTrackerProps) {
  const supabase = useSupabaseClient()
  const ref = useRef<HTMLDivElement>(null)
  const hasTracked = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // Only track once per mount, when 50% visible
        if (entry.isIntersecting && !hasTracked.current) {
          hasTracked.current = true
          // Fire and forget — don't block rendering
          supabase.rpc('record_feed_impression', { p_feed_item_id: feedItemId })
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [feedItemId, supabase])

  return <div ref={ref}>{children}</div>
}
```

`hasTracked` ensures each card only fires one impression per mount cycle. Impressions accumulate in the buffer and are flushed to `impression_count` every 30 minutes by the cron job.

## Empty Feed State

New users with no follows will see an empty feed. Show a helpful empty state rather than a blank page:

```tsx
function FeedEmpty() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h3 className="font-semibold text-lg">Your feed is empty</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Follow some creators to see their posts, products, and plans here.
      </p>
      <Button asChild>
        <Link to="/discover">Discover Creators</Link>
      </Button>
    </div>
  )
}
```
