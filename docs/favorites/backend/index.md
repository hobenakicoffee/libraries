# Favorites — Backend Reference

Service-agnostic favorites core: one row per (user, target), usable by any service
— consumed by shop's heart button today, designed for other services (memberships,
etc.) to adopt later without schema changes to this module. Lives in
`supabase/schemas/favorites.sql`.

::: info Generic core, not shop-specific
This module has **no knowledge** of shop's tables (`shop_products`). A consuming
service integrates by calling `toggle_favorite`/`is_favorited`/`list_favorites`
directly — they're `authenticated`-callable, unlike
[`coupons.sql`](../../coupons/backend/index)'s fully internal RPCs — optionally
wrapped in its own RPC that validates `target_id` against its own table first. See
[shop-service's Favorites section](../../shop-service/backend/rpc-reference#favorites)
for the concrete integration (`toggle_shop_favorite`).
:::

## Tables

### `favorites`

| Column | Type | Notes |
|---|---|---|
| `profile_id` | uuid → profiles(id) | The favoriter |
| `service_type` | varchar(50) | Which service owns this row (e.g. `'shop'`). A plain tag, not FK'd — matches the `coupons.service_type` / `transactions.service_type` convention |
| `target_type` | varchar(50) | Which kind of resource within the service (e.g. `'shop_product'`). Not FK'd |
| `target_id` | uuid | The favorited resource's id in the owning service's own table. Not FK'd — the calling service's own wrapper RPC is responsible for validating it exists, if it wants that (e.g. shop's `toggle_shop_favorite`) |
| `created_at` | timestamptz | |

Unique on `(profile_id, service_type, target_type, target_id)` — this constraint's
backing index doubles as the point-lookup index the storefront listing RPCs use for
their per-row `is_favorited` check; no separate index is needed.

**Deliberate relaxation vs. coupons**: `toggle_favorite` does not validate that
`target_id` exists in the caller's table. A dangling favorite (pointing at a
deleted/nonexistent target) causes no financial/inventory harm, unlike a coupon
redemption — the calling service's own hydration simply won't surface it. A service
that wants existence validation does that itself in its own wrapper RPC before
delegating to `toggle_favorite` (e.g. `toggle_shop_favorite` rejects a
nonexistent/inactive product with `PRODUCT_NOT_FOUND`, then calls the generic core).

## RLS

`revoke all from anon`; `select` for the favorite's own owner
(`profile_id = auth.uid()`) only — no manager/support visibility clause, narrower
than coupons (there's no known support use case for browsing another profile's
favorites today). **All writes blocked** (`with check (false)`) — mutations are
RPC-only, same defense-in-depth idiom as `coupons`/`coupon_targets`.

## RPCs

Unlike coupons' fully internal RPCs (revoked from `public`/`anon`/`authenticated`),
all three below are directly `authenticated`-callable (revoked only from
`public`/`anon`) — there's no cross-table atomicity requirement forcing a
service-specific wrapper for the write path, since a bogus `target_id` is harmless.

### `toggle_favorite`

```sql
public.toggle_favorite(
  p_service_type varchar,
  p_target_type  varchar,
  p_target_id    uuid
) → jsonb
```

Adds the favorite if absent, removes it if present. `{success:true, favorited}`.
`UNAUTHENTICATED` if called with no session. Does not validate `target_id` — see the
relaxation note above. Callers that need validation should call their own wrapper
RPC instead (e.g. shop's `toggle_shop_favorite`).

### `is_favorited`

```sql
public.is_favorited(
  p_service_type varchar,
  p_target_type  varchar,
  p_target_id    uuid
) → boolean
```

Whether the caller has favorited the given target. Returns `false` (not an error)
for an unauthenticated caller.

### `list_favorites`

```sql
public.list_favorites(
  p_service_type varchar     default null,
  p_target_type  varchar     default null,
  p_limit        integer     default 20,
  p_cursor       timestamptz default null
) → jsonb
```

Keyset-paginated list of the caller's own favorites, newest first, optionally
scoped to `p_service_type`/`p_target_type`. `{success, favorites: [{service_type,
target_type, target_id, created_at}], has_more, next_cursor}`. `p_limit` clamped to
50. Does not hydrate target details (e.g. a product's title) — the calling
service's own listing RPC does that, exactly like `coupon_targets` doesn't hydrate
product names either.
