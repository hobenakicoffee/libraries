# Dashboard & Cron RPCs

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
    "prev_30_days": 6200.00
  },
  "orders": {
    "all_time": 87,
    "last_30_days": 14,
    "prev_30_days": 11
  },
  "products": {
    "published": 6
  },
  "pending_count": 3,
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
|---|---|
| `revenue.all_time` | Sum of `seller_net` on orders where `transaction_reference_id IS NOT NULL OR cod_settled_at IS NOT NULL` |
| `revenue.last_30_days` | Same filter, `created_at >= now() - 30 days` |
| `revenue.prev_30_days` | Same filter, `60 days ago → 30 days ago` (for % delta) |
| `orders.*` | Counts all orders (not just settled) for same buckets |
| `products.published` | Active + not-deleted products |
| `pending_count` | Physical items in `processing` — seller should ship these |
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

// Use eligibility directly for the banner
if (!data.eligibility.eligible) {
  // Show ShopDeactivationBanner with data.eligibility
}
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
