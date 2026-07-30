# RPC: `search_shop_products`

Full-text + trigram search across a **single shop's** live catalogue. Powers the storefront navbar search. Supports English and Bangla. Revoked from `anon` — call it from the Astro SSR/action layer on the service-role client, not from the browser. See the [RPC Reference](./rpc-reference#public-reads) table.

Scoped to one shop by design — this is a shop's own product search, not a marketplace-wide one. For cross-creator discovery see [`search_feed`](../../feed-discovery/backend/rpc-search-feed).

## Signature

```sql
search_shop_products(
  p_username varchar,
  p_query    text,
  p_limit    integer default 20,
  p_offset   integer default 0
)
returns jsonb
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `p_username` | `varchar` | *(required)* | Shop owner's username |
| `p_query` | `text` | *(required)* | Search query in English or Bangla. Under 2 characters after trim → empty success payload |
| `p_limit` | `integer` | `20` | Rows per page (clamped to 1–48) |
| `p_offset` | `integer` | `0` | Rows to skip. Pass back the `next_offset` from the previous page |

## Return Shape

```json
{
  "success": true,
  "products": [
    {
      "id": "…uuid…",
      "title": "Warm Film Lightroom Presets",
      "slug": "warm-film-lightroom-presets",
      "cover_image_url": "…",
      "product_type": "digital",
      "price": 1200.00,
      "compare_at_price": null,
      "stock_count": null,
      "low_stock_threshold": 5,
      "sales_count": 12,
      "rating_avg": 4.75,
      "rating_count": 8,
      "tags": ["lightroom", "presets"],
      "sort_order": 0,
      "category_id": "…uuid…",
      "created_at": "2026-07-01T10:00:00Z",
      "is_on_sale": false,
      "effective_price": 1200.00,
      "strikethrough_price": null,
      "discount_percent": null,
      "sale_ends_at": null
    }
  ],
  "has_more": true,
  "next_offset": 20
}
```

Each product is **field-for-field identical** to a `get_shop_products` product, including the resolved [`shop_product_pricing()`](./rpc-reference#pricing-sales) block. That is deliberate: the storefront reuses the same product type and the same card component for both the browse grid and the search grid. No `search_rank` is exposed — adding one would change the generated `Database` type and break that reuse.

Render `effective_price` / `strikethrough_price`, never the raw `price`.

## How Search Works

Two-pass strategy with prioritised ordering:

1. **Full-text search** — `search_vector @@ websearch_to_tsquery('simple', p_query)`. Tokenised word matching with boolean operators (`"line art"`, `presets -vintage`). `websearch_to_tsquery` never raises on malformed input, which is what makes it safe to hand raw user text.
2. **Trigram fallback** — `title ILIKE '%' || p_query || '%'`, backed by a `gin_trgm_ops` index. Catches partial tokens and prefixes the tokeniser cannot match (`Prese` does not match the lexeme `presets`), plus partial Bangla words.

The `'simple'` dictionary is used throughout because it skips stemming, which is required for Bangla — and it lowercases, so a tag stored as `Coffee` still matches a query of `coffee`.

LIKE metacharacters in `p_query` are escaped, so a query of `%` is a literal, not a wildcard.

**Sort order:** FTS matches first (priority flag), then `ts_rank` desc, then `sales_count` desc, then `id` desc. ILIKE-only matches appear after all FTS matches. The trailing `id` gives a total ordering, without which offset paging would be non-deterministic across ties.

**Hard filters:** `is_active = true`, `is_deleted = false`, and the shop must be published.

## What Is Indexed

`shop_products.search_vector` is a **generated** column (not trigger-maintained) built by `shop_product_search_document(title, tags, description)`:

| Weight | Source |
|---|---|
| `A` | `title` |
| `B` | `tags` |
| `C` | `description` |

Generated rather than trigger-maintained because every source column is on-row: the expression stays `IMMUTABLE`, Postgres backfills existing rows automatically on `ALTER`, and — the real win — the vector is not recomputed on the table's hot write paths (`sales_count` bumps on every delivery, `rating_avg`/`rating_count` rewrites from the reviews trigger).

`shop_product_search_document` is declared `IMMUTABLE` even though it calls `array_to_string()`, which the catalog marks `STABLE`. That is sound, not a volatility lie: `array_to_string` is only stable because for an arbitrary element type the element's output function may read session settings (`timestamptz` and `TimeZone` being the classic case). Pinned to `text[]`, the output function is `textout`, which is immutable.

::: warning
Editing `shop_product_search_document` does **not** rewrite existing rows. Any change to the expression must be paired with an `ALTER TABLE … ALTER COLUMN search_vector` or a forced table rewrite, or stored vectors go stale.
:::

Backing indexes, both partial on `is_active = true and is_deleted = false` so they cover the RPC's whole `WHERE` clause:

- `idx_shop_products_search_vector` — GIN on `search_vector`
- `idx_shop_products_title_trgm` — GIN on `(title::text) gin_trgm_ops`. The `::text` cast is required; `gin_trgm_ops` is declared for `text` and rejects a bare `varchar` column.

Neither carries `profile_id` — the planner bitmap-ANDs them with `idx_shop_products_profile_active`, and per-shop catalogues are small enough that a composite would not pay for itself. `ts_rank` is only ever evaluated over the set the indexes already narrowed to, never the whole table.

## Pagination

Offset-based, **not** a keyset cursor. `shop_products.id` is a random `gen_random_uuid()`, so the `id < cursor` trick `search_feed` uses (valid there, where `feed_items.id` is a `bigint` identity) would filter an arbitrary half of the catalogue with no relation to rank order — silently skipping and duplicating rows. Offset is correct given the total ordering above, and search result sets are short.

```typescript
// Page 1
const { data } = await supabase.rpc('search_shop_products', {
  p_username: 'leo',
  p_query: 'line art',
  p_limit: 20,
})

// Page 2 — pass next_offset back verbatim
const { data: nextPage } = await supabase.rpc('search_shop_products', {
  p_username: 'leo',
  p_query: 'line art',
  p_limit: 20,
  p_offset: data.next_offset,
})
```

## Short Queries

A `p_query` under 2 characters returns **success with an empty `products` array**, not an error:

```json
{ "success": true, "products": [], "has_more": false, "next_offset": null }
```

An under-length input is a normal UI state while the user is still typing, not a failure the client should have to map. The guard also matters for cost — a 1–2 character `ILIKE` cannot use the trigram index (GIN trgm needs 3 characters) and would degrade to a scan. Clients should still gate on length before firing the request; this is defence in depth, not the only line.

## Errors

| Code | Meaning |
|---|---|
| `PROFILE_NOT_FOUND` | `p_username` does not exist |
| `SHOP_NOT_FOUND` | The username exists but has no published (`is_active`) shop |

## Security

- `SECURITY DEFINER`, `SET search_path = ''`
- No explicit grants — callable by `anon`, matching every other storefront read (`get_shop_products`, `get_shop_by_username`, `get_shop_categories`). A logged-out visitor must be able to search a public shop.
- `SECURITY DEFINER` is also what permits the call to `shop_product_pricing()`, which is revoked from `public, anon`.
- Hard-filtered to the named shop's `is_active`, non-deleted products.
