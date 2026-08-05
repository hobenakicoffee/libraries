# Coupons — Backend Reference

Service-agnostic coupon core: definitions, per-target scoping, and redemption
bookkeeping, usable by any service — consumed by shop checkout today, designed for
other services (memberships, etc.) to adopt later without schema changes to this
module. Lives in `supabase/schemas/coupons.sql`.

::: info Generic core, not shop-specific
This module has **no knowledge** of shop's tables (`shop_products`, `shop_orders`).
A consuming service integrates by calling its RPCs from its own checkout code, doing
its own target-eligibility and first-time-buyer checks (only the service knows what
those mean for its own domain), and folding the returned discount into its own
stored pricing columns. See [shop-service's checkout doc](../../shop-service/backend/rpc-checkout)
for the concrete integration.
:::

## Tables

### `coupons`

| Column | Type | Notes |
|---|---|---|
| `profile_id` | uuid → profiles(id) | The seller/owner — service-agnostic |
| `service_type` | varchar(50) | Which service owns this row (e.g. `'shop'`). A plain tag, not FK'd — matches the `transactions.service_type` convention used elsewhere in this codebase for the same purpose |
| `code` | varchar(30) | Unique per `(profile_id, service_type)`, **not globally** — different sellers/services may reuse the same code string |
| `discount_type` | `coupon_discount_type_enum` | `percent` \| `fixed_amount` |
| `discount_value` | numeric | Percent: 0–100 (constraint-enforced). Fixed: currency amount |
| `applies_to` | `coupon_applies_to_enum` | `order_total` \| `line_items` \| `fee` — generic vocabulary; each service maps its own concepts onto these three (shop: subtotal/products/shipping) |
| `max_discount_amount` | numeric | Caps a percent discount; percent-only (constraint) |
| `min_order_amount` | numeric | Checked against the caller's pre-discount order amount |
| `max_redemptions` | integer | Total across all buyers; null = unlimited |
| `max_redemptions_per_buyer` | integer | Default 1 |
| `redemption_count` | integer | Maintained by `reserve_coupon_redemption()`, never written directly |
| `first_time_buyer_only` | boolean | Enforced against a caller-supplied boolean — see `validate_coupon` below |
| `starts_at` / `ends_at` | timestamptz | `ends_at` null = no expiry |
| `is_active` | boolean | Seller on/off toggle, independent of window/limits |

### `coupon_targets`

Polymorphic join table for `applies_to='line_items'` coupons: `coupon_id`,
`target_type` (e.g. `'shop_product'`), `target_id`. **Not FK'd** — the owning
service's RPC (e.g. shop's `upsert_shop_coupon`) validates `target_id` against its
own table before writing here.

### `coupon_redemptions`

Audit trail of committed usage: `coupon_id` (on delete restrict — history survives
cleanup), `service_type`, `order_id` (**not FK'd**, references the owning service's
own order table), `buyer_profile_id` / `guest_identifier`, `discount_amount`. Unique
on `(service_type, order_id, coupon_id)` — makes redemption commits idempotent
against retries (e.g. a payment-webhook retry).

## RLS

All three tables: `revoke all from anon`; `select` for the coupon's owner
(`profile_id = auth.uid()`, joined through for the child tables) or a manager
(`transactions.view`); **all writes blocked** (`with check (false)`) — mutations are
RPC-only. Coupon codes are deliberately **not** publicly select-able (unlike
`shop_products`), so a shop's coupon catalog can't be enumerated by querying the
table directly — validation happens exclusively through each service's own
checkout RPCs, which are `security definer`.

## RPCs

All three are internal helpers (fully revoked from `public`/`anon`/`authenticated`)
— called only from within another service's own `security definer` checkout RPC,
never directly by a client.

### `validate_coupon`

```sql
public.validate_coupon(
  p_profile_id           uuid,
  p_service_type         varchar,
  p_code                 varchar,
  p_order_amount         numeric default null,
  p_buyer_profile_id     uuid    default null,
  p_guest_identifier     varchar default null,
  p_is_first_time_buyer  boolean default null
) → jsonb
```

Checks existence, `is_active`, window, total + per-buyer redemption limits (via
`coupon_redemptions`), `min_order_amount`, and `first_time_buyer_only` — trusting
the caller-supplied `p_is_first_time_buyer` rather than querying any service's own
orders table itself. Returns `{success:false, error}` (`COUPON_NOT_FOUND`,
`COUPON_NOT_YET_ACTIVE`, `COUPON_EXPIRED`, `COUPON_LIMIT_REACHED`,
`COUPON_MIN_ORDER_NOT_MET`, `COUPON_FIRST_TIME_ONLY`) or the coupon row as jsonb.
Does **not** check per-target eligibility for `applies_to='line_items'` — the
calling service does that itself via `coupon_targets`.

### `compute_coupon_discount`

```sql
public.compute_coupon_discount(
  p_discount_type       coupon_discount_type_enum,
  p_discount_value      numeric,
  p_max_discount_amount numeric,
  p_base_amount         numeric
) → numeric
```

Pure percent/fixed-amount math, clamped to `p_base_amount` and (for percent)
`p_max_discount_amount`. Never returns negative or more than `p_base_amount`.

### `reserve_coupon_redemption`

```sql
public.reserve_coupon_redemption(
  p_coupon_id          uuid,
  p_service_type       varchar,
  p_order_id           uuid,
  p_discount_amount    numeric,
  p_buyer_profile_id   uuid    default null,
  p_guest_identifier   varchar default null,
  p_commit             boolean default true
) → jsonb
```

`p_commit = true`: atomically increments `redemption_count` within
`max_redemptions` (`update ... where redemption_count < max_redemptions returning
id` — closes the classic estimate-vs-insert TOCTOU race) and inserts a
`coupon_redemptions` row, `on conflict (service_type, order_id, coupon_id) do
nothing`. If the insert is a no-op (retry), the counter increment is rolled back so
a retry never double-counts. `p_commit = false`: non-mutating advisory check only —
"does this coupon currently have capacity" — for a reservation-time soft check
ahead of the real commit.

**When to call which**: each service decides for itself when a purchase is
"committed" for redemption purposes — shop calls this with `p_commit=true`
immediately for COD (no payment gate) but defers to payment-success time for
online orders, mirroring how it already defers stock decrement the same way.
