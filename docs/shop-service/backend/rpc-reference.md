# All RPCs — Quick Reference

```mermaid
flowchart TB
    subgraph "Public (anon)"
        A[get_shop_by_username]
        B[get_shop_products]
        C[get_product_by_slug]
        D[get_shop_policies]
    end
    
    subgraph "Authenticated"
        E[Addresses]
        F[Settings]
        G[Products]
        H[Variants]
        I[Files]
        J[Policies]
        K[Checkout]
        L[Orders]
        M[COD]
    end
    
    subgraph "Service Role Only"
        N[handle_payment_success]
        O[auto_deactivate]
        P[topup_cod_debt]
    end
```

38 RPCs total. All are `SECURITY DEFINER` with `SET search_path = ''`. All return `jsonb` (except `get_platform_setting` which returns `numeric`, `get_user_addresses` which returns a table, and `record_shop_view` which returns `void`).

## Convention

Every write RPC returns `{ "success": true, ... }` on success or `{ "success": false, "error": "CODE" }` on failure. See the [Error Codes](#error-codes) section at the bottom.

---

## Helpers

| RPC | Auth | Returns | Detail |
|---|---|---|---|
| `get_platform_setting(p_key)` | any | `numeric` | Internal — reads `platform_settings` |
| `check_shop_active_eligibility(p_profile_id)` | any | `jsonb` | Wallet + aging eligibility check |

---

## Addresses

| RPC | Auth | Returns |
|---|---|---|
| `get_user_addresses()` | authenticated | `table` — all addresses, default first |
| `upsert_user_address(...)` | authenticated | `{ success, address_id }` |
| `delete_user_address(p_address_id)` | authenticated | `{ success }` |

---

## Shop settings

| RPC | Auth | Returns |
|---|---|---|
| [`upsert_shop_settings(...)`](./shop-settings#upsert_shop_settings) | authenticated | `{ success, shop_id }` |
| [`set_shop_active_by_manager(p_profile_id, p_is_active)`](./shop-settings#set_shop_active_by_manager) | authenticated (manager) | `{ success }` |

---

## Categories

| RPC | Auth | Returns |
|---|---|---|
| `upsert_shop_category(...)` | authenticated | `{ success, category_id }` |
| `delete_shop_category(p_category_id)` | authenticated | `{ success }` |
| `reorder_shop_categories(p_category_ids[])` | authenticated | `{ success }` |

---

## Products

| RPC | Auth | Returns |
|---|---|---|
| `upsert_shop_product(...)` | authenticated | `{ success, product_id }` |
| `submit_shop_product_for_review(p_product_id)` | authenticated | `{ success }` |
| `delete_shop_product(p_product_id)` | authenticated | `{ success, deleted: 'soft'\|'hard' }` |
| `reorder_shop_products(p_product_ids[])` | authenticated | `{ success }` |

---

## Variants

| RPC | Auth | Returns |
|---|---|---|
| `upsert_shop_product_variant(...)` | authenticated | `{ success, variant_id }` |
| `delete_shop_product_variant(p_variant_id)` | authenticated | `{ success }` |

---

## Files

| RPC | Auth | Returns |
|---|---|---|
| `add_shop_product_file(...)` | authenticated | `{ success, file_id }` |
| `delete_shop_product_file(p_file_id)` | authenticated | `{ success }` |

---

## Policies

| RPC | Auth | Returns |
|---|---|---|
| `upsert_shop_policy(p_policy_type, p_content?, p_is_enabled?)` | authenticated | `{ success, policy_id }` |
| `delete_shop_policy(p_policy_type)` | authenticated | `{ success }` |
| `get_shop_policies(p_username)` | authenticated † | `{ success, policies[] }` |

---

## Coupons

Shop-side wrappers over the generic [`coupons.sql`](../../coupons/backend/index) core
(`service_type='shop'`). See [Checkout & Payments](./rpc-checkout#coupons) for how a
coupon is validated/applied during checkout.

| RPC | Auth | Returns |
|---|---|---|
| `upsert_shop_coupon(p_code, p_discount_type, p_discount_value, p_id?, p_description?, p_applies_to?, p_product_ids?, p_max_discount_amount?, p_min_order_amount?, p_max_redemptions?, p_max_redemptions_per_buyer?, p_first_time_buyer_only?, p_starts_at?, p_ends_at?, p_is_active?)` | authenticated (owner) | `{ success, id, code }` |
| `delete_shop_coupon(p_id)` | authenticated (owner) | `{ success }` — `COUPON_ALREADY_USED` if `redemption_count > 0`; deactivate instead |

`applies_to='line_items'` requires `p_product_ids`, all owned by the caller. On
update, `coupon_targets` rows are replaced wholesale (delete-then-insert). `code` is
unique per `(profile_id, service_type)`, not globally — a duplicate under the same
shop returns `COUPON_CODE_TAKEN`.

---

## Favorites

Shop-side wrapper over the generic [`favorites.sql`](../../favorites/backend/index) core
(`service_type='shop'`, `target_type='shop_product'`).

| RPC | Auth | Returns |
|---|---|---|
| `toggle_shop_favorite(p_product_id)` | authenticated | `{ success, favorited }` — `PRODUCT_NOT_FOUND` if not active/deleted |

Unlike coupons, the generic `toggle_favorite`/`is_favorited`/`list_favorites` core is
directly `authenticated`-callable and does not validate `target_id` itself — see the
favorites doc. `toggle_shop_favorite` is the recommended entry point for shop
products: it validates the product exists and is active before delegating, which
keeps `shop_products.favorite_count` accurate. `favorite_count` is a denormalized
counter maintained by a trigger on `favorites`, following the same pattern as
`rating_count`/`sales_count`.

---

## Public reads

| RPC | Auth | Returns |
|---|---|---|
| `get_shop_storefront(p_username, p_product_limit?, p_featured_limit?, p_flash_limit?, p_include_policies?, p_viewer_id?)` | authenticated † | Whole page in one call — see below |
| `get_shop_by_username(p_username, p_featured_limit?)` | anon | `{ success, shop, profile, stats, featured_products }` |
| `get_shop_categories(p_username)` | authenticated † | `{ success, total_product_count, categories[] }` |
| `get_shop_flash_sale(p_username, p_limit?)` | authenticated † | `{ success, is_active, ends_at, max_discount_percent, products[] }` |
| `get_shop_products(p_username, p_category_id?, p_sort?, p_limit?, p_cursor?, p_viewer_id?)` | authenticated † | `{ success, products, has_more, next_cursor }` |
| `search_shop_products(p_username, p_query, p_limit?, p_offset?, p_viewer_id?)` | authenticated † | `{ success, products, has_more, next_offset }` — see [Storefront Search](./rpc-search) |
| `get_product_by_slug(p_username, p_product_slug)` | anon | `{ success, product }` |

**† Not callable by `anon`.** These have `execute` revoked from `public, anon`;
`authenticated` and `service_role` keep it. The public storefront reaches them
through the Astro SSR/action layer on the service-role client, never directly from
the browser with the publishable key. Only `get_shop_by_username` and
`get_product_by_slug` remain anon-callable.

**`p_viewer_id`** gates the `is_favorited` field (see [Favorites](#favorites)
below): only trusted when the caller is `service_role` — the SSR/action layer,
which has no user JWT so `auth.uid()` is null and must pass the logged-in viewer
explicitly. Any other caller (an `authenticated` end user invoking the RPC
directly) gets `is_favorited` computed from their own `auth.uid()` regardless of
what they pass, so `p_viewer_id` can never be used to probe another profile's
favorites. `get_product_by_slug` takes no `p_viewer_id` — it's called directly
(including by `anon`), so it always uses the caller's own `auth.uid()`.

`get_shop_storefront` composes the five RPCs above and returns
`{ shop, profile, stats, featured_products, categories, total_product_count,
flash_sale, products, has_more, next_cursor, policies }`. Use it for the Astro SSR
render — it collapses five Worker→Postgres round-trips into one and gives the page
a single consistent snapshot. Sorting, filtering and infinite scroll go through
`get_shop_products`. Its own `p_viewer_id` is forwarded straight into the embedded
`get_shop_products` call so the first page of the grid reflects the logged-in
viewer's favorites — same `service_role`-only trust rule as above.

**`p_sort`** is one of `curated` (default) | `popular` | `newest` | `price_asc` |
`price_desc`. **`p_cursor`** is the opaque `{ sort, v, id }` object returned as
`next_cursor` — pass it back verbatim; never construct one client-side. Price sorts
key on `least(price, coalesce(sale_price, price))` so the key stays IMMUTABLE and
pagination cannot skip or duplicate rows when a sale expires mid-scroll.

Text search is a **separate** RPC, `search_shop_products` — relevance ranking and keyset
pagination do not mix, which is the same reason `search_feed` stands apart from `get_feed`.
It returns the identical product shape so the storefront reuses one card component for both
the browse grid and the search grid, and it pages by `p_offset` / `next_offset` rather than a
cursor. See [Storefront Search](./rpc-search).

Every product object carries a resolved pricing block from `shop_product_pricing()`:
`{ is_on_sale, effective_price, strikethrough_price, discount_percent, sale_ends_at }`.
Render `effective_price` / `strikethrough_price` — never the raw `price`. Every
product also carries `favorite_count` (viewer-independent) and `is_favorited`
(gated by `p_viewer_id`, see above).

## Pricing & sales

| RPC | Auth | Returns |
|---|---|---|
| `shop_product_pricing(p_price, p_compare_at_price, p_sale_price, p_sale_starts_at, p_sale_ends_at)` | internal | `{ is_on_sale, effective_price, strikethrough_price, discount_percent, sale_ends_at }` |
| `set_shop_product_sale(p_product_id, p_sale_price?, p_sale_starts_at?, p_sale_ends_at?, p_clear?)` | authenticated (owner) | `{ success, product_id }` |

`set_shop_product_sale` writes straight to the live `shop_products` row, deliberately
bypassing the `shop_product_drafts` approval flow — sales are time-sensitive and a
creator cannot wait on a manager. Safe to bypass because the RPC can only ever lower
the price for a bounded window.

---

## Checkout

| RPC | Auth | Returns |
|---|---|---|
| `estimate_shop_checkout(p_items, p_address_id?, p_district?, p_district_id?, p_is_gift?, p_payment_method?, p_coupon_code?)` | **anon** + authenticated | `{ success, totals..., items }` |
| `initiate_shop_checkout(p_items, p_address_id?, p_buyer_notes?, p_payment_method?, gift…, guest…, inline address…, p_coupon_code?)` | **anon** + authenticated | `{ success, id, order_number, is_guest, gateway_email, totals... }` |
| `get_shop_order_for_payment(p_order_id, p_guest_phone?)` | **anon** + authenticated | `{ success, subtotal, shipping_total, gift_wrap_fee }` |
| `handle_shop_payment_success(p_order_id, p_transaction_reference_id, p_amount)` | service role | `{ success, download_tokens, notification fields... }` |
| `shop_calculate_cart(...)` | **none** (internal) | `{ success, totals..., items }` |

The three `anon`-callable RPCs are what make guest checkout work; each enforces its
own ownership rules internally. See [Checkout & Payments](./rpc-checkout).

---

## Orders & fulfillment

| RPC | Auth | Returns |
|---|---|---|
| `get_order_by_number(p_order_number)` | authenticated | `{ success, order }` |
| `get_guest_order(p_order_number, p_phone)` | **anon** + authenticated | `{ success, order }` |
| `shop_order_detail(p_order_id, p_is_buyer)` | **none** (internal) | `{ success, order }` |
| `normalize_bd_phone(p_phone)` | anon + authenticated | `text` |
| `get_buyer_orders(p_limit?, p_cursor?)` | authenticated | `{ success, orders, has_more }` |
| `get_seller_orders(p_item_status?, p_limit?, p_cursor?)` | authenticated | `{ success, orders, has_more }` |
| `update_order_tracking(p_order_item_id, p_tracking_number, p_carrier?, p_tracking_url?)` | authenticated | `{ success, notification fields... }` |
| `mark_order_item_delivered(p_order_item_id)` | authenticated | `{ success, requires_cash_confirmation }` |

---

## COD-specific

| RPC | Auth | Returns |
|---|---|---|
| `confirm_cod_cash_received(p_order_item_id)` | authenticated | `{ success, fee_amount, balance_debit, cod_debt_added, order_settled }` |
| `cancel_cod_order_item(p_order_item_id, p_reason)` | authenticated | `{ success }` |
| `topup_seller_cod_debt(p_profile_id, p_amount)` | service role | `{ success, debt_paid, remaining }` |

---

## Stats

| RPC | Auth | Returns |
|---|---|---|
| `get_shop_stats()` | authenticated | `{ success, total_views, total_sales, total_earnings, total_products }` |
| `record_shop_view(p_username)` | anon | `void` |

## Dashboard & cron

| RPC | Auth | Returns |
|---|---|---|
| `get_shop_overview()` | authenticated | `ShopOverviewData` |
| `auto_deactivate_ineligible_shops()` | service role | `{ success, shops_deactivated, ran_at }` |
| `cleanup_orphaned_shop_images()` | service role | `void` — deletes unreferenced `shop-images` objects |
| `cleanup_orphaned_shop_product_files()` | service role | `void` — deletes unreferenced `shop-product-files` objects |

---

## Edge Functions

These Deno-based Supabase Edge Functions handle operations that require service-role storage access and cannot run in a plain RPC.

| Function | Method | Auth | Purpose |
|---|---|---|---|
| `download-shop-file` | `GET ?token=<token>` | none (token = credential) | Validate download token → 302 redirect to signed Storage URL |

### `download-shop-file`

```
GET /functions/v1/download-shop-file?token=<64-char-token>
```

No `Authorization` header required. Calls the `redeem_shop_download_token()` RPC (service role), which validates the token and atomically increments `download_count` in a single `UPDATE ... WHERE download_count < max_downloads` statement, then redirects the client to a 60-second signed URL in the private `shop-product-files` bucket.

::: warning
**Security fix (SEC-09, 2026-06-24):** the edge function previously did a separate `SELECT` then `UPDATE` with a `.lt()` guard — under N concurrent requests, all of them could read the same pre-increment `download_count` and all pass the guard, serving more downloads than `max_downloads`. The check-and-increment is now one atomic SQL statement inside `redeem_shop_download_token()`.
:::

**Responses:**

| Status | Condition |
|---|---|
| `302` | Success — `Location` header is the signed download URL |
| `400` | `token` query param missing |
| `403` | `download_count >= max_downloads` |
| `404` | Token not found |
| `410` | `expires_at` has passed |
| `500` | Storage or DB error |

---

## Error Codes

All errors returned as `{ "success": false, "error": "CODE", ...optional details }`.

### Auth
| Code | Meaning |
|---|---|
| `UNAUTHENTICATED` | No `auth.uid()` found |

### Input validation
| Code | Meaning |
|---|---|
| `MISSING_REQUIRED_FIELDS` | Required parameter omitted on create |
| `MISSING_NAME` | Category name omitted |
| `MISSING_CONTENT` | Policy content omitted on first write |
| `INVALID_QUANTITY` | Cart item quantity ≤ 0 |
| `INVALID_AMOUNT` | `topup_seller_cod_debt` called with `p_amount ≤ 0` |
| `INVALID_STATUS_FILTER` | `get_seller_orders` given unrecognised status string |
| `INVALID_SORT` | `get_shop_products` `p_sort` is not one of the five modes |
| `CURSOR_SORT_MISMATCH` | `get_shop_products` cursor was minted under a different sort — reset pagination to page 1 |
| `INVALID_CURSOR` | `get_shop_products` cursor is missing `v` or `id` |
| `MISSING_SALE_PRICE` | `set_shop_product_sale` called without `p_sale_price` and without `p_clear` |
| `SALE_WINDOW_REQUIRED` | `set_shop_product_sale` given a sale price with no `p_sale_ends_at` — a sale must expire |
| `INVALID_SALE_WINDOW` | `set_shop_product_sale` window is inverted or already closed |
| `SALE_PRICE_NOT_BELOW_PRICE` | `set_shop_product_sale` sale price is not strictly below the list price |

### Not found
| Code | Meaning |
|---|---|
| `NOT_FOUND` | Resource doesn't exist or belongs to another user |
| `PRODUCT_NOT_FOUND` | Cart item references inactive/deleted product, or `toggle_shop_favorite` given a `p_product_id` that isn't active/deleted |
| `VARIANT_NOT_FOUND` | Cart item references unknown variant |
| `ADDRESS_NOT_FOUND` | Checkout address not found for this buyer, or a guest passed `p_address_id` (guests have no address book) |
| `MISSING_GUEST_INFO` | Anonymous `initiate_shop_checkout` without `p_guest_name` + `p_guest_phone` |
| `INVALID_GUEST_EMAIL` | Guest supplied an email that fails the shape check |
| `GUEST_DIGITAL_NOT_ALLOWED` | Guest cart contains a digital item — download tokens require an account |
| `INVALID_DIVISION` / `INVALID_DISTRICT` / `INVALID_UPAZILLA` | Broken BD geo chain in `upsert_user_address` or an inline checkout address |
| `PROFILE_NOT_FOUND` | `get_shop_policies` / `get_shop_by_username` / `get_shop_categories` / `get_shop_flash_sale` / `get_shop_products` / `search_shop_products` / `get_shop_storefront` username not found |
| `SHOP_NOT_FOUND` | The username exists but has no published (`is_active`) shop |
| `ORDER_NOT_FOUND` | `handle_shop_payment_success` / `get_shop_order_for_payment` order not found |
| `NOT_ORDER_OWNER` | `get_shop_order_for_payment` called by a profile that isn't the order's buyer |
| `ALREADY_PAID` | `get_shop_order_for_payment` called on an order that already has a `transaction_reference_id` |

### Conflicts
| Code | Meaning |
|---|---|
| `SLUG_CONFLICT` | Product or category slug collides with existing row |
| `VARIANT_COMBINATION_CONFLICT` | Duplicate `(product_id, options)` combination |

### Product/variant rules
| Code | Meaning |
|---|---|
| `INVALID_OPTION_DEFINITIONS` | Bad shape in `option_definitions` JSON |
| `TOO_MANY_OPTION_AXES` | More than 3 axes defined |
| `UNKNOWN_OPTION_AXIS` + `axis` | Variant references axis not in `option_definitions` |
| `INVALID_OPTION_VALUE` + `axis, value` | Value not in the axis's allowed list |
| `OPTIONS_DO_NOT_COVER_ALL_AXES` + `required, provided` | Variant is missing some axes |
| `OPTIONS_IMMUTABLE` | Tried to change `options` on an existing variant |
| `VARIANT_HAS_ORDERS` | Variant can't be deleted — deactivate instead |
| `PRODUCT_HAS_NO_OPTION_AXES` | Creating variant on product with empty `option_definitions` |
| `NOT_FOUND_OR_NOT_DIGITAL` | Adding file to a physical product |
| `COD_ONLY_FOR_PHYSICAL` | `cod_enabled = true` on a digital product |

### Cart & checkout
| Code | Meaning |
|---|---|
| `EMPTY_CART` | `p_items` array is empty |
| `MIXED_SELLERS` | Cart spans multiple creators |
| `CANNOT_BUY_OWN_PRODUCT` | Buyer and seller are the same profile |
| `INSUFFICIENT_STOCK` + `product_id, available` | Requested quantity exceeds stock |
| `SHIPPING_ADDRESS_REQUIRED` | Physical items in cart but no `p_address_id` |
| `AMOUNT_MISMATCH` | `handle_shop_payment_success` — `p_amount` (the amount actually charged) doesn't equal the order's `subtotal + shipping_total` |
| `COUPON_NOT_FOUND` | No active coupon matches `p_coupon_code` for this shop |
| `COUPON_NOT_YET_ACTIVE` / `COUPON_EXPIRED` | Outside the coupon's `starts_at`/`ends_at` window |
| `COUPON_LIMIT_REACHED` | Total or per-buyer redemption cap reached |
| `COUPON_MIN_ORDER_NOT_MET` | Cart subtotal below the coupon's `min_order_amount` |
| `COUPON_FIRST_TIME_ONLY` | Coupon requires a first-time buyer; caller has a prior committed order with this seller |
| `COUPON_NO_ELIGIBLE_ITEMS` | `applies_to='line_items'` coupon but no cart line matches its `coupon_targets` |
| `PRODUCTS_REQUIRED` | `upsert_shop_coupon` with `applies_to='line_items'` and no `p_product_ids` |
| `COUPON_CODE_TAKEN` | Duplicate `code` under the same shop |
| `COUPON_ALREADY_USED` | `delete_shop_coupon` on a coupon with `redemption_count > 0` — deactivate instead |

### COD rules
| Code | Meaning |
|---|---|
| `COD_NOT_ALLOWED_FOR_DIGITAL` + `product_id` | Digital item in a COD cart |
| `MIXED_COD_AND_NON_COD` + `product_id` | Item with `cod_enabled = false` in a COD cart |
| `SELLER_COD_BLOCKED` + `eligibility` | Seller fails eligibility check at checkout |
| `NOT_COD_ORDER` | COD RPC called on an online order |
| `COD_ORDER_INVALID_PATH` | `handle_shop_payment_success` / `get_shop_order_for_payment` called on a COD order |
| `CANCELLATION_REASON_REQUIRED` | `cancel_cod_order_item` called without a reason |
| `ALREADY_SETTLED` | Item already has `cod_settled_at` set |

### Fulfillment
| Code | Meaning |
|---|---|
| `NOT_PHYSICAL_ITEM` | Tracking / mark-delivered called on a digital item |
| `INVALID_STATUS_TRANSITION` + `current` | Status doesn't allow the requested action |

### Eligibility
| Code | Meaning |
|---|---|
| `SHOP_INELIGIBLE` + `eligibility` | Reactivation blocked by wallet floor or COD aging |
| `INVALID_PROCESSING_WINDOW` | `processing_min_days > processing_max_days` in `upsert_shop_settings` |

### Manager
| Code | Meaning |
|---|---|
| `UNAUTHORIZED` | Manager RPC called without required permission |
