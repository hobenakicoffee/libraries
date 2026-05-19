# RPC: `get_explore_creators`

Paginated, filtered, popularity-sorted list of creators for the explore page. Callable by both `anon` and `authenticated` roles — no authentication required.

## Signature

```sql
get_explore_creators(
  p_search        text        default null,
  p_category      text        default null,
  p_limit         int         default 12,
  p_cursor_score  bigint      default null,
  p_cursor_id     uuid        default null
)
returns table (
  id               uuid,
  username         text,
  display_name     text,
  full_name        text,
  bio              text,
  avatar_url       text,
  banner_url       text,
  page_slug        text,
  is_verified      boolean,
  categories       text[],
  follower_count   bigint,
  supporter_count  bigint,
  popularity_score bigint,
  services         text[]
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `p_search` | `text` | `null` | Case-insensitive substring match against `display_name`, `full_name`, and `username` |
| `p_category` | `text` | `null` | Return only creators whose `categories` array contains this value |
| `p_limit` | `int` | `12` | Number of rows to return per page (the function fetches `p_limit + 1` internally) |
| `p_cursor_score` | `bigint` | `null` | `popularity_score` of the last row from the previous page |
| `p_cursor_id` | `uuid` | `null` | `id` of the last row from the previous page |

Both cursor params must be provided together. If either is `null`, pagination resets to the first page.

## Return Fields

| Field | Description |
|---|---|
| `id` | Profile UUID |
| `username` | Unique handle (used in `@handle` display) |
| `display_name` | Public display name (may be `null` if not set) |
| `full_name` | Full name from onboarding |
| `bio` | Short creator bio |
| `avatar_url` | Profile picture URL |
| `banner_url` | Cover/banner image URL |
| `page_slug` | URL slug for the creator's public page |
| `is_verified` | `true` if the blue verified badge is active (KYC approved) |
| `categories` | Array of topic tags the creator selected |
| `follower_count` | Number of followers |
| `supporter_count` | Number of unique supporters (people who have gifted) |
| `popularity_score` | `follower_count + (supporter_count × 5)` |
| `services` | Alphabetically sorted array of enabled service names (e.g. `["gift", "newsletter", "shop"]`) |

## Pagination

This RPC uses **keyset pagination**. The function always fetches `p_limit + 1` rows. Your client should:

1. Detect `has_next_page` by checking if the response length equals `p_limit + 1`
2. Slice the array to `p_limit` before rendering
3. Pass the last row's `popularity_score` and `id` as the cursor for the next call

```
Sort order: popularity_score DESC, id DESC

Cursor predicate:
  (popularity_score < p_cursor_score)
  OR (popularity_score = p_cursor_score AND id < p_cursor_id)
```

Using `id` as the tiebreaker ensures stable pages even when multiple creators share the same `popularity_score`.

## Calling from the Frontend

```typescript
// Page 1
const { data } = await supabase.rpc('get_explore_creators', {
  p_limit: 12,
})

// Page 2 — pass the last item's cursor values
const last = data[data.length - 1]
const { data: nextPage } = await supabase.rpc('get_explore_creators', {
  p_limit: 12,
  p_cursor_score: last.popularity_score,
  p_cursor_id: last.id,
})

// With search
const { data } = await supabase.rpc('get_explore_creators', {
  p_search: 'coffee',
  p_limit: 12,
})

// With category filter
const { data } = await supabase.rpc('get_explore_creators', {
  p_category: 'Tech',
  p_limit: 12,
})
```

## How `services` Is Built

The `services` column is a subquery that runs per creator row:

```sql
select array_agg(us.service order by us.service)
from public.user_services us
where us.profile_id = p.id
  and us.is_enabled = true
```

It returns `null` if the creator has no enabled services. Map `null → []` on the frontend before rendering the offerings chips.

## Security

- `SECURITY DEFINER`, `SET search_path = ''`
- Granted to `anon` and `authenticated` — safe to call from the browser with the public anon key
- Reads only `profiles` and `user_services`, both of which have public SELECT policies
