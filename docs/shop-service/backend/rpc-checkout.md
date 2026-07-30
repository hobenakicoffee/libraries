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

Three RPCs handle the money side of the shop: `initiate_shop_checkout` creates the order, `get_shop_order_for_payment` hands the marketing app the order's real total right before it opens an SSLCommerz session (so the charged amount is never client-supplied), and `handle_shop_payment_success` finalises the order for online payments — re-validating that the amount actually charged matches the order's real total before doing anything else. COD orders skip the last two steps entirely.

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

## `initiate_shop_checkout`

```sql
public.initiate_shop_checkout(
  p_items          jsonb,
  p_address_id     uuid    default null,
  p_buyer_notes    text    default null,
  p_payment_method shop_payment_method_enum default 'online'
) → jsonb
```

The primary checkout RPC. Creates `shop_orders` and `shop_order_items` in one transaction.

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

1. **Auth** — `auth.uid()` must be set
2. **Cart not empty** — `jsonb_array_length(p_items) > 0`
3. **Products exist** — each `product_id` must be active and not deleted
4. **Single seller** — all items must be from the same creator (`MIXED_SELLERS`)
5. **Not own product** — buyer cannot buy their own product
6. **COD rules** (when `p_payment_method = 'cod'`):
   - All items must be physical (`COD_NOT_ALLOWED_FOR_DIGITAL`)
   - All items must have `cod_enabled = true` (`MIXED_COD_AND_NON_COD`)
   - Seller must be eligible right now (`SELLER_COD_BLOCKED`)
7. **Variant match** — if `variant_id` provided, must belong to that product
8. **Stock** — quantity ≤ available stock
9. **Address** — physical items require a valid `p_address_id`

### How shipping fee is picked

```sql
v_inside_dhaka := (lower(v_address.district) = 'dhaka');

v_item_shipping := case
  when v_inside_dhaka then product.shipping_fee_inside_dhaka
  else product.shipping_fee_outside_dhaka
end;
```

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
  "order_id": "uuid",
  "order_number": "SHOP-20240115-A3F2",
  "payment_method": "online",
  "subtotal": 1700.00,
  "shipping_total": 120.00,
  "total": 1820.00,
  "platform_fee": 182.00,
  "seller_net": 1638.00
}
```

For online orders, the frontend takes `order_number`, creates an SSLCommerz session with the `total`, and redirects the user. For COD, navigate directly to the confirmation page — no gateway needed.

**Errors:** `UNAUTHENTICATED`, `EMPTY_CART`, `PRODUCT_NOT_FOUND`, `VARIANT_NOT_FOUND`, `INSUFFICIENT_STOCK`, `MIXED_SELLERS`, `CANNOT_BUY_OWN_PRODUCT`, `SHIPPING_ADDRESS_REQUIRED`, `ADDRESS_NOT_FOUND`, `COD_NOT_ALLOWED_FOR_DIGITAL`, `MIXED_COD_AND_NON_COD`, `SELLER_COD_BLOCKED`, `INVALID_QUANTITY`

---

## `get_shop_order_for_payment`

```sql
public.get_shop_order_for_payment(p_order_id uuid) → jsonb
```

Called by the marketing app's `initiatePayment` action before starting an SSLCommerz session, so the charged amount is always the order's real stored total — never a client-supplied value.

### What it does

1. Fetches the order by `p_order_id`.
2. Confirms the caller is the order's buyer (`NOT_ORDER_OWNER` otherwise).
3. Rejects COD orders (`COD_ORDER_INVALID_PATH`) — they never go through SSLCommerz.
4. Rejects orders that already have a `transaction_reference_id` (`ALREADY_PAID`).
5. Returns the order's real `subtotal`/`shipping_total` for the caller to build the SSLCommerz session amount from.

### Response

```json
{
  "success": true,
  "subtotal": 1700.00,
  "shipping_total": 120.00
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

2. **Authoritative amount check** — raises `AMOUNT_MISMATCH` if `p_amount` (the amount actually charged via SSLCommerz) doesn't equal the order's `subtotal + shipping_total`. This runs before any fulfillment side-effect, so a mismatch aborts cleanly instead of fulfilling at the wrong price.

3. **Links transaction** — sets `shop_orders.transaction_reference_id`

4. **Per-item branching:**

   | Item type | Actions |
   |---|---|
   | Digital | Creates download tokens for each file, marks status `fulfilled`, increments `sales_count` |
   | Physical | Marks status `processing` |

5. **Decrements stock** — for both digital and physical items

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
  "order_number": "SHOP-20240115-A3F2",
  "has_digital": true,
  "has_physical": false,
  "download_tokens": [
    { "file_name": "recipe-book.pdf", "token": "abc123..." }
  ],
  "buyer_profile_id": "uuid",
  "seller_profile_id": "uuid"
}
```

The Edge Function uses `buyer_profile_id` and `seller_profile_id` to dispatch in-app and email notifications.

**Errors:** `ORDER_NOT_FOUND`, `COD_ORDER_INVALID_PATH`, `AMOUNT_MISMATCH` (raised as a Postgres exception, not returned as `success: false` — the IPN handler's `rpcError` branch marks the payment session `failed` for manual reconciliation)

**Errors:** `ORDER_NOT_FOUND`, `COD_ORDER_INVALID_PATH`
