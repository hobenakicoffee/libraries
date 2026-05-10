# Database Schema

```mermaid
erDiagram
    PROFILES ||--o{ USER_ADDRESSES : has
    PROFILES ||--o{ SHOP_SETTINGS : owns
    PROFILES ||--o{ SHOP_CATEGORIES : has
    PROFILES ||--o{ SHOP_PRODUCTS : creates
    PROFILES ||--o{ SHOP_ORDERS : sells
    PROFILES ||--o{ SHOP_ORDERS : buys
    
    SHOP_SETTINGS ||--|| SHOP_CATEGORIES : "profile_id FK"
    SHOP_SETTINGS ||--|| SHOP_PRODUCTS : "profile_id FK"
    SHOP_SETTINGS ||--o{ SHOP_POLICIES : owns
    
    SHOP_PRODUCTS ||--o{ SHOP_PRODUCT_VARIANTS : has
    SHOP_PRODUCTS ||--o{ SHOP_PRODUCT_FILES : has
    
    SHOP_ORDERS ||--o{ SHOP_ORDER_ITEMS : contains
    
    SHOP_ORDER_ITEMS }o--|| SHOP_PRODUCTS : references
    SHOP_ORDER_ITEMS }o--|| SHOP_PRODUCT_VARIANTS : optional
    SHOP_ORDER_ITEMS }o--|| SHOP_PRODUCT_FILES : "digital only"
    
    SHOP_ORDER_ITEMS ||--o{ SHOP_DOWNLOAD_TOKENS : generates
    
    WALLETS {
        uuid id PK
        numeric balance
        numeric cod_debt
    }
    
    PLATFORM_SETTINGS {
        varchar key PK
        jsonb value
    }

All tables are in the `public` schema with RLS enabled. Clients access data exclusively through RPCs — direct table access is blocked by the RLS policies described here.

## Table overview

| Table | Rows represent | Key FKs |
|---|---|---|
| `platform_settings` | Singleton platform config knobs | — |
| `user_addresses` | Buyer address book entries | `profiles` |
| `shop_settings` | One shop config per creator | `profiles` |
| `shop_categories` | Creator-defined product categories | `profiles` |
| `shop_products` | Individual products | `profiles`, `shop_categories` |
| `shop_product_variants` | Multi-axis variant combinations | `shop_products` |
| `shop_product_files` | Files attached to digital products | `shop_products` |
| `shop_policies` | Creator-customised policy text | `profiles` |
| `shop_category_drafts` | Pending/rejected edits awaiting manager review | `shop_categories`, `profiles` |
| `shop_product_drafts` | Pending/rejected edits awaiting manager review | `shop_products`, `profiles` |
| `shop_orders` | One row per checkout session | `profiles` (×2), `transactions` |
| `shop_order_items` | Line items within an order | `shop_orders`, `shop_products`, `shop_product_variants` |
| `shop_download_tokens` | Secure download links for digital files | `shop_order_items`, `shop_product_files`, `profiles` |

Plus one **column addition** to an existing table:

```sql
alter table public.wallets
  add column cod_debt numeric(12,2) not null default 0 check (cod_debt >= 0);
```

---

## `platform_settings`

Singleton key-value config. Service-role write only.

```sql
create table public.platform_settings (
  key         varchar(64)  primary key,
  value       jsonb        not null,
  description text,
  updated_at  timestamptz  not null default now()
);
```

**Seeded rows:**

| `key` | `value` | Purpose |
|---|---|---|
| `platform_fee_rate` | `0.10` | Fraction of order total taken as platform fee |
| `cod_wallet_floor` | `-500` | Min `(balance − cod_debt)` before shop is deactivated |
| `cod_settlement_max_days` | `30` | Days a COD order can age before triggering deactivation |
| `default_shipping_fee_inside_dhaka` | `85` | Fallback inside-Dhaka shipping fee for new products when shop has no override |
| `default_shipping_fee_outside_dhaka` | `170` | Fallback outside-Dhaka shipping fee for new products when shop has no override |
| `default_processing_min_days` | `1` | Fallback minimum processing days for new physical products |
| `default_processing_max_days` | `15` | Fallback maximum processing days for new physical products |

**RLS:** `SELECT` allowed for `anon` and `authenticated`. No INSERT/UPDATE/DELETE policies — only service role can write.

---

## `wallets` (column addition)

```sql
alter table public.wallets
  add column cod_debt numeric(12,2) not null default 0 check (cod_debt >= 0);
