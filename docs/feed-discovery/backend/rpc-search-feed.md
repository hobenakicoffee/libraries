# RPC: `search_feed`

Full-text + trigram search across all public feed items. Supports both English and Bangla. Callable by `anon` and `authenticated`.

## Signature

```sql
search_feed(
  p_query     text,
  p_limit     int    default 20,
  p_cursor_id bigint default null
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
  created_at           timestamptz,
  is_liked             bool,
  is_bookmarked        bool,
  creator_username     text,
  creator_display_name text,
  creator_avatar_url   text,
  search_rank          real
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `p_query` | `text` | *(required)* | Search query in English or Bangla |
| `p_limit` | `int` | `20` | Rows per page (capped at 100) |
| `p_cursor_id` | `bigint` | `null` | `id` of the last item from the previous page |

## Return Fields

Same as `get_feed` plus:

| Field | Description |
|---|---|
| `search_rank` | `ts_rank` score for the FTS match; `0` for ILIKE-only matches |

## How Search Works

Two-pass strategy with prioritized ordering:

1. **Full-text search (FTS)** — `search_vector @@ websearch_to_tsquery('simple', p_query)` — matches tokenised words, supports boolean operators (`"dhaka coffee"`, `coffee -instant`)
2. **Trigram fallback** — `metadata->>'title' ILIKE '%' || p_query || '%'` — catches short queries, single characters, and partial Bangla words that FTS doesn't tokenise

The `'simple'` dictionary is used for both because it skips stemming, which is required for Bangla text.

**Sort order:** FTS matches first (priority flag), then by `search_rank DESC`, then by `rank_score DESC`. ILIKE-only matches appear after all FTS matches.

## What Is Indexed

The `search_vector` is built from:
- `metadata->>'title'`
- `metadata->>'excerpt'`
- Creator's `display_name` or `username`
- `content_type`

Searching for a creator's name will return all of their public feed items.

## Pagination

Cursor is `id`-based (not score-based) since search results are re-ranked differently from the main feed:

```typescript
// Page 1
const { data } = await supabase.rpc('search_feed', {
  p_query: 'ঢাকা কফি',
  p_limit: 20,
})

// Page 2
const last = data[data.length - 1]
const { data: nextPage } = await supabase.rpc('search_feed', {
  p_query: 'ঢাকা কফি',
  p_limit: 20,
  p_cursor_id: last.id,
})
```

## Example

```typescript
async function searchFeed(query: string, cursorId?: number) {
  const { data, error } = await supabase.rpc('search_feed', {
    p_query: query,
    p_limit: 20,
    p_cursor_id: cursorId ?? null,
  })
  if (error) throw error
  return data ?? []
}
```

## Security

- `SECURITY DEFINER`, `SET search_path = ''`
- Granted to `anon` and `authenticated`
- Hard-filtered to `visibility = 'public'`
