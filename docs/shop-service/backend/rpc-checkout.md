# Checkout & Payments RPCs

```mermaid
flowchart LR
    subgraph "Pre-Checkout (Public)"
        A[get_shop_by_username] --> B[Shop Landing]
        C[get_product_by_slug] --> D[Product Detail]
        E[get_shop_products] --> E
    end
    
    subgraph "Checkout Flow"
        F["initiate_shop_checkout"] --> G{Payment Method}
        G -->|online| H[Create Order<br/>status=pending]
        G -->|cod| I[Create Order<br/>status=processing]
    end
    
    subgraph "Online Payment"
        H --> J[SSLCommerz Gateway]
        J --> K[IPN Webhook]
        K --> L[handle_shop_payment_success]
        L --> M[Digital: fulfilled<br/>Tokens created]
        L --> N[Physical: processing<br/>Stock decremented]
    end
    
    subgraph "COD Flow"
        I --> O[Seller Ship]
        O --> P[update_tracking]
        P --> Q[mark_delivered]
Q --> R[confirm_cod_cash]
```

Four RPCs handle the money side of the shop: `estimate_shop_checkout` quotes the cart before anything is created, `initiate_shop_checkout` creates the order, `get_shop_order_for_payment` hands the marketing app the order's real total right before it opens an SSLCommerz session (so the charged amount is never client-supplied), and `handle_shop_payment_success` finalises the order for online payments — re-validating that the amount actually charged matches the order's real total, then booking the money into the ledger. COD orders skip the last two steps entirely.

::: tip Guest checkout
Checkout works without an account. A guest supplies `p_guest_name` + `p_guest_phone`
(email optional) plus an inline address; the resulting order has
`buyer_profile_id = NULL`. Guests cannot buy **digital** goods, because download
tokens are keyed to a profile. They read their order back through
[`get_guest_order`](./rpc-orders), using their phone as the credential.
:::

::: info The quoted total and the charged total come from the same code
`estimate_shop_checkout` and `initiate_shop_checkout` both delegate to the internal
`shop_calculate_cart` helper, which owns every price, discount, shipping fee and
platform fee in one place. Never reimplement any of that logic in a caller — if the
two ever diverge, the buyer sees one number and is charged another.
:::

## Public read RPCs (called before checkout)

### `get_shop_by_username`

```sql
public.get_shop_by_username(
  p_username       varchar,
  p_featured_limit integer default 6
) → jsonb
```

Public (anon). Returns shop config, profile info, and up to `p_featured_limit` featured products. Used by the Astro shop landing page and the profile card widget.

```json
{
  "success": true,
  "shop": {
    "shop_name": "Brew & Co.",
    "shop_description": "Specialty coffee roasted weekly",
    "logo_url": "...",
    "theme_config": { "primary": "#6f4e37" },
    "seo_title": "Brew & Co. — Specialty Coffee"
  },
  "profile": { "username": "brewco", "display_name": "Brew & Co.", "avatar_url": "..." },
  "featured_products": [ ... ]
}
```

---

### `get_shop_products`

```sql
public.get_shop_products(
  p_username    varchar,
  p_category_id uuid    default null,
  p_sort        text    default 'curated',
  p_limit       integer default 12,
  p_cursor      jsonb   default null
) → jsonb
```

Keyset-paginated. **Revoked from `anon`** — reached through the Astro SSR/action
layer on the service-role client, not from the browser.
`p_sort` is one of `curated` (default) | `popular` |
`newest` | `price_asc` | `price_desc`; anything else returns `INVALID_SORT`.
`p_cursor` is the opaque `{ sort, v, id }` object handed back as `next_cursor` — pass
it back verbatim and never construct one client-side. A cursor minted under a
different sort mode returns `CURSOR_SORT_MISMATCH`, so reset pagination to page 1
whenever sort or category changes.

```json
{
  "success": true,
  "products": [ ... ],
  "has_more": true,
  "next_cursor": { "sort": "curated", "v": 3, "id": "…uuid…" }
}
```