```

`cod_debt` (positive number) represents COD platform fees the seller owes but hasn't paid yet. Eligibility is computed as `balance − cod_debt ≥ cod_wallet_floor`. See [COD & Wallet Debt](./rpc-cod) for the full flow.

---

## `user_addresses`

```sql
create table public.user_addresses (
  id             uuid        primary key default gen_random_uuid(),
  profile_id     uuid        not null references public.profiles(id) on delete cascade,

  label          varchar(50),              -- "Home", "Office"
  recipient_name varchar(100) not null,
  phone          varchar(20)  not null,
  address_line1  varchar(255) not null,
  address_line2  varchar(255),
  city           varchar(100) not null,
  district       varchar(100) not null,    -- 'Dhaka' → inside-Dhaka shipping rate
  postal_code    varchar(20),
  is_default     boolean      not null default false,

  created_at     timestamptz  not null default now(),
  updated_at     timestamptz  not null default now()
);
```

**Key constraint:**

```sql
-- Enforces exactly one default address per profile
create unique index idx_user_addresses_one_default
  on public.user_addresses(profile_id)
  where is_default = true;
```

**RLS:** Users can SELECT, INSERT, UPDATE, DELETE their own rows (`profile_id = auth.uid()`).

::: tip Snapshot vs. live join
`shop_orders.shipping_address` is a JSONB snapshot taken at checkout. There is no FK back to `user_addresses`. Editing or deleting an address never affects historical orders.
:::

---

## `shop_settings`

One row per creator. Controls whether the shop is visible, how it looks, its shipping defaults, and carries cached stats counters.

```sql
create table public.shop_settings (
  id                  uuid        primary key default gen_random_uuid(),
  profile_id          uuid        not null unique references public.profiles(id) on delete cascade,

  shop_name           varchar(100) not null,
  shop_description    text,
  logo_url            text,
  banner_url          text,
  is_active           boolean      not null default false,
  deactivation_reason varchar(40),  -- 'wallet_below_floor' | 'cod_aging' | 'manual' | null

  theme_config        jsonb        not null default '{}',
  seo_title           varchar(60),
  seo_description     varchar(160),

  -- Shop-level shipping defaults (null = fall through to platform_settings)
  -- New products inherit these values via upsert_shop_product when no explicit value is passed.
  shipping_fee_inside_dhaka   numeric(10,2),   -- null → platform default 85
  shipping_fee_outside_dhaka  numeric(10,2),   -- null → platform default 170
  processing_min_days         integer,         -- null → platform default 1
  processing_max_days         integer,         -- null → platform default 15
  requires_shipping           boolean not null default false,
  cod_enabled                 boolean not null default false,
  shipping_from_address       jsonb,   -- { "division", "district", "thana", "address" }

  -- Cached stats counters — maintained by triggers/RPCs, never aggregated live.
  total_views     bigint        not null default 0,
  total_sales     bigint        not null default 0,
  total_earnings  numeric(12,2) not null default 0,
  total_products  bigint        not null default 0,

  created_at          timestamptz  not null default now(),
  updated_at          timestamptz  not null default now(),

  constraint shop_settings_processing_window_valid
    check (processing_min_days is null or processing_max_days is null
           or processing_min_days <= processing_max_days)
);
```

**`deactivation_reason`** is set automatically by the cron job and cleared when the seller reactivates. The frontend uses it to render the Studio banner with actionable copy.

**Shipping defaults** (`shipping_fee_inside_dhaka`, `shipping_fee_outside_dhaka`, `processing_min_days`, `processing_max_days`, `requires_shipping`, `cod_enabled`, `shipping_from_address`) are shop-level defaults inherited by new products. `NULL` on any numeric/integer field means fall through to the platform default. Set via `upsert_shop_settings`.

**Stats counters** (`total_views`, `total_sales`, `total_earnings`, `total_products`) are pre-computed counters maintained automatically — read by `get_shop_stats()` for O(1) Studio card reads:

| Counter | Who maintains it |
|---|---|
| `total_views` | `record_shop_view()` — called by Astro SSR on every shop page render |
| `total_sales` | `handle_shop_payment_success` (digital) + `mark_order_item_delivered` (physical) |
| `total_earnings` | `trg_shop_orders_stats` trigger when `transaction_reference_id` or `cod_settled_at` is first set |
| `total_products` | `approve_shop_product` (+1) + `delete_shop_product` (−1 if was active) |

**Auto-provision trigger:** when the `'shop'` service is first enabled on `user_services`, the `on_shop_service_enabled` trigger automatically inserts a default `shop_settings` row so the owner doesn't need to call `upsert_shop_settings` before configuring their shop.

```sql
-- Fires AFTER INSERT OR UPDATE OF is_enabled, service ON user_services
-- handle_shop_service_enabled():
INSERT INTO public.shop_settings (profile_id, shop_name, is_active, theme_config)
VALUES (new.profile_id, 'My Shop', false, '{}')
ON CONFLICT (profile_id) DO NOTHING;
```

Existing settings are never overwritten (`ON CONFLICT DO NOTHING`). Re-enabling the service after it was disabled is therefore safe.

**RLS:**
- `SELECT` — active shops visible to all, plus owner always sees their own
- `INSERT/UPDATE` — owner only (`profile_id = auth.uid()`)
- `DELETE` — owner only

::: tip See also
The [Shop Settings](../shop-settings) page has a complete guide including eligibility, shipping defaults, theming, policies, and Studio UI patterns.
:::

---

## `shop_categories`

Creator-scoped categories. Slugs are unique per shop, not globally. Products reference via `category_id` with `ON DELETE SET NULL`.

`is_visible` starts `false` and is only set to `true` by `approve_shop_category`. Owners cannot flip it directly. Pending/rejected state and feedback live in `shop_category_drafts`.

```sql
create table public.shop_categories (
  id             uuid        primary key default gen_random_uuid(),
  profile_id     uuid        not null references public.profiles(id) on delete cascade,

  name          varchar(100) not null,
  slug          varchar(100) not null,
  description   text,
  sort_order    integer     not null default 0,
  is_visible    boolean     not null default false,  -- manager-controlled only
  product_count integer     not null default 0 check (product_count >= 0),

  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now(),

  constraint shop_categories_product_count_non_negative check (product_count >= 0),
  constraint shop_categories_profile_slug_unique unique (profile_id, slug)
);
```

**Indexes:**

| Index | Purpose |
|------|---------|
| `(profile_id, sort_order)` | Category list order |
| `(product_count)` | Efficient count updates |

**Triggers:**

- `trg_shop_products_product_count` — maintains `product_count` on product insert/delete/soft-delete/restore

```sql
create trigger trg_shop_products_product_count
before insert or delete or update of category_id, is_deleted on public.shop_products
for each row execute procedure public.trg_shop_products_product_count();
```

**Product count behavior:**

- INSERT: increments new category's count
- DELETE: decrements old category's count  
- UPDATE `category_id`: decrements old, increments new
- UPDATE `is_deleted` (true): decrements count
- UPDATE `is_deleted` (false): increments count

---

## `shop_products`

The core product table. `product_type` forks schema usage.

```sql
create table public.shop_products (
  id                         uuid     primary key default gen_random_uuid(),
  profile_id                 uuid     not null references public.profiles(id) on delete cascade,
  category_id                uuid     references public.shop_categories(id) on delete set null,

  title                      varchar(200) not null,
  slug                       varchar(200) not null,
  description                text,
  cover_image_url            text,
  images                     text[]   not null default '{}',
  product_type               shop_product_type_enum not null,

  sku                        varchar(100),            -- optional, not unique

  price                      numeric(10,2) not null check (price >= 0),
  compare_at_price           numeric(10,2),           -- null = no sale/strikethrough

  -- Variant axis definitions (max 3). Empty array = no variants.
  option_definitions         jsonb    not null default '[]',

  -- Physical-only
  weight_grams               integer,
  shipping_fee_inside_dhaka  numeric(10,2) not null default 0 check (...),
  shipping_fee_outside_dhaka numeric(10,2) not null default 0 check (...),
  processing_min_days        integer  check (processing_min_days >= 0),
  processing_max_days        integer  check (processing_max_days >= 0),
  requires_shipping          boolean  not null default false,
  cod_enabled                boolean  not null default false,

  -- Digital-only
  max_downloads              integer  not null default 5,
  download_expires_hours     integer  not null default 72,

  -- Shared inventory
  stock_count                integer  check (stock_count >= 0),   -- null = unlimited
  low_stock_threshold        integer  not null default 5,

  is_active    boolean  not null default false,  -- manager-controlled only
  is_featured  boolean  not null default false,
  is_deleted   boolean  not null default false,
  sort_order   integer  not null default 0,
  tags         text[]   not null default '{}',
  sales_count  integer  not null default 0 check (sales_count >= 0),

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint shop_products_profile_slug_unique unique (profile_id, slug),
  constraint shop_products_cod_only_physical
    check (cod_enabled = false or product_type = 'physical'),
  constraint shop_products_processing_window_valid
    check (processing_min_days is null or processing_max_days is null
           or processing_min_days <= processing_max_days),
  constraint shop_products_option_axes_max_3
    check (jsonb_array_length(option_definitions) <= 3)
);
```

**Important notes:**

- `is_active` starts `false` and is only set to `true` by `approve_shop_product` — owners cannot toggle it directly
- When variants exist, `product.stock_count` is ignored — stock is tracked per variant
- `sales_count` is incremented on fulfillment (digital) or delivery (physical)
- `is_deleted = true` hides from public pages but is visible in Studio
- Direct DELETE is blocked by RLS; always go through `delete_shop_product`
- Pending/rejected state and rejection feedback live in `shop_product_drafts`

**RLS:**
- `SELECT` — active + non-deleted visible to all; owner sees everything
- `INSERT/UPDATE` — owner only
- `DELETE` — always `false` (blocked — use the RPC)

---

## `shop_product_variants`

Multi-axis variant rows. One per unique option combination per product.

```sql
create table public.shop_product_variants (
  id               uuid    primary key default gen_random_uuid(),
  product_id       uuid    not null references public.shop_products(id) on delete cascade,

  options          jsonb   not null,    -- {"Size":"M","Color":"Red"}
  price_adjustment numeric(10,2) not null default 0,
  stock_count      integer check (stock_count >= 0),  -- null = inherit product
  sku              varchar(100),
  image_url        text,               -- variant-specific photo
  sort_order       integer not null default 0,
  is_active        boolean not null default true,

  constraint shop_product_variants_options_is_object
    check (jsonb_typeof(options) = 'object' and options <> '{}')
);

