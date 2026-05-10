# Products, Variants & Files RPCs

```mermaid
flowchart TB
    subgraph "Product Structure"
        A[shop_products] --> B[option_definitions JSONB]
        A --> C[product_type]
        A --> D[price + stock]
    end
    
    subgraph "Variant System"
        B --> E[Axis definitions<br/>(e.g. Size, Color)]
        E --> F[shop_product_variants]
        F --> G[options JSONB<br/>{Size: M, Color: Red}]
    end
    
    subgraph "Digital Files"
        A --> H[shop_product_files]
        H --> I[storage_path<br/>(private)]
        I --> J[shop_download_tokens]
    end
    
    subgraph "Validation"
        G --> K[All keys match axes?]
        G --> L[All values in list?]
        G --> M[All axes covered?]
    end
```

Covers all RPCs for managing the product catalogue, multi-axis variants, and digital product files. Also includes address RPCs which are prerequisite for product setup.

## Address RPCs

### `get_user_addresses`

```sql
public.get_user_addresses() → table(id, label, recipient_name, phone, ...)
```

Returns all addresses for the authenticated buyer, sorted default-first. No parameters.

```typescript
const { data } = await supabase.rpc('get_user_addresses');
// Returns array of address rows
```

---

### `upsert_user_address`

```sql
public.upsert_user_address(
  p_address_id     uuid    default null,   -- null = create
  p_label          varchar default null,
  p_recipient_name varchar default null,
  p_phone          varchar default null,
  p_address_line1  varchar default null,
  p_address_line2  varchar default null,
  p_city           varchar default null,
  p_district       varchar default null,   -- 'Dhaka' triggers inside-Dhaka rate
  p_postal_code    varchar default null,
  p_is_default     boolean default false
) → jsonb
```

**Create** (omit `p_address_id`): `recipient_name`, `phone`, `address_line1`, `city`, `district` are required.

**Edit** (pass `p_address_id`): all fields optional — only provided fields are updated.

When `p_is_default = true`, any existing default is cleared first (the partial unique index only allows one default per profile).

**Response:**
```json
{ "success": true, "address_id": "uuid" }
```

**Errors:** `UNAUTHENTICATED`, `MISSING_REQUIRED_FIELDS`, `NOT_FOUND`

---

### `delete_user_address`

```sql
public.delete_user_address(p_address_id uuid) → jsonb
```

Hard-deletes the address. Safe because `shop_orders.shipping_address` is a snapshot — no FK back to this table.

---

## Approval workflow overview

All products go through a manager review before (or after editing) they become publicly active. The pending state lives in `shop_product_drafts`, not on the live `shop_products` row.

| Situation | What `upsert_shop_product` does | Live product |
|---|---|---|
| Brand-new product | Writes `shop_products` (`is_active=false`) + inserts pending draft | Inactive until approved |
| Edit of a **live** product | Writes only to `shop_product_drafts` (ON CONFLICT overwrites) | Stays online untouched |
| Edit of a **pending/rejected** product | Updates `shop_products` directly + refreshes draft | Still inactive |

Manager calls `approve_shop_product` → draft applied to live row, `is_active=true`, draft deleted, **private activity notification sent to owner** (`activity_type: 'product_approved'`).
Manager calls `reject_shop_product` → draft `approval_status='rejected'` + `rejection_reason` set, live row untouched, **private activity notification sent to owner** (`activity_type: 'product_rejected'`).
Owner re-edits after rejection → draft overwritten, `approval_status` reset to `'pending'`.

---

## Product RPCs

### `upsert_shop_product`

