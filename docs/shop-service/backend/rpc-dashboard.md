# Dashboard & Cron RPCs

```mermaid
flowchart TB
    subgraph "get_shop_overview"
        A[RPC Call] --> B[Revenue Aggregation]
        B --> C[last_30_days]
        B --> D[prev_30_days]
        B --> E[all_time]
        
        F[Order Counts] --> H[same buckets]
        
        I[Products] --> J[published]
        I --> K[last_30_days / prev_30_days<br/>newly active growth delta]
        
        L[Metrics] --> M[pending_count<br/>physical items in processing]
        L --> N[pending_last_30 / pending_prev_30<br/>processing items delta]
        L --> O[cash_pending_count<br/>COD delivered, unsettled]
        
        P[Top Items] --> Q[sales_count desc]
        R[Recent Orders] --> S[created_at desc]
        
        T[Eligibility] --> U[check_shop_active_eligibility]
        
        B --> V[sparkline<br/>30-day daily array]
    end
    
    subgraph "Auto-Deactivate Cron"
        Q[Daily @ 3AM] --> R[Runs eligibility check]
        R --> S{Eligible?}
        S -->|Yes| T[No change]
        S -->|No| U[Set is_active=false]
U --> V[Set deactivation_reason]
```

## `get_shop_overview`

```sql
public.get_shop_overview() → jsonb
```

Single-call RPC that powers the Creator Studio Overview tab. Aggregates revenue, order counts, product count, pending tasks, top sellers, recent orders, and eligibility — all in one round trip.

### Response shape

```json
{
  "success": true,
  "revenue": {
    "all_time": 48200.00,
    "last_30_days": 8400.00,
    "prev_30_days": 6200.00,
    "sparkline": [
      { "day": "2026-04-28", "value": 0 },
      { "day": "2026-04-29", "value": 1200.00 },
      { "day": "2026-04-30", "value": 0 },
      { "day": "2026-05-01", "value": 850.00 }
    ]
  },
  "orders": {
    "all_time": 87,
    "last_30_days": 14,
    "prev_30_days": 11
  },
  "products": {
    "published": 6,
    "last_30_days": 3,
    "prev_30_days": 1
  },
  "pending_count": 3,
  "pending_last_30": 2,
  "pending_prev_30": 4,
  "cash_pending_count": 1,
  "top_selling": [
    {
      "id": "uuid",
      "title": "Ethiopia Yirgacheffe 250g",
      "cover_image_url": "...",
      "product_type": "physical",
      "price": 850.00,
      "sales_count": 42
    }
  ],
  "recent_orders": [
    {
      "order_number": "SHOP-20240115-A3F2",
      "created_at": "2024-01-15T10:00:00Z",
      "item_count": 2,
      "subtotal": 1700.00,
      "shipping_total": 120.00,
      "seller_net": 1638.00,
      "payment_method": "cod",
      "status": "processing"
    }
  ],
  "eligibility": {
    "eligible": true,
    "reasons": [],
    "wallet_balance": 3400.00,
    "cod_debt": 0.00,
    "wallet_floor": -500,
    "aged_cod_orders": 0,
    "settlement_max_days": 30
  }
}
```

### What each field means

| Field | Definition |
|---|---|---|
| `revenue.all_time` | Sum of `seller_net` on orders where `transaction_reference_id IS NOT NULL OR cod_settled_at IS NOT NULL` |
| `revenue.last_30_days` | Same filter, `created_at >= now() - 30 days` |
| `revenue.prev_30_days` | Same filter, `60 days ago → 30 days ago` (for % delta) |
| `revenue.sparkline` | 30-element array of `{ day, value }` — daily `seller_net` for last 30 days via `generate_series`, zero-filled for days with no revenue |
| `orders.*` | Counts all orders (not just settled) for same buckets |
| `products.published` | Active + not-deleted products |
| `products.last_30_days` | Products created (and active) in last 30 days |
| `products.prev_30_days` | Products created (and active) 60–30 days ago (for % delta) |
| `pending_count` | Physical items in `processing` — seller should ship these |
| `pending_last_30` | Processing items from orders placed in last 30 days |
| `pending_prev_30` | Processing items from orders placed 60–30 days ago (for % delta) |
| `cash_pending_count` | COD items in `delivered` with `cod_settled_at IS NULL` — seller should confirm cash |
| `top_selling` | Top 5 by `sales_count`, active + not-deleted |
| `recent_orders` | Latest 5 by `created_at` with computed status |
| `eligibility` | Result of `check_shop_active_eligibility()` |

### Revenue counting — what "settled" means

Revenue is counted conservatively:

- **Online orders** — counted once `transaction_reference_id` is set (IPN confirmed)
- **COD orders** — counted once `cod_settled_at` is set on the order (all items confirmed)

Orders in `pending`/`processing`/`shipped` are **not** counted as revenue yet, even for COD where cash may already be collected physically. This avoids double-counting partially-settled orders.