-- Unique combination per product
create unique index shop_product_variants_unique_combination
  on public.shop_product_variants(product_id, options);
```

::: warning options is immutable
Once a variant is created, its `options` field cannot be changed. The `upsert_shop_product_variant` RPC returns `OPTIONS_IMMUTABLE` if you pass `p_options` on an edit. To change the combination, delete the variant (blocked if it has orders) and create a new one.
:::

---

## `shop_product_files`

Files for digital products. `storage_path` is **never returned to clients**.

```sql
create table public.shop_product_files (
  id              uuid    primary key default gen_random_uuid(),
  product_id      uuid    not null references public.shop_products(id) on delete restrict,

  file_name       varchar(255) not null,
  storage_path    text    not null,   -- private bucket path, NEVER exposed
  file_size_bytes bigint,
  mime_type       varchar(100),
  sort_order      integer not null default 0,
  is_deleted      boolean not null default false,

  created_at      timestamptz not null default now()
);
```

`ON DELETE RESTRICT` on `product_id` means you cannot hard-delete a product that has files with active download tokens. Use soft delete.

---

## `shop_policies`

One row per `(profile_id, policy_type)`. Only customisations are stored.

```sql
create table public.shop_policies (
  id          uuid    primary key default gen_random_uuid(),
  profile_id  uuid    not null references public.profiles(id) on delete cascade,

  policy_type shop_policy_type_enum not null,
  content     text    not null,   -- markdown
  is_enabled  boolean not null default true,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint shop_policies_profile_type_unique unique (profile_id, policy_type)
);
```

**Policy types:** `return_refund | digital_products | shipping | privacy | terms_of_service`

When no row exists for a given type, the frontend falls back to its static default template. See [Shop Policies](../shop-settings#shop-policies) for the full guide.

---

## `shop_category_drafts`

Shadow-draft table for the category manager approval workflow. One row per category (`UNIQUE category_id`). Only exists while a category has pending or rejected changes.

```sql
create table public.shop_category_drafts (
  id               uuid   primary key default gen_random_uuid(),
  category_id      uuid   not null unique references public.shop_categories(id) on delete cascade,
  profile_id       uuid   not null references public.profiles(id) on delete cascade,

  -- Mirrors all editable columns of shop_categories
  name             varchar(100) not null,
  description      text,
  slug             varchar(100) not null,
  sort_order       integer not null default 0,

  approval_status  shop_approval_status_enum not null default 'pending',
  rejection_reason text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
```

**States:**

| `approval_status` | Meaning |
|---|---|
| `pending` | Submitted by owner, awaiting manager action |
| `rejected` | Manager rejected; `rejection_reason` set; owner can revise |

`approved` is never stored — on approval the draft is applied to the live row and deleted.

**RLS:** Owners can SELECT their own drafts. All writes go through security-definer RPCs only (no direct owner DML).

---

## `shop_product_drafts`

Same pattern as `shop_category_drafts` but for products. Mirrors all editable product columns. `product_type` is intentionally omitted — it's immutable after creation.

```sql
create table public.shop_product_drafts (
  id                          uuid   primary key default gen_random_uuid(),
  product_id                  uuid   not null unique references public.shop_products(id) on delete cascade,
  profile_id                  uuid   not null references public.profiles(id) on delete cascade,

  -- Mirrors all editable columns of shop_products (product_type excluded — immutable)
  category_id                 uuid   references public.shop_categories(id) on delete set null,
  title                       varchar(200) not null,
  slug                        varchar(200) not null,
  description                 text,
  cover_image_url             text,
  images                      text[] not null default '{}',
  sku                         varchar(100),
  price                       numeric(10,2) not null check (price >= 0),
  compare_at_price            numeric(10,2),
  option_definitions          jsonb  not null default '[]',
  weight_grams                integer,
  shipping_fee_inside_dhaka   numeric(10,2) not null default 0,
  shipping_fee_outside_dhaka  numeric(10,2) not null default 0,
  processing_min_days         integer,
  processing_max_days         integer,
  requires_shipping           boolean not null default false,
  cod_enabled                 boolean not null default false,
  max_downloads               integer not null default 5,
  download_expires_hours      integer not null default 72,
  stock_count                 integer,
  low_stock_threshold         integer not null default 5,
  is_featured                 boolean not null default false,
  sort_order                  integer not null default 0,
  tags                        text[]  not null default '{}',

  approval_status             shop_approval_status_enum not null default 'pending',
  rejection_reason            text,

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
```

**RLS:** Owners can SELECT their own drafts. All writes go through security-definer RPCs only.

::: tip One draft per item
Both draft tables enforce `UNIQUE (category_id)` / `UNIQUE (product_id)`. `upsert_shop_category` and `upsert_shop_product` use `ON CONFLICT … DO UPDATE` to overwrite the previous draft, so there is always at most one in-flight draft per item.
:::

---

## `shop_orders`

One row per checkout session.

```sql
create table public.shop_orders (
  id                       uuid    primary key default gen_random_uuid(),
  order_number             varchar(20) unique not null,   -- SHOP-YYYYMMDD-XXXX

  seller_profile_id        uuid    not null references public.profiles(id),
  buyer_profile_id         uuid    not null references public.profiles(id),

  payment_method           shop_payment_method_enum not null default 'online',
  has_digital              boolean not null default false,
  has_physical             boolean not null default false,

  -- Financials (all snapshotted at checkout)
  subtotal                 numeric(10,2) not null,
  shipping_total           numeric(10,2) not null default 0,
  platform_fee             numeric(10,2) not null,
  platform_fee_rate        numeric(5,4)  not null,   -- snapshotted for audit
  seller_net               numeric(10,2) not null,

  transaction_reference_id uuid references public.transactions(reference_id) on delete set null,
  shipping_address         jsonb,   -- snapshot; no FK back to user_addresses
  buyer_notes              text,
  seller_notes             text,

  cod_settled_at           timestamptz,  -- set when last COD item is confirmed

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  -- COD orders cannot contain digital items
  constraint shop_orders_cod_no_digital
    check (payment_method = 'online' or has_digital = false)
);
```

::: info No status column
`shop_orders` has no status column. Status is computed from item statuses in `get_order_by_number`. See [Design Decision #4](./#_4-order-status-is-item-level-not-order-level).
:::

**RLS:** Buyer and seller can both SELECT their own orders. INSERT/UPDATE/DELETE blocked for all authenticated users (RPC-only).

---

## `shop_order_items`

Line items. All pricing fields are **immutable snapshots**.

```sql
create table public.shop_order_items (
  id              uuid    primary key default gen_random_uuid(),
  order_id        uuid    not null references public.shop_orders(id) on delete cascade,
  product_id      uuid    not null references public.shop_products(id) on delete restrict,
  variant_id      uuid    references public.shop_product_variants(id) on delete restrict,

  -- Immutable snapshots
  product_title   varchar(200) not null,
  product_type    shop_product_type_enum not null,
  variant_label   varchar(255),           -- "Size: M / Color: Red"
  variant_options jsonb,                  -- snapshot of variant.options
  unit_price      numeric(10,2) not null, -- base price + price_adjustment
  shipping_cost   numeric(10,2) not null default 0,
  quantity        integer not null default 1 check (quantity > 0),

  status          shop_order_item_status_enum not null default 'pending',

  -- Physical fulfillment
  carrier         varchar(100),
  tracking_number varchar(200),
  tracking_url    text,
  shipped_at      timestamptz,
  delivered_at    timestamptz,

  -- COD-specific
  cod_settled_at      timestamptz,
  cancellation_reason text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Cancelled items must have a reason; non-cancelled must not
  constraint shop_order_items_cancellation_reason_consistency
    check (
      (status = 'cancelled' and cancellation_reason is not null)
      or (status <> 'cancelled' and cancellation_reason is null)
    )
);
```

**`ON DELETE RESTRICT`** on `product_id` and `variant_id` enforces that products/variants with live order items cannot be hard-deleted.

**RLS:** Buyer and seller can SELECT. INSERT/UPDATE/DELETE blocked (RPC-only).

---

## `shop_download_tokens`

One row per `(order_item, file)` pair. Used to vend secure downloads.

```sql
create table public.shop_download_tokens (
  id               uuid    primary key default gen_random_uuid(),
  order_item_id    uuid    not null references public.shop_order_items(id) on delete cascade,
  file_id          uuid    not null references public.shop_product_files(id) on delete restrict,
  buyer_profile_id uuid    not null references public.profiles(id),

  token            varchar(64) unique not null,   -- 64-char crypto-random
  download_count   integer not null default 0 check (download_count >= 0),
  max_downloads    integer not null check (max_downloads > 0),
  expires_at       timestamptz not null,

  created_at       timestamptz not null default now()
);
```

**RLS:** Buyers can SELECT their own tokens. INSERT/UPDATE/DELETE blocked (Edge Function only).

---

## Enums

```sql
create type public.shop_product_type_enum as enum (
  'digital', 'physical'
);

create type public.shop_order_item_status_enum as enum (
  'pending', 'paid', 'fulfilled', 'processing',
  'shipped', 'delivered', 'cancelled', 'refunded'
);

create type public.shop_payment_method_enum as enum (
  'online', 'cod'
);

create type public.shop_policy_type_enum as enum (
  'return_refund', 'digital_products', 'shipping',
  'privacy', 'terms_of_service'
);

-- Three-state approval lifecycle for draft tables.
-- 'approved' is never persisted — draft is deleted on approval.
create type public.shop_approval_status_enum as enum (
  'pending',   -- submitted by owner, awaiting manager action
  'approved',  -- (transitional only — draft deleted immediately after)
  'rejected'   -- manager rejected; rejection_reason shown in Studio
);
```

---

## Manager RLS Policies

Content managers (`content.approve`, `content.moderate`, `content.delete`) and finance managers (`transactions.view`) have read and moderation access across shop tables.

| Table | Operation | Permission |
|---|---|---|
| `shop_settings` | UPDATE | `content.moderate` |
| `shop_categories` | SELECT | `content.approve` |
| `shop_categories` | UPDATE | `content.moderate` |
| `shop_categories` | DELETE | `content.delete` |
| `shop_products` | SELECT | `content.approve` |
| `shop_products` | UPDATE | `content.moderate` |
| `shop_products` | DELETE | `content.delete` |
| `shop_category_drafts` | SELECT | `content.approve` |
| `shop_category_drafts` | UPDATE | `content.moderate` |
| `shop_category_drafts` | DELETE | `content.delete` |
| `shop_product_drafts` | SELECT | `content.approve` |
| `shop_product_drafts` | UPDATE | `content.moderate` |
| `shop_product_drafts` | DELETE | `content.delete` |
| `shop_orders` | SELECT | `transactions.view` |
| `shop_order_items` | SELECT | `transactions.view` |

For draft approval/rejection use the dedicated RPCs (`approve_shop_category`, `reject_shop_category`, `approve_shop_product`, `reject_shop_product`) — they handle the draft-deletion side effects and activity notifications. Direct UPDATE is available for metadata overrides.

To toggle a shop's `is_active` state from the admin panel, use `set_shop_active_by_manager()` — it bypasses the seller eligibility check that `upsert_shop_settings` enforces.

Note on product deletes: the `"Block direct product deletes"` policy (`using (false)`) blocks all regular users. The manager `DELETE` policy is a separate permissive policy that overrides this for managers with `content.delete`.

---

## Indexes

Key indexes beyond the primary keys:

| Table | Index | Purpose |
|---|---|---|
| `user_addresses` | `(profile_id) WHERE is_default = true` (unique) | One default per profile |
| `shop_categories` | `(product_count)` | Efficient count updates |
| `shop_products` | `(profile_id, is_active, sort_order) WHERE is_deleted = false` | Paginated product grid |
| `shop_products` | `(profile_id, is_featured) WHERE is_featured = true ...` | Profile card featured strip |
| `shop_products` | `(profile_id, sales_count desc) WHERE is_active ...` | Top-sellers list |
| `shop_category_drafts` | `(created_at) WHERE approval_status = 'pending'` | Manager approval queue |
| `shop_product_drafts` | `(created_at) WHERE approval_status = 'pending'` | Manager approval queue |
| `shop_orders` | `(seller_profile_id, created_at desc)` | Seller order list |
| `shop_orders` | `(seller_profile_id, created_at) WHERE payment_method = 'cod' AND cod_settled_at IS NULL` | COD aging check |
| `shop_order_items` | `(order_id, status) WHERE status = 'delivered' AND cod_settled_at IS NULL` | Cash-pending tab |