See [Storefront](../frontend/storefront) for the client-side cursor rules and
[RPC Reference](./rpc-reference) for the full parameter table.

---

### `get_product_by_slug`

```sql
public.get_product_by_slug(p_username varchar, p_product_slug varchar) → jsonb
```

Public. Returns the full product detail including `option_definitions`, variants (with `options` JSONB), file metadata, and all shipping/COD fields.

```json
{
  "success": true,
  "product": {
    "id": "...",
    "title": "Single-Origin Ethiopia Yirgacheffe",
    "product_type": "physical",
    "price": 850,
    "option_definitions": [
      { "name": "Grind",  "values": ["Whole Bean", "Coarse", "Medium", "Fine"] },
      { "name": "Weight", "values": ["250g", "500g"] }
    ],
    "shipping_fee_inside_dhaka": 60,
    "shipping_fee_outside_dhaka": 120,
    "processing_min_days": 1,
    "processing_max_days": 2,
    "cod_enabled": true,
    "variants": [
      { "id": "...", "options": {"Grind":"Whole Bean","Weight":"250g"}, "price_adjustment": 0, "stock_count": 12 },
      { "id": "...", "options": {"Grind":"Whole Bean","Weight":"500g"}, "price_adjustment": 200, "stock_count": 8 }
    ],
    "files": []
  }
}
```

---

## `estimate_shop_checkout`

```sql
public.estimate_shop_checkout(
  p_items          jsonb,
  p_address_id     uuid    default null,
  p_district       varchar default null,
  p_district_id    integer default null,
  p_is_gift        boolean default false,
  p_payment_method shop_payment_method_enum default 'online',
  p_coupon_code    varchar default null
) → jsonb
```

Granted to `anon, authenticated`. Prices a cart **without creating anything**, so
the cart and delivery-info steps can show an accurate running total. Because it
shares `shop_calculate_cart` with `initiate_shop_checkout`, the numbers it returns
are the numbers that will be charged.

The shipping band is resolved from `p_address_id` (ownership-checked against
`auth.uid()`), then `p_district_id`, then a bare `p_district` name — in that order
of precedence.

It doubles as **cart validation**: it surfaces `PRODUCT_NOT_FOUND`,
`INSUFFICIENT_STOCK`, `MIXED_SELLERS`, `SELLER_COD_BLOCKED`,
`GUEST_DIGITAL_NOT_ALLOWED` and the rest before the buyer ever reaches payment.

::: warning `SHIPPING_ADDRESS_REQUIRED` is the normal state on the cart step
With no district supplied, a cart containing physical items returns
`SHIPPING_ADDRESS_REQUIRED`. On the cart page that is expected — render it as
"shipping calculated at checkout", not as an error.
:::

```json
{
  "success": true,
  "subtotal": 200.00,
  "shipping_total": 120.00,
  "gift_wrap_fee": 0,
  "bundle_discount": 0,
  "coupon_id": null,
  "coupon_code": null,
  "coupon_discount": 0,
  "total": 320.00,
  "platform_fee": 16.00,
  "seller_net": 304.00,
  "area_type": "inside_dhaka",
  "items": [ { "product_title": "…", "unit_price": 100, "shipping_cost": 60, "quantity": 2, "cover_image_url": "…" } ]
}
```

---

## `initiate_shop_checkout`

```sql
public.initiate_shop_checkout(
  p_items          jsonb,
  p_address_id     uuid    default null,
  p_buyer_notes    text    default null,
  p_payment_method shop_payment_method_enum default 'online',
  p_is_gift              boolean default false,
  p_gift_recipient_name  varchar default null,
  p_gift_recipient_email varchar default null,
  p_gift_message         varchar default null,
  -- Guest checkout (required together when there is no auth.uid())
  p_guest_name           varchar default null,
  p_guest_phone          varchar default null,
  p_guest_email          varchar default null,
  -- Inline one-off address, used when p_address_id is null
  p_recipient_name       varchar default null,
  p_phone                varchar default null,
  p_address_line1        varchar default null,
  p_address_line2        varchar default null,
  p_city                 varchar default null,
  p_district             varchar default null,
  p_postal_code          varchar default null,
  p_division_id          integer default null,
  p_district_id          integer default null,
  p_upazilla_id          integer default null,
  p_coupon_code          varchar default null
) → jsonb
```