### Frontend usage

```typescript
// One query for the whole overview page
const { data } = useQuery({
  queryKey: ['shop', 'overview'],
  queryFn: getShopOverview,
  refetchOnWindowFocus: true,
});

// Derive % delta for the revenue card
const revenueDelta = percentDelta(data.revenue.last_30_days, data.revenue.prev_30_days);

// Render a mini sparkline chart from the 30-point array
const sparklineData = data.revenue.sparkline.map(({ day, value }) => ({
  date: new Date(day),
  revenue: value,
}));

// Derive % delta for pending items
const pendingDelta = percentDelta(data.pending_last_30, data.pending_prev_30);

// Derive % delta for product growth
const productDelta = percentDelta(data.products.last_30_days, data.products.prev_30_days);

// Use eligibility directly for the banner
if (!data.eligibility.eligible) {
  // Show ShopDeactivationBanner with data.eligibility
}
```

---

## `get_shop_stats`

```sql
public.get_shop_stats() → jsonb
```

Returns the four cached stats counters for the Studio stats card strip. Single PK lookup — no aggregation. See [Helpers](./rpc-helpers#get_shop_stats) for the full reference.

```typescript
const { data } = useQuery({
  queryKey: ['shop', 'stats'],
  queryFn: getShopStats,
  staleTime: 30_000, // refresh every 30s; counters are near-realtime
});
```

---

## `auto_deactivate_ineligible_shops`

```sql
public.auto_deactivate_ineligible_shops() → jsonb
```

Cron-only function. Iterates every active shop, runs `check_shop_active_eligibility`, and deactivates any that fail.

### What it sets on deactivated shops

```sql
update shop_settings set
  is_active           = false,
  deactivation_reason = case
    when reasons contains 'cod_aging'          then 'cod_aging'
    when reasons contains 'wallet_below_floor' then 'wallet_below_floor'
    else 'manual'
  end
where profile_id = failing_shop;
```

`cod_aging` takes precedence when both conditions are true because it's the more time-sensitive issue.

### Response

```json
{
  "success": true,
  "shops_deactivated": 2,
  "ran_at": "2024-01-16T03:00:00Z"
}
```

### Scheduling

Register the cron job with `pg_cron` after running the migration:

```sql
select cron.schedule(
  'auto-deactivate-ineligible-shops',
  '0 3 * * *',    -- 3 AM daily
  $$ select public.auto_deactivate_ineligible_shops(); $$
);
```

Check the job is registered:

```sql
select jobname, schedule, command, active
from cron.job
where jobname = 'auto-deactivate-ineligible-shops';
```

::: tip Ops responsibility
The `select cron.schedule(...)` call is **not** in the migration SQL — it must be run manually by ops after the migration completes. This avoids running it on test/staging environments unintentionally.
:::

---

## `cleanup_orphaned_shop_images`

```sql
public.cleanup_orphaned_shop_images() → void
```

Nightly cron job. Deletes objects in the `shop-images` bucket that are no longer referenced by any shop row, subject to a 24-hour grace window.

### What counts as referenced

An object is kept if its full public URL appears in any of:

| Table | Column |
|---|---|
| `shop_settings` | `logo_url`, `banner_url` |
| `shop_products` | `cover_image_url`, `images[]` |
| `shop_product_variants` | `image_url` |
| `shop_product_drafts` | `cover_image_url`, `images[]` |

The base URL is derived at runtime from `storage.objects.metadata->>'httpUrl'` — no hardcoded Supabase project URL required.

### Grace window

Only objects older than **24 hours** are candidates. This prevents race conditions where a seller has uploaded an image mid-edit but hasn't saved the product or shop settings yet.

### Scheduling

```sql
select cron.schedule(
  'cleanup-shop-orphaned-images',
  '0 23 * * *',    -- 11 PM UTC = 5 AM Dhaka (UTC+6)
  $$ select public.cleanup_orphaned_shop_images(); $$
);
```

---

## `cleanup_orphaned_shop_product_files`

```sql
public.cleanup_orphaned_shop_product_files() → void
```

Nightly cron job. Deletes objects in the `shop-product-files` private bucket that have no corresponding `shop_product_files` row.

### What counts as referenced

An object is kept if `storage.objects.name` matches any `shop_product_files.storage_path`, **including soft-deleted rows** (`is_deleted = true`). Soft-deleted file rows are kept alive because buyers may still hold valid `shop_download_tokens` pointing at those files — the `ON DELETE RESTRICT` FK on `shop_product_files` enforces this separately.

Only objects with **no row at all** in `shop_product_files` are deleted.

### Grace window

Only objects older than **24 hours** are candidates.

### Scheduling

```sql
select cron.schedule(
  'cleanup-shop-orphaned-product-files',
  '30 23 * * *',   -- 11:30 PM UTC = 5:30 AM Dhaka (UTC+6)
  $$ select public.cleanup_orphaned_shop_product_files(); $$
);
```
