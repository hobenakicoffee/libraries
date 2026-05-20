# RPC: `get_feed`

Paginated, algorithm-ranked public feed. Callable by `anon` and `authenticated`.

## Signature

```sql
get_feed(
  p_limit         int     default 20,
  p_cursor_score  numeric default null,
  p_cursor_id     bigint  default null,
  p_content_types text[]  default null
)
returns table (
  id                   bigint,
  creator_profile_id   uuid,
  content_type         varchar,
  reference_id         uuid,
  metadata             jsonb,
  rank_score           numeric,
  boost_tier           smallint,
  is_pinned            boolean,
  interaction_counts   jsonb,
  visibility           visibility_enum,
  created_at           timestamptz,
  is_liked             bool,
  is_bookmarked        bool,
  creator_username     text,
  creator_display_name text,
  creator_avatar_url   text
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `p_limit` | `int` | `20` | Rows per page (capped at 50) |
| `p_cursor_score` | `numeric` | `null` | `rank_score` of the last item from the previous page |
| `p_cursor_id` | `bigint` | `null` | `id` of the last item from the previous page |
| `p_content_types` | `text[]` | `null` | Optional content type filter (e.g. `ARRAY['newsletter_post']`) |

Both cursor params must be provided together. If either is `null`, pagination resets to the first page.

## Return Fields

| Field | Description |
|---|---|
| `id` | Feed item ID (use as cursor with `rank_score`) |
| `creator_profile_id` | Creator's profile UUID (`null` for manager announcements) |
| `content_type` | Card type — drives component selection on the frontend |
| `reference_id` | Source record ID (e.g. `newsletter_posts.id`) — `null` for batches and announcements |
| `metadata` | Card rendering data — shape depends on `content_type` |
| `rank_score` | Current algorithmic score |
| `boost_tier` | Creator's boost tier (0–3) |
| `is_pinned` | `true` if the item is pinned to the top |
| `interaction_counts` | `{likes, comments, bookmarks, shares}` cached counts |
| `visibility` | Always `'public'` in results |
| `created_at` | When the feed item was created |
| `is_liked` | `true` if the current user has liked this item (`false` for anon) |
| `is_bookmarked` | `true` if the current user has bookmarked this item (`false` for anon) |
| `creator_username` | Creator's `@username` |
| `creator_display_name` | Creator's display name (may be `null`) |
| `creator_avatar_url` | Creator's avatar URL (may be `null`) |

## Pagination

Sort order: `is_pinned DESC, rank_score DESC, id DESC`

```typescript
// Page 1
const { data } = await supabase.rpc('get_feed', { p_limit: 20 })

// Page 2
const last = data[data.length - 1]
const { data: nextPage } = await supabase.rpc('get_feed', {
  p_limit: 20,
  p_cursor_score: last.rank_score,
  p_cursor_id: last.id,
})
```

## Content Type Filter

```typescript
// Newsletter posts only
const { data } = await supabase.rpc('get_feed', {
  p_limit: 20,
  p_content_types: ['newsletter_post'],
})

// Shop content only
const { data } = await supabase.rpc('get_feed', {
  p_content_types: ['shop_product', 'shop_batch'],
})
```

## Rendering Cards

Use `content_type` to select the right card component:

```typescript
import type { Database } from '@hobenakicoffee/libraries/types'

type FeedItem = Awaited<
  ReturnType<typeof supabase.rpc<'get_feed'>>
>['data'][number]

const CARD_COMPONENTS: Record<string, Component> = {
  newsletter_post:     NewsletterPostCard,
  shop_product:        ShopProductCard,
  shop_batch:          ShopBatchCard,
  system_milestone:    MilestoneCard,
  system_announcement: AnnouncementCard,
}

function FeedCard({ item }: { item: FeedItem }) {
  const Card = CARD_COMPONENTS[item.content_type]
  if (!Card) return null
  return <Card item={item} />
}
```

## Security

- `SECURITY DEFINER`, `SET search_path = ''`
- Granted to `anon` and `authenticated`
- Hard-filtered to `visibility = 'public'`
- `is_liked` / `is_bookmarked` return `false` for unauthenticated callers (`auth.uid()` returns `null`)