The primary checkout RPC. Creates `shop_orders` and `shop_order_items` in one transaction. Granted to `anon, authenticated` — guest checkout happens before any login.

### Choosing an address

Two mutually exclusive paths:

| Path | When | Who |
|---|---|---|
| `p_address_id` | Buyer picked a saved address | Logged-in only — a guest gets `ADDRESS_NOT_FOUND` |
| Inline `p_recipient_name`/`p_phone`/`p_address_line1`/`p_city`/`p_district`… | `p_address_id` is null | Guests, **and** logged-in buyers sending a one-off address they don't want saved |

The inline path optionally takes the structured `p_division_id` / `p_district_id` /
`p_upazilla_id` chain, validated exactly as `upsert_user_address` validates it
(`INVALID_DIVISION` / `INVALID_DISTRICT` / `INVALID_UPAZILLA`). When
`p_district_id` is given, the free-text district is denormalised from
`districts.name`, so the inside/outside-Dhaka check behaves identically on both
paths.

### Guest checkout

When there is no `auth.uid()`:

- `p_guest_name` and `p_guest_phone` are **required** (`MISSING_GUEST_INFO`).
- `p_guest_email` is optional but shape-checked (`INVALID_GUEST_EMAIL`).
- Any digital item is rejected (`GUEST_DIGITAL_NOT_ALLOWED`) — `shop_download_tokens.buyer_profile_id` is `NOT NULL`, so there is nowhere to hang the token. Rejecting here keeps the failure *before* payment rather than inside the IPN.
- The response carries **`gateway_email`**: a throwaway address (`guest-<digits>@noemail.hobenaki.internal`) for guests who gave no email, purely to satisfy `sslcommerz-init`'s mandatory `cus_email`. It is never stored on the order and never used for notifications — `shop_orders.guest_email` stays genuinely `NULL`.

### Item format

```json
{
  "p_items": [
    { "product_id": "uuid", "variant_id": "uuid", "quantity": 2 },
    { "product_id": "uuid", "quantity": 1 }
  ]
}
```

### What it validates (in order)

1. **Guest details** — with no `auth.uid()`, name + phone required (`MISSING_GUEST_INFO`)
2. **Address** — resolved up front, because the shipping band feeds every physical line
3. **Cart not empty** — `jsonb_array_length(p_items) > 0`
4. **Products exist** — each `product_id` must be active and not deleted
5. **Single seller** — all items must be from the same creator (`MIXED_SELLERS`)
6. **Not own product** — buyer cannot buy their own product
7. **No digital for guests** — `GUEST_DIGITAL_NOT_ALLOWED`
8. **COD rules** (when `p_payment_method = 'cod'`):
   - All items must be physical (`COD_NOT_ALLOWED_FOR_DIGITAL`)
   - All items must have `cod_enabled = true` (`MIXED_COD_AND_NON_COD`)
   - Seller must be eligible right now (`SELLER_COD_BLOCKED`)
9. **Variant match** — if `variant_id` provided, must belong to that product
10. **Stock** — quantity ≤ available stock
11. **Shipping band known** — physical items with no resolved district give `SHIPPING_ADDRESS_REQUIRED`

Steps 3–11 all live in `shop_calculate_cart`, which is why
`estimate_shop_checkout` reports the identical set of errors.