```sql
public.upsert_shop_product(
  p_product_id                 uuid    default null,
  p_category_id                uuid    default null,
  p_title                      varchar default null,
  p_slug                       varchar default null,
  p_description                text    default null,
  p_cover_image_url            text    default null,
  p_images                     text[]  default null,
  p_product_type               shop_product_type_enum default null,
  p_sku                        varchar default null,
  p_price                      numeric default null,
  p_compare_at_price           numeric default null,
  p_option_definitions         jsonb   default null,
  p_weight_grams               integer default null,
  p_shipping_fee_inside_dhaka  numeric default null,
  p_shipping_fee_outside_dhaka numeric default null,
  p_processing_min_days        integer default null,
  p_processing_max_days        integer default null,
  p_requires_shipping          boolean default null,
  p_cod_enabled                boolean default null,
  p_max_downloads              integer default null,
  p_download_expires_hours     integer default null,
  p_stock_count                integer default null,
  p_low_stock_threshold        integer default null,
  -- p_is_active intentionally absent — activation is manager-controlled only
  p_is_featured                boolean default null,
  p_sort_order                 integer default null,
  p_tags                       text[]  default null
) → jsonb
```

**Create** (omit `p_product_id`): `title`, `product_type`, and `price` are required.

**Edit** (pass `p_product_id`): all fields optional — only non-null values update the row or draft.

> `p_is_active` has been **removed**. Activation is exclusively controlled by `approve_shop_product`. Passing it will cause an error.

#### Shipping defaults fallback chain

When creating a new product and any shipping field is `null`, the RPC applies a 3-level fallback:

```
param passed → shop_settings value → platform_settings default → hardcoded sentinel
```

| Field | Sentinel |
|---|---|
| `shipping_fee_inside_dhaka` | 85 |
| `shipping_fee_outside_dhaka` | 170 |
| `processing_min_days` | 1 |
| `processing_max_days` | 15 |
| `requires_shipping` | `false` |
| `cod_enabled` | `false` |

This means if a seller has configured shop-level shipping defaults in `upsert_shop_settings`, new products automatically inherit those values without the frontend needing to pre-fill them.

The same fallback applies on the non-live edit path (product not yet approved). The live edit path (draft only) keeps existing product values as defaults, so no fallback is needed.

#### `option_definitions` validation

When provided, the RPC validates the shape:

```json
// Valid — array of axis objects
[
  { "name": "Size",  "values": ["S", "M", "L"] },
  { "name": "Color", "values": ["Red", "Blue"] }
]
```

Rules enforced:
- Must be a JSON array
- Max 3 axes (`TOO_MANY_OPTION_AXES`)
- Each axis must have a string `name` and non-empty `values` array (`INVALID_OPTION_DEFINITIONS`)

#### COD rules

Setting `cod_enabled = true` on a digital product returns `COD_ONLY_FOR_PHYSICAL`. This is also enforced at the DB level via `CHECK (cod_enabled = false OR product_type = 'physical')`.

**Errors:** `UNAUTHENTICATED`, `MISSING_REQUIRED_FIELDS`, `COD_ONLY_FOR_PHYSICAL`, `INVALID_OPTION_DEFINITIONS`, `TOO_MANY_OPTION_AXES`, `SLUG_CONFLICT`, `NOT_FOUND`

---

### `delete_shop_product`

```sql
public.delete_shop_product(p_product_id uuid) → jsonb
```

Checks whether any `shop_order_items` row references this product:

| Has orders? | Action | Response |
|---|---|---|
| No | Hard delete | `{ "success": true, "deleted": "hard" }` |
| Yes | Soft delete (`is_deleted = true`, `is_active = false`) | `{ "success": true, "deleted": "soft" }` |

::: tip Why the distinction matters
Soft-deleted products remain visible in Studio with a "deleted" badge so the creator knows the history. Public pages exclude them (`is_deleted = false` in all public queries).
:::

::: info Product count trigger
When a product is deleted (soft or hard), the category's `product_count` is decremented automatically via the `trg_shop_products_product_count` trigger. Restoring a soft-deleted product increments the count back.
:::

---

### `reorder_shop_products`

```sql
public.reorder_shop_products(p_product_ids uuid[]) → jsonb
```

Bulk-updates `sort_order` by array position. Same pattern as `reorder_shop_categories`.

---

### `approve_shop_product` *(manager only)*

```sql
public.approve_shop_product(p_product_id uuid) → jsonb
```

Requires `content.approve` manager permission.

