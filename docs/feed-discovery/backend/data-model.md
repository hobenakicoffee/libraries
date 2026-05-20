# Data Model

All feed tables live in `supabase/schemas/feed.sql`.

## `feed_items`

The canonical public feed surface. Populated by triggers on source tables and by the manager RPC. Never written to directly by authenticated users.

```sql
create table public.feed_items (
  id                  bigint generated always as identity primary key,
  creator_profile_id  uuid references public.profiles(id) on delete set null,
  content_type        varchar(30) not null
                        check (content_type in (
                          'newsletter_post', 'shop_product', 'shop_batch',
                          'one_on_one', 'hire',
                          'system_milestone', 'system_announcement'
                        )),
  reference_id        uuid,                   -- links to source record; null for manager posts
  metadata            jsonb not null default '{}'::jsonb,
  rank_score          numeric not null default 0,
  boost_tier          smallint not null default 0 check (boost_tier between 0 and 3),
  search_vector       tsvector,
  is_pinned           boolean not null default false,
  interaction_counts  jsonb not null default
                        '{"likes":0,"comments":0,"bookmarks":0,"shares":0}'::jsonb,
  visibility          public.visibility_enum not null default 'public',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
)
```

### Content Types

| `content_type` | Source table | Created when |
|---|---|---|
| `newsletter_post` | `newsletter_posts` | Post published + public |
| `shop_product` | `shop_products` | Product activated (first within 2h) |
| `shop_batch` | `shop_products` | Second+ product from same creator within 2h |
| `one_on_one` | *(future)* | Creator opens a 1:1 slot |
| `hire` | *(future)* | Creator opens a hire slot |
| `system_milestone` | automatic | Creator crosses a threshold |
| `system_announcement` | manager RPC | Platform announcement |

### Metadata Shapes

The `metadata` JSONB column drives card rendering. Shape varies by `content_type`:

```typescript
// newsletter_post
{ title: string, excerpt: string | null, thumbnail_url: string | null, is_paid: boolean }

// shop_product
{ title: string, price: number, currency: 'BDT', thumbnail_url: string | null, product_type: string }

// shop_batch
{ items: Array<{ title, price, thumbnail_url }>, count: number }

// system_milestone
{ milestone_type: 'followers' | 'subscribers' | 'posts', threshold: number, display_label: string, icon_key: string }

// system_announcement
{ title: string, body: string | null, image_url: string | null, cta_label: string | null, cta_url: string | null }
```

### `reference_id`

Links the feed item back to its source record (e.g., `newsletter_posts.id`, `shop_products.id`). `null` for manager announcements and `shop_batch` items (which aggregate multiple products).

A partial unique index prevents duplicate feed items per source record:

```sql
create unique index idx_feed_items_reference_content_type
  on public.feed_items(reference_id, content_type)
  where reference_id is not null;
```

### Indexes

| Index | Purpose |
|---|---|
| `idx_feed_items_rank_score_id` | Primary feed query (partial: `visibility='public'`) |
| `idx_feed_items_creator` | Filter by creator |
| `idx_feed_items_content_type_created` | Filter by type + date |
| `idx_feed_items_pinned` | Find pinned items quickly |
| `idx_feed_items_reference_content_type` | Upsert deduplication (unique, partial) |
| `idx_feed_items_search_vector` | Full-text search (GIN) |
| `idx_feed_items_title_trgm` | Trigram fuzzy match on title (GIN) |

### RLS

Anonymous and authenticated users can **read** public items. All writes (insert, update, delete) are blocked for regular users — every mutation goes through an RPC or trigger.

---

## Interaction Tables

### `feed_item_likes`

```sql
(id, feed_item_id → feed_items ON DELETE CASCADE,
 profile_id → profiles ON DELETE CASCADE,
 created_at, UNIQUE(feed_item_id, profile_id))
```

- **Read**: anyone (public like counts)
- **Write**: authenticated users, own rows only

### `feed_item_comments`

```sql
(id, feed_item_id → feed_items ON DELETE CASCADE,
 profile_id → profiles ON DELETE CASCADE,
 parent_comment_id → feed_item_comments (nullable, one level max),
 body text, is_deleted bool default false, created_at, updated_at)
```

- **Read**: anon and authenticated, non-deleted rows only
- **Write**: authenticated users, own rows only
- Depth enforcement is in the `add_feed_comment()` RPC — PostgreSQL will not prevent grandchild comments at the schema level, the RPC rejects them.

### `feed_item_bookmarks`

```sql
(id, feed_item_id → feed_items ON DELETE CASCADE,
 profile_id → profiles ON DELETE CASCADE,
 created_at, UNIQUE(feed_item_id, profile_id))
```

- **Read**: authenticated users, **own rows only** (bookmarks are private)
- **Write**: authenticated users, own rows only

### `feed_item_shares`

```sql
(id, feed_item_id → feed_items ON DELETE CASCADE,
 profile_id → profiles ON DELETE CASCADE,
 created_at)
```

- **Write only**: authenticated users, own rows only
- No read policy — share counts are exposed via `interaction_counts` on `feed_items`

---

## Counter-Cache

The `interaction_counts` column on `feed_items` is maintained by four `AFTER INSERT/DELETE` trigger functions — one per interaction table. This avoids expensive `COUNT(*)` joins on every feed query.

| Trigger | Table | Events |
|---|---|---|
| `on_feed_item_like_change` | `feed_item_likes` | INSERT, DELETE |
| `on_feed_item_comment_change` | `feed_item_comments` | INSERT, UPDATE (soft-delete) |
| `on_feed_item_bookmark_change` | `feed_item_bookmarks` | INSERT, DELETE |
| `on_feed_item_share_change` | `feed_item_shares` | INSERT |

Counters floor at 0 via `greatest(0, ...)` to guard against underflow. The `recompute_feed_rank_scores()` function recounts from source tables every 30 minutes as a drift-correction pass.

---

## Search Vector

`search_vector tsvector` is populated by a `BEFORE INSERT OR UPDATE` trigger (`on_feed_item_search_vector_update`):

```sql
NEW.search_vector := to_tsvector('simple',
  coalesce(metadata->>'title',   '') || ' ' ||
  coalesce(metadata->>'excerpt', '') || ' ' ||
  creator_display_name           || ' ' ||
  content_type
)
```

The `'simple'` dictionary is used instead of `'english'` — it skips stemming, which is required for Bangla text to be preserved correctly. Combined with the `pg_trgm` trigram index on the title, this covers fuzzy search in both languages.