::: danger The self-purchase check must stay NULL-safe
`v_product.profile_id = v_buyer_id` evaluates to `NULL` on a guest checkout, which
is *not* a rejection — a seller could quietly buy their own product as a guest and
inflate `sales_count` and flash-sale stats. The guard is written as
`p_buyer_id is not null and v_product.profile_id = p_buyer_id`. The same NULL-safety
trap applies anywhere `buyer_profile_id` is compared; see
`get_shop_order_for_payment` below.
:::

### How shipping fee is picked

```sql
v_inside_dhaka := (lower(district) = 'dhaka');

v_item_shipping := case
  when v_inside_dhaka then product.shipping_fee_inside_dhaka
  else product.shipping_fee_outside_dhaka
end;
```

The resolved band is recorded on the `shipping_address` JSONB snapshot as
`area_type` (`inside_dhaka` | `outside_dhaka`), so no reader ever has to re-derive
it by string-matching the district.

### Snapshots taken at checkout

Alongside `unit_price` and `shipping_cost`, `shop_order_items` snapshots the
seller's `processing_min_days` / `processing_max_days`. The confirmation-page
timeline reads those, so editing a product's processing window later never
retroactively changes an existing order's promised dates.

### Platform fee calculation

Fees are computed **per item** based on `product_type` and whether the seller holds an active platform subscription for that service:

::: danger `unit_price` is the sale-aware effective price, not `shop_products.price`
Each cart item's `unit_price` is resolved through `shop_product_pricing()` — the same
helper every storefront read RPC uses — before the variant `price_adjustment` is
added. Reading `shop_products.price` directly here would charge full price for a
product with a live flash sale, so the displayed price and the charged price cannot
diverge. Prices are always re-resolved server-side, so a stale client cart can
neither lock in an expired sale price nor miss a newly started one.
:::

```sql
-- Per item in the cart:
v_item_fee_rate := public.get_creator_effective_fee_rate(
  seller_id,
  CASE product_type
    WHEN 'digital'  THEN 'shop_digital'   -- default 10%
    WHEN 'physical' THEN 'shop_physical'  -- default 5%
  END
);
-- Returns 0 if seller has an active creator_platform_subscriptions row for that service.

v_item_fee     := round((unit_price + shipping_cost) * quantity * v_item_fee_rate, 2);
v_platform_fee += v_item_fee;  -- accumulated across all items

v_seller_net   := (subtotal + shipping_total) - v_platform_fee;
```

The per-item rate is snapshotted on `shop_order_items.platform_fee_rate`. For same-type orders (all-digital or all-physical), `shop_orders.platform_fee_rate` is set to that rate. For mixed orders it is `NULL` — the source of truth is always the item-level column.

### Bundle offer (auto-applied)

Driven by `shop_settings.promotions_config.bundle_offer` (`{ enabled, min_items, extra_discount_percent }`). During validation, the RPC counts the cart's quantity-weighted number of items that are currently on an **active flash sale** (`sale_price` set and `now()` inside `[sale_starts_at, sale_ends_at)`). If `bundle_offer.enabled` and that count meets `min_items`, `extra_discount_percent` is stacked on top of the flash price for those flash-sale items only — `shop_order_items.unit_price` reflects the fully-discounted price directly, and the total extra amount saved is recorded on `shop_orders.bundle_discount` (informational, for receipts/order views — it does not need to be subtracted again anywhere, `subtotal` already reflects it).

### Coupons

Seller-created coupon codes, layered **on top of** flash-sale pricing and the bundle
offer (in that order — coupon is the last price adjustment before shipping/subtotal
totals are struck). The actual definition, validation and redemption bookkeeping
lives in a service-agnostic core, [`coupons.sql`](../../coupons/backend/index) — this
RPC only supplies `p_coupon_code`, shop-specific first-time-buyer detection, and
folds the result into shop's own pricing.

```sql
-- p_coupon_code, threaded through to shop_calculate_cart, which:
--  1. looks up + validates the code via public.validate_coupon()
--  2. applies the discount per its applies_to:
```