Loads the pending draft from `shop_product_drafts`, applies all its columns to the live `shop_products` row, sets `is_active = true`, deletes the draft, then inserts a private activity notification for the owner.

**Activity written:**

```json
{
  "role": "system",
  "service_type": "shop",
  "visibility": "private",
  "metadata": {
    "activity_type": "product_approved",
    "product_id": "<uuid>",
    "product_title": "<title>"
  }
}
```

**Idempotent edge case:** if no draft exists but the product does, it simply sets `is_active = true` (handles double-approval gracefully). No activity is written in this path.

**Response:**
```json
{ "success": true }
```

**Errors:** `UNAUTHORIZED`, `NOT_FOUND`

---

### `reject_shop_product` *(manager only)*

```sql
public.reject_shop_product(
  p_product_id       uuid,
  p_rejection_reason text
) → jsonb
```

Requires `content.approve` manager permission.

Sets `approval_status = 'rejected'` and `rejection_reason` on the draft row. **The live `shop_products` row is never touched** — if the product was already live, it stays online. The owner sees the rejection reason in Studio and can revise and resubmit. A private activity notification is sent to the owner.

Rejection reason is **required** and must be non-empty.

**Activity written:**

```json
{
  "role": "system",
  "service_type": "shop",
  "visibility": "private",
  "metadata": {
    "activity_type": "product_rejected",
    "product_id": "<uuid>",
    "product_title": "<title>",
    "rejection_reason": "<reason>"
  }
}
```

**Response:**
```json
{ "success": true }
```

**Errors:** `UNAUTHORIZED`, `REJECTION_REASON_REQUIRED`, `DRAFT_NOT_FOUND`

---

## Variant RPCs

### `upsert_shop_product_variant`

```sql
public.upsert_shop_product_variant(
  p_variant_id       uuid    default null,    -- null = create
  p_product_id       uuid    default null,    -- required on create
  p_options          jsonb   default null,    -- required on create; immutable on edit
  p_price_adjustment numeric default null,
  p_stock_count      integer default null,
  p_sku              varchar default null,
  p_image_url        text    default null,
  p_sort_order       integer default null,
  p_is_active        boolean default null
) → jsonb
```

#### Creating a variant

`p_product_id` and `p_options` are required. The RPC validates `p_options` against the product's `option_definitions`:

**Step 1 — All keys must match axis names:**
```json
// Product option_definitions: [{ "name": "Size", "values": ["S","M","L"] }]
// p_options: { "Size": "M" }           → OK
// p_options: { "Colour": "M" }         → UNKNOWN_OPTION_AXIS (axis "Colour" not defined)
```

**Step 2 — Values must be in the allowed list:**
```json
// p_options: { "Size": "XL" }          → INVALID_OPTION_VALUE ("XL" not in ["S","M","L"])
```

**Step 3 — All axes must be covered:**
```json
// Product has Size + Color axes
// p_options: { "Size": "M" }           → OPTIONS_DO_NOT_COVER_ALL_AXES (Color missing)
// p_options: { "Size": "M", "Color": "Red" }  → OK
```

#### Editing a variant

Pass `p_variant_id` and any fields to update (except `p_options` — immutable).

```sql
-- Only price, stock, sku, image, sort_order, is_active can be edited
```

**Errors:** `UNAUTHENTICATED`, `MISSING_REQUIRED_FIELDS`, `NOT_FOUND`, `PRODUCT_HAS_NO_OPTION_AXES`, `UNKNOWN_OPTION_AXIS`, `INVALID_OPTION_VALUE`, `OPTIONS_DO_NOT_COVER_ALL_AXES`, `OPTIONS_IMMUTABLE`, `VARIANT_COMBINATION_CONFLICT`

---

### `delete_shop_product_variant`

```sql
public.delete_shop_product_variant(p_variant_id uuid) → jsonb
```

Hard-deletes the variant if no order items reference it. Returns `VARIANT_HAS_ORDERS` if the variant has been purchased (deactivate it with `upsert_shop_product_variant({ p_is_active: false })` instead).

---

## File RPCs

