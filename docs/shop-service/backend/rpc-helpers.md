# Helpers & Eligibility RPCs

::: tip See also
The [Shop Settings - Eligibility System](./shop-settings#eligibility-system) page has the complete guide to eligibility checks, including the wallet floor and COD aging gates.
:::

```mermaid
flowchart TB
    subgraph "Eligibility Check"
        A[check_shop_active_eligibility] --> B[Read wallet]
        B --> C{Available >= floor?}
        C -->|Yes| D[eligible: true]
        C -->|No| E[reasons += wallet_below_floor]
        
        F[Check COD Aging] --> G{Any delivered COD<br/>> max_days?}
        G -->|No| D
        G -->|Yes| H[reasons += cod_aging]
    end
    
    subgraph "Platform Settings"
        I[get_platform_setting] --> J[key]
        J --> K[platform_fee_rate]
        J --> L[cod_wallet_floor]
        J --> M[cod_settlement_max_days]
        J --> N[default_shipping_fee_inside_dhaka]
        J --> O[default_shipping_fee_outside_dhaka]
        J --> P[default_processing_min/max_days]
    end
    
    subgraph "Stats"
        Q[record_shop_view] --> R[total_views + 1]
        S[get_shop_stats] --> T[O(1) PK lookup]
        U[set_shop_active_by_manager] --> V[bypass eligibility]
    end
```

These functions are used internally by other RPCs, or are lightweight utility calls. Understanding `get_platform_setting` and `check_shop_active_eligibility` is essential before reading the checkout and COD pages.

## `get_platform_setting`

```sql
public.get_platform_setting(p_key varchar) → numeric
```

Reads a single row from `platform_settings` and casts the JSONB value to `numeric`. Used internally by `get_creator_effective_fee_rate()` (to read per-service fee rates) and eligibility checks (to read `cod_wallet_floor` and `cod_settlement_max_days`).

```sql
-- Internal usage examples:
-- Per-service fee rates (read by get_creator_effective_fee_rate):
v_rate     := public.get_platform_setting('platform_fee_rate_shop_physical'); -- → 0.05
v_rate     := public.get_platform_setting('platform_fee_rate_shop_digital');  -- → 0.10
-- Eligibility knobs:
v_floor    := public.get_platform_setting('cod_wallet_floor');     -- → -500
v_max_days := public.get_platform_setting('cod_settlement_max_days')::integer; -- → 30
-- Shipping defaults (used by upsert_shop_product fallback chain):
v_fee_in   := public.get_platform_setting('default_shipping_fee_inside_dhaka');  -- → 85
v_fee_out  := public.get_platform_setting('default_shipping_fee_outside_dhaka'); -- → 170
v_min_days := public.get_platform_setting('default_processing_min_days')::integer; -- → 1
v_max_proc := public.get_platform_setting('default_processing_max_days')::integer; -- → 15
```

::: warning Not for client use
Never call this from the frontend. Fee rates are resolved server-side by `get_creator_effective_fee_rate()` and snapshotted onto `shop_order_items.platform_fee_rate` at checkout. Eligibility values are returned inside `get_shop_overview().eligibility`. The client should display but never trust values it sends to the server.
:::

---

## `check_shop_active_eligibility`

```sql
public.check_shop_active_eligibility(p_profile_id uuid) → jsonb
```

The single source of truth for whether a seller can keep their shop active and accept COD orders. Called by:

- `initiate_shop_checkout` (COD path) — blocks checkout if ineligible
- `upsert_shop_settings` (reactivation path) — blocks `is_active = true` if ineligible
- `auto_deactivate_ineligible_shops` (cron) — iterates all active shops nightly

### Response shape

```json
{
  "eligible": true,
  "reasons": [],
  "wallet_balance": 1200.00,
  "cod_debt": 0.00,
  "wallet_floor": -500,
  "aged_cod_orders": 0,
  "settlement_max_days": 30
}
```

When ineligible, `eligible` is `false` and `reasons` contains one or both of:

| Reason | Condition |
|---|---|
| `"wallet_below_floor"` | `(wallet.balance − wallet.cod_debt) < cod_wallet_floor` |
| `"cod_aging"` | Any COD order has unsettled `shipped`/`delivered` items older than `cod_settlement_max_days` |

### Example — ineligible response

```json
{
  "eligible": false,
  "reasons": ["wallet_below_floor", "cod_aging"],
  "wallet_balance": 200.00,
  "cod_debt": 800.00,
  "wallet_floor": -500,
  "aged_cod_orders": 3,
  "settlement_max_days": 30
}
```

In this example:
- `200 − 800 = −600`, which is below the −500 floor → `wallet_below_floor`
- 3 COD orders have aged past 30 days without cash confirmation → `cod_aging`

### Implementation detail

```sql
-- Wallet check
if (v_balance - v_cod_debt) < v_floor then
  v_reasons := array_append(v_reasons, 'wallet_below_floor');
end if;

-- COD aging check
select count(*) into v_aged_count
from public.shop_orders so
join public.shop_order_items soi on soi.order_id = so.id
where so.seller_profile_id = p_profile_id
  and so.payment_method    = 'cod'
  and so.cod_settled_at    is null
  and soi.status           in ('shipped', 'delivered')
  and soi.cod_settled_at   is null
  and so.created_at        < now() - (v_max_days || ' days')::interval;
```

If the seller has no wallet row yet (brand-new seller), they are treated as `balance = 0, cod_debt = 0` — eligible by default.

---

## `record_shop_view`

```sql
public.record_shop_view(p_username varchar) → void
```

Increments `shop_settings.total_views` for the given username. Called by Astro SSR on every shop page render — no auth required (`anon` accessible). Only increments when the shop is active (`is_active = true`).

Mirrors the `record_newsletter_post_view()` pattern.

```typescript
// In Astro shop page server-side:
await supabase.rpc('record_shop_view', { p_username: username });
// Fire-and-forget — don't await or show errors to user
```

---

## `get_shop_stats`

```sql
public.get_shop_stats() → jsonb
```

Returns the four cached stats counters for the Studio stats cards. Single PK lookup on `shop_settings` — no aggregation at call time.

### Response shape

```json
{
  "success": true,
  "total_views": 1240,
  "total_sales": 87,
  "total_earnings": 48200.00,
  "total_products": 6
}
```

| Field | Definition |
|---|---|
| `total_views` | All-time shop page renders (incremented by `record_shop_view`) |
| `total_sales` | Total units sold (incremented on digital fulfillment + physical delivery) |
| `total_earnings` | Total settled `seller_net` across all paid/COD-settled orders |
| `total_products` | Currently published (active + not-deleted) products |

::: tip Fast by design
All four values are pre-computed counters on `shop_settings`. This call costs a single index scan and is safe to call on every Studio page load.
:::

---

## `set_shop_active_by_manager`

```sql
public.set_shop_active_by_manager(
  p_profile_id uuid,
  p_is_active  boolean
) → jsonb
```

Manager-only toggle for `shop_settings.is_active`. Requires `content.moderate` permission. Bypasses the seller eligibility check that `upsert_shop_settings` enforces, so managers can force-suspend or reinstate a shop from the admin panel without the seller needing to resolve COD aging or wallet floor issues first.

Sets `deactivation_reason = 'manual'` when deactivating; clears it when reactivating.

**Response:** `{ "success": true }` or `{ "success": false, "error": "UNAUTHORIZED" | "NOT_FOUND" }`

```typescript
// Admin panel usage:
await supabase.rpc('set_shop_active_by_manager', {
  p_profile_id: targetSellerId,
  p_is_active: false,  // suspend
});
```

---

## Internal checkout helpers

These three exist to stop the same logic being written twice. All are `security
definer` and granted to **no client role** — they are called only from other
security-definer RPCs.

### `shop_calculate_cart`

```sql
public.shop_calculate_cart(
  p_items          jsonb,
  p_inside_dhaka   boolean default null,
  p_is_gift        boolean default false,
  p_payment_method shop_payment_method_enum default 'online',
  p_is_guest       boolean default false,
  p_buyer_id       uuid    default null
) → jsonb
```

The single source of truth for what a cart costs. Validates every line (stock,
seller consistency, COD eligibility, variant match), applies flash-sale pricing,
the bundle offer, gift wrap, per-item shipping and per-item platform fees — and
creates nothing.

Both [`estimate_shop_checkout`](./rpc-checkout) and
[`initiate_shop_checkout`](./rpc-checkout) call it, which is the whole point: the
total quoted on the delivery-info step and the total actually charged come from
the same code path and cannot drift. **Do not reimplement any of this logic in
either caller.**

Returns `{success:false, error}` using the same error codes
`initiate_shop_checkout` surfaces, or `{success:true, …totals, items:[…]}`.
`p_inside_dhaka` may be `NULL` when the buyer has not picked an address yet; a cart
containing physical items then returns `SHIPPING_ADDRESS_REQUIRED`.

::: warning It trusts `p_buyer_id`
The function does not read `auth.uid()` — callers pass the already-authenticated
buyer id, or `NULL` for a guest. That is why it is granted to no client role: a
direct caller could pass any id. There is a pgTap assertion pinning this.
:::

---

### `shop_order_detail`

```sql
public.shop_order_detail(p_order_id uuid, p_is_buyer boolean) → jsonb
```

Builds the shared order-detail payload for
[`get_order_by_number`](./rpc-orders) and [`get_guest_order`](./rpc-orders), so the
account view and the guest view cannot drift apart. Composes
`payment_status_label`, `confirmed_at`, `area_type` and the per-item processing
window that the confirmation timeline renders from.

::: danger It performs no authorization of its own
Callers must already have established that the viewer may see the order.
`get_order_by_number` does it with the buyer/seller predicate;
`get_guest_order` does it with the normalized phone match. Granted to no client
role, with a pgTap assertion pinning that.
:::

---

### `normalize_bd_phone`

```sql
public.normalize_bd_phone(p_phone varchar) → text
```

Strips non-digits, then the optional `88` country code and leading `0`, leaving the
bare subscriber digits — so `01712345678`, `+8801712345678`, `8801712345678` and
`017 1234 5678` all compare equal.

Used wherever a guest's phone acts as a credential (`get_guest_order`,
`get_shop_order_for_payment`). Without it, guests get spurious `NOT_FOUND` /
`NOT_ORDER_OWNER` on their own orders simply for typing their number in a different
format. Returns `NULL` for `NULL` input, so callers can rely on `is distinct from`.
Granted to `anon, authenticated` (it is a pure string function with no data access).
