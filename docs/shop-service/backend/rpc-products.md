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
  p_is_active                  boolean default null,
  p_is_featured                boolean default null,
  p_sort_order                 integer default null,
  p_tags                       text[]  default null
) → jsonb
```

**Create** (omit `p_product_id`): `title`, `product_type`, and `price` are required.

**Edit** (pass `p_product_id`): all fields optional — only non-null values update the row.

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