### `add_shop_product_file`

```sql
public.add_shop_product_file(
  p_product_id      uuid,
  p_file_name       varchar,
  p_storage_path    text,          -- private bucket path
  p_file_size_bytes bigint  default null,
  p_mime_type       varchar default null,
  p_sort_order      integer default 0
) → jsonb
```

Attaches a file to a digital product. Returns `NOT_FOUND_OR_NOT_DIGITAL` if the product is physical or doesn't exist.

::: danger Never expose storage_path to clients
`storage_path` is stored server-side only. The download Edge Function generates a short-lived signed URL at request time. The RPC responses that clients see only contain `file_name`, `file_size_bytes`, and `mime_type`.
:::

---

### `delete_shop_product_file`

```sql
public.delete_shop_product_file(p_file_id uuid) → jsonb
```

Soft-deletes (`is_deleted = true`). Preserves existing buyer download tokens via `ON DELETE RESTRICT` on the FK.

---

## Policy RPCs

### `upsert_shop_policy`

```sql
public.upsert_shop_policy(
  p_policy_type shop_policy_type_enum,
  p_content     text    default null,
  p_is_enabled  boolean default null
) → jsonb
```

Creates or updates a policy override. `p_content` is required on the **first** write for a given `policy_type`, but optional on subsequent updates so the toggle can be flipped without re-sending the markdown body.

**Policy types:** `return_refund`, `digital_products`, `shipping`, `privacy`, `terms_of_service`

**Errors:** `UNAUTHENTICATED`, `MISSING_CONTENT`

---

### `delete_shop_policy`

```sql
public.delete_shop_policy(p_policy_type shop_policy_type_enum) → jsonb
```

Removes the override entirely. After this, the public policies page falls back to the frontend's default template for that type.

---

### `get_shop_policies`

```sql
public.get_shop_policies(p_username varchar) → jsonb
```

Public RPC. Returns all `is_enabled = true` policy overrides for a creator's shop. Frontend merges with defaults — any type absent from the response uses the static default.

```json
{
  "success": true,
  "policies": [
    {
      "policy_type": "return_refund",
      "content": "We accept returns within 7 days...",
      "is_enabled": true,
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

**Errors:** `PROFILE_NOT_FOUND`

---

## Testing manager RPCs in the SQL editor

Manager RPCs are gated by `authorize_manager('content.approve')`, which reads `auth.jwt() ->> 'manager_role'`. In the Supabase SQL editor queries run as the `postgres` superuser and `auth.jwt()` returns `null`, so a direct call returns `UNAUTHORIZED`.

Use `set_config` to mock the JWT claim for the session:

```sql
-- Set the manager_role claim (persist for the whole session)
select set_config('request.jwt.claims', '{"manager_role": "super_admin"}', false);

-- Now call the RPC normally
select approve_shop_product('<your-product-id>');
```

Pass `true` as the third argument to scope it to the current transaction instead:

```sql
select set_config('request.jwt.claims', '{"manager_role": "super_admin"}', true);
select approve_shop_product('<your-product-id>');
```

### Full approval flow test

```sql
-- 1. Confirm the draft exists
select * from shop_product_drafts where product_id = '<your-product-id>';

-- 2. Set the manager claim
select set_config('request.jwt.claims', '{"manager_role": "super_admin"}', false);

-- 3. Approve
select approve_shop_product('<your-product-id>');

-- 4. Verify: draft gone, product now active
select id, title, is_active from shop_products where id = '<your-product-id>';
select * from shop_product_drafts where product_id = '<your-product-id>'; -- 0 rows
```

### Full rejection flow test

```sql
select set_config('request.jwt.claims', '{"manager_role": "super_admin"}', false);
select reject_shop_product('<your-product-id>', 'Description is too short — please add more detail.');

-- Verify
select approval_status, rejection_reason
from shop_product_drafts
where product_id = '<your-product-id>';
```

::: tip Same pattern for categories
`approve_shop_category` and `reject_shop_category` use the same `authorize_manager` gate. The `set_config` trick works identically for both.
:::