| `applies_to` | Effect |
|---|---|
| `order_total` | Percent/fixed off the whole subtotal, pro-rated back into each line's `unit_price` (and platform fee recomputed per line) so `unit_price` stays the source of truth — same invariant `bundle_discount` already keeps. |
| `line_items` | Only lines the seller explicitly targeted (via `coupon_targets`, `target_type='shop_product'`) are discounted. A cart with zero matching lines returns `COUPON_NO_ELIGIBLE_ITEMS`. |
| `fee` | Percent/fixed off `shipping_total` directly. |

`shop_orders.coupon_id`/`coupon_discount` record which coupon and how much —
informational only, exactly like `bundle_discount`: the discount is already netted
into the stored `subtotal`/`shipping_total`, so `handle_shop_payment_success`'s
`AMOUNT_MISMATCH` check needs **no special-case coupon math**.

::: info Redemption commit timing mirrors the stock-decrement split
COD has no payment gate, so the redemption (counter increment + audit row) commits
immediately in `initiate_shop_checkout`, right alongside the COD stock decrement.
Online orders defer the commit to `handle_shop_payment_success` — otherwise an
abandoned SSLCommerz session could burn a limited-use coupon without ever paying.
:::

Error codes: `COUPON_NOT_FOUND`, `COUPON_NOT_YET_ACTIVE`, `COUPON_EXPIRED`,
`COUPON_LIMIT_REACHED` (total or per-buyer redemption cap), `COUPON_MIN_ORDER_NOT_MET`,
`COUPON_FIRST_TIME_ONLY`, `COUPON_NO_ELIGIBLE_ITEMS`.

First-time-buyer detection is shop-specific (the generic core has no notion of a
shop's own orders table): an `EXISTS` check against `shop_orders` scoped to
`seller_profile_id`, counting only *committed* orders (COD, or online with
`transaction_reference_id` set) so an abandoned checkout never disqualifies a later
attempt. It is per-shop, not platform-wide — a buyer's first order with *this*
seller, regardless of purchase history elsewhere.

### Gift checkout

Pass `p_is_gift = true` with `p_gift_recipient_email` (required, shape-validated) and optionally `p_gift_recipient_name` / `p_gift_message`. Requires the seller's `shop_settings.promotions_config.gift.enabled` (else `GIFT_NOT_AVAILABLE`). `gift_wrap_fee` is read from `promotions_config.gift.wrap_fee` and charged as a flat per-order amount — folded into the response `total` (and into the amount `get_shop_order_for_payment`/`handle_shop_payment_success` validate), never into `shipping_total`.

Delivery to the recipient is **email-only** — there is no recipient account or claim flow:

- **Physical** items ship to `p_address_id` as normal — `user_addresses` already carries a `recipient_name`/`phone` distinct from the buyer, so the buyer picks/creates an address for the recipient like any "ship to someone else" address.
- **Digital** items are delivered via the same service-role-only `shop_download_tokens` mechanism used for a regular buyer (no login required to redeem), just emailed to the recipient instead.
- For **COD** orders (always physical-only, since COD forbids digital items) the confirmation email is queued immediately in `initiate_shop_checkout`. For **online** orders it's deferred to `handle_shop_payment_success`, once payment is actually confirmed. Both paths enqueue a direct-enqueue row into `public.email_notification_queue` — see [Email Notifications](../../email-notifications/backend/index) for that outbox.

### Online vs COD branching

| | Online | COD |
|---|---|---|
| Initial item status | `pending` | `processing` |
| Stock decremented | Later (in `handle_shop_payment_success`) | **At checkout** |
| Transaction row | Later (after IPN) | Later (after cash confirmed) |
| Address required | Only if physical | Yes (physical only) |

### Response

```json
{
  "success": true,
  "id": "uuid",
  "order_number": "HNC-2001",
  "payment_method": "online",
  "is_guest": true,
  "gateway_email": "guest-1712345678@noemail.hobenaki.internal",
  "subtotal": 1700.00,
  "shipping_total": 120.00,
  "gift_wrap_fee": 0,
  "bundle_discount": 0,
  "total": 1820.00,
  "platform_fee": 182.00,
  "seller_net": 1638.00
}
```

Order numbers are sequential `HNC-XXXX`, drawn from `public.shop_order_number_seq`
(zero-padded to four digits, starting at 2000). Orders created before this format
keep their old `SHOP-YYYYMMDD-XXXX` numbers; nothing looks up an order by format.

For online orders, the frontend takes `order_number`, creates an SSLCommerz session with the `total`, and redirects the user. For COD, navigate directly to the confirmation page — no gateway needed.

**Errors:** `UNAUTHORIZED`, `MISSING_GUEST_INFO`, `INVALID_GUEST_EMAIL`, `GUEST_DIGITAL_NOT_ALLOWED`, `EMPTY_CART`, `PRODUCT_NOT_FOUND`, `VARIANT_NOT_FOUND`, `INSUFFICIENT_STOCK`, `MIXED_SELLERS`, `CANNOT_BUY_OWN_PRODUCT`, `SHIPPING_ADDRESS_REQUIRED`, `ADDRESS_NOT_FOUND`, `INVALID_DIVISION`, `INVALID_DISTRICT`, `INVALID_UPAZILLA`, `COD_NOT_ALLOWED_FOR_DIGITAL`, `MIXED_COD_AND_NON_COD`, `SELLER_COD_BLOCKED`, `INVALID_QUANTITY`, `GIFT_NOT_AVAILABLE`, `INVALID_GIFT_RECIPIENT`

---

## `get_shop_order_for_payment`

```sql
public.get_shop_order_for_payment(
  p_order_id    uuid,
  p_guest_phone varchar default null
) → jsonb
```

Called by the marketing app's `initiatePayment` action before starting an SSLCommerz session, so the charged amount is always the order's real stored total — never a client-supplied value. Granted to `anon, authenticated`, since a guest must be able to pay without a session.

::: danger Ownership is an explicit two-branch check, never `is distinct from`
This was previously `if v_order.buyer_profile_id is distinct from v_user_id`. That
operator is NULL-safe, so on a **guest** order (buyer `NULL`) called by an
**anonymous** caller (`auth.uid()` `NULL`) it evaluates to *false* — the check
passes, handing any unauthenticated caller who holds an order UUID that order's
financials. It is now:

```sql
if v_order.buyer_profile_id is not null then
  -- account order: must match auth.uid()
else
  -- guest order: p_guest_phone must match, compared via normalize_bd_phone
end if;
```

Do not "simplify" this back into a single NULL-safe comparison.
:::

### What it does

1. Fetches the order by `p_order_id`.
2. Confirms ownership — account orders against `auth.uid()`, guest orders against `p_guest_phone` (`NOT_ORDER_OWNER` otherwise).
3. Rejects COD orders (`COD_ORDER_INVALID_PATH`) — they never go through SSLCommerz.
4. Rejects orders that already have a `transaction_reference_id` (`ALREADY_PAID`).
5. Returns the order's real `subtotal`/`shipping_total`/`gift_wrap_fee` for the caller to build the SSLCommerz session amount from — the caller must charge the sum of all three.

### Response

```json
{
  "success": true,
  "subtotal": 1700.00,
  "shipping_total": 120.00,
  "gift_wrap_fee": 0
}
```

**Errors:** `ORDER_NOT_FOUND`, `NOT_ORDER_OWNER`, `COD_ORDER_INVALID_PATH`, `ALREADY_PAID`

---

## `handle_shop_payment_success`

```sql
public.handle_shop_payment_success(
  p_order_id                 uuid,
  p_transaction_reference_id uuid,
  p_amount                   numeric(10,2)
) → jsonb
```

Called by the SSLCommerz IPN Edge Function after payment is confirmed. **Never call this for COD orders** — it returns `COD_ORDER_INVALID_PATH`.

### What it does

1. **Idempotency check** — if `transaction_reference_id` is already set on the order, returns `{ "idempotent": true }` immediately. Safe to call multiple times from the IPN webhook.

2. **Authoritative amount check** — raises `AMOUNT_MISMATCH` if `p_amount` (the amount actually charged via SSLCommerz) doesn't equal the order's `subtotal + shipping_total + gift_wrap_fee`. This runs before any fulfillment side-effect, so a mismatch aborts cleanly instead of fulfilling at the wrong price.

3. **Books the money** — calls `process_service_payment`, which credits the seller's wallet and writes the supporter/creator `public.transactions` pair. `shop_orders.transaction_reference_id` is then set to the **creator-side** `reference_id` it mints — the row carrying `platform_fee`.

::: danger The ledger call is required, not bookkeeping polish
`shop_orders.transaction_reference_id` is FK-constrained to
`transactions(reference_id)`. Before this existed, the IPN wrote the
`payment_sessions.id` into that column with no matching `transactions` row, so
**every online shop payment violated the FK and aborted after SSLCommerz had
already taken the money** — and the seller was never credited. (The pgTap suite
hid this by hand-inserting a `transactions` row to satisfy the FK.)

The ledger amount is `subtotal + shipping_total`, deliberately **excluding**
`gift_wrap_fee` — that is a platform-side charge and is excluded from `seller_net`
too, so `net_amount` equals the stored `seller_net` exactly. `p_transaction_reference_id`
is the `payment_sessions.id`; it is recorded as the provider transaction id and is
*not* what lands on the order.
:::

Guest orders pass `p_supporter_profile_id => NULL`, which `handle_successful_payment` already supports (its anonymous-supporter path). The supporter identity hash is derived from the guest's phone, so a repeat guest buyer coalesces into one supporter row for the seller instead of a new one per order.

4. **Per-item branching:**

   | Item type | Actions |
   |---|---|
   | Digital | Creates download tokens for each file, marks status `fulfilled`, increments `sales_count` |
   | Physical | Marks status `processing` |

5. **Decrements stock** — for both digital and physical items

6. **Gift email (when `is_gift = true`)** — queues one direct-enqueue row into `public.email_notification_queue` (`service_type = 'shop_gift'`, template `shop.gift_received`) addressed to `gift_recipient_email`. Digital download links are built here from the `edge_function_base_url` Vault secret plus the same tokens just issued to the buyer above, so the recipient gets working links without ever needing an account.

### Download token creation

```sql
-- Token = 64-char crypto-random (two UUID4s concatenated, hyphens stripped)
v_token := replace(gen_random_uuid()::text, '-', '')
        || replace(gen_random_uuid()::text, '-', '');
v_token := substring(v_token, 1, 64);

insert into shop_download_tokens (
  order_item_id, file_id, buyer_profile_id,
  token, max_downloads, expires_at
)
select
  item.id, file.id, order.buyer_profile_id,
  v_token,
  product.max_downloads,
  now() + (product.download_expires_hours * interval '1 hour')
...
```

### Response

```json
{
  "success": true,
  "order_number": "HNC-2001",
  "has_digital": true,
  "has_physical": false,
  "download_tokens": [
    { "file_name": "recipe-book.pdf", "token": "abc123..." }
  ],
  "buyer_profile_id": "uuid",
  "seller_profile_id": "uuid"
}
```

The Edge Function uses `buyer_profile_id` and `seller_profile_id` to dispatch in-app and email notifications. On a guest order `buyer_profile_id` is `null` — there is no in-app feed to write to, so notifications go out as external email instead (see [Orders](./rpc-orders)).

**Errors:** `ORDER_NOT_FOUND`, `COD_ORDER_INVALID_PATH`, `AMOUNT_MISMATCH` (raised as a Postgres exception, not returned as `success: false` — the IPN handler's `rpcError` branch marks the payment session `failed` for manual reconciliation)

**Errors:** `ORDER_NOT_FOUND`, `COD_ORDER_INVALID_PATH`
