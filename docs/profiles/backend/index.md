# Profiles — Backend Reference

The `profiles` table is the core user entity, linked 1:1 with `auth.users`.
Defined in `supabase/schemas/profiles.sql`.

---

## `profiles` Table

```sql
create type public.user_role as enum ('user', 'admin');
```

### Columns

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid PK` | — | References `auth.users` on delete cascade |
| `full_name` | `text` | — | Legal or displayable full name |
| `username` | `text` | `unique not null` | Public username (3–50 chars) |
| `display_name` | `text` | — | Public display name |
| `bio` | `text` | — | Profile biography |
| `avatar_url` | `text` | — | Avatar image URL |
| `banner_url` | `text` | — | Banner image URL |
| `page_slug` | `text` | `unique not null` | Public page URL slug |
| `role` | `user_role` | `'user'` | Access control role |
| `theme` | `jsonb` | — | Profile theme (colors, fonts) |
| `layout` | `jsonb` | — | Page builder layout |
| `onboarding_step` | `int` | `0` | Current onboarding step (0–5, 0 = not started) |
| `onboarding_completed_at` | `timestamptz` | — | When onboarding was completed (100%) |
| `has_first_service` | `boolean` | `false` | Whether user added their first service |
| `first_service_name` | `text` | — | Name of the first service added |
| `allow_gifting` | `boolean` | `true` | Whether gifting is enabled |
| `allow_subscriptions` | `boolean` | `true` | Whether subscriptions are enabled |
| `is_page_active` | `boolean` | `true` | Master on/off switch for public page |
| `has_wallet_balance` | `boolean` | `false` | Whether profile has a wallet balance |
| `is_founder_discount` | `boolean` | `false` | Founder 1,000 cohort perk — when true, `get_creator_effective_fee_rate()` returns the configured `founder_discount_fee_rate` (default 0) for all service types |
| `email_notifications_enabled` | `boolean` | `true` | Master kill-switch for all email notifications |
| `social_links` | `jsonb` | `'[]'` | Social link entries |
| `thank_you_items` | `jsonb` | `'[]'` | Items shown after successful gifting |
| `categories` | `text[]` | `'{}'` | Creator self-selected categories (e.g., Tech, Comedy, Business) |
| `follower_count` | `bigint` | `0` | Number of followers |
| `following_count` | `bigint` | `0` | Number of accounts this profile follows |
| `total_supporter_count` | `bigint` | `0` | Denormalized count of unique supporters (maintained by trigger on `supporters` table) |
| `popularity_score` | `bigint` | `GENERATED` | `follower_count + (total_supporter_count * 5)`; used for explore page sort order |
| `is_kyc_verified` | `boolean` | `false` | Internal gate: must be true before any withdrawal is processed |
| `is_verified` | `boolean` | `false` | Public blue badge; granted on KYC approval |
| `kyc_verified_at` | `timestamptz` | — | When KYC verification was completed |
| `accepted_creator_agreement_at` | `timestamptz` | — | When the creator last accepted the Creator Agreement |
| `creator_agreement_version` | `varchar(20)` | — | Version string of the accepted Creator Agreement |
| `suspension_reason` | `text` | — | Audit trail for the most recent suspension |
| `suspended_at` | `timestamptz` | — | When this profile was last suspended |
| `suspended_by` | `uuid` | — | Manager profile who last suspended this profile (references `profiles(id)`, on delete set null) |
| `tin_number` | `varchar(20)` | — | Self-reported NBR Taxpayer Identification Number |
| `bin_number` | `varchar(20)` | — | Self-reported NBR Business Identification Number |
| `vat_registered` | `boolean` | `false` | Self-reported: whether the creator has NBR VAT registration |
| `coaching_tip` | `jsonb` | — | Cached bilingual AI coaching tip: `{ tip: { en, "bn-BD" }, ctaLabel: { en, "bn-BD" }, ctaHref }` |
| `coaching_tip_generated_at` | `timestamptz` | — | When `coaching_tip` was last generated |
| `created_at` | `timestamptz` | `now()` | Row creation timestamp |
| `updated_at` | `timestamptz` | `now()` | Row last-updated timestamp |

### Constraints

| Constraint | Rule |
|---|---|
| `username_length` | `char_length(username) BETWEEN 3 AND 50` |
| `follower_count_not_negative` | `follower_count >= 0` |
| `following_count_not_negative` | `following_count >= 0` |
| `total_supporter_count_not_negative` | `total_supporter_count >= 0` |

---

## `public_profiles` View

A public-safe subset of `profiles` for creator pages, explore, and public
reads. Deliberately excludes sensitive/internal columns: tax info, KYC status,
suspension audit trail, creator agreement, email preferences, coaching tip,
onboarding fields, and `is_founder_discount`.

```sql
create view public.public_profiles as
select
  id, username, display_name, full_name, bio, avatar_url, banner_url,
  page_slug, role, theme, layout, social_links, thank_you_items,
  is_page_active, is_verified, allow_gifting, allow_subscriptions,
  follower_count, following_count, total_supporter_count, popularity_score,
  categories, created_at, updated_at
from public.profiles;
```

`security_invoker` is intentionally **not** set — the view runs as its owner
so it bypasses the restrictive `profiles` SELECT policy and exposes the public
subset for every row, not just the querying user's own.

```sql
grant select on public.public_profiles to anon, authenticated;
```

---

## RLS Policies

The base `profiles` table has strict RLS. Public reads go through
`public_profiles`.

| Operation | Policy | Scope |
|---|---|---|
| `SELECT` | Owner, admins and managers can view full profile | `id = auth.uid()` OR `is_admin()` OR `authorize_manager('users.view_details')` |
| `INSERT` | Users can create their own profile | `id = auth.uid()` AND `role = 'user'` (forces user role on creation) |
| `UPDATE` | Users can update own profile, admins can update any | `USING`: `id = auth.uid() OR is_admin()`; `WITH CHECK`: own profile keeping same role, OR admin |
| `DELETE` | Users can delete own profile, admins can delete any | `id = auth.uid() OR is_admin()` |

---

## Key Functions

### `is_admin()`

```sql
public.is_admin() RETURNS boolean
```

Checks if the current authenticated user has the `admin` role.
`SECURITY DEFINER`, `STABLE`.

```sql
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
    and role = 'admin'
  );
$$;
```

### `get_own_role()`

```sql
public.get_own_role() RETURNS user_role
```

Returns the current user's own role. `SECURITY DEFINER` so it bypasses
profiles' own RLS (avoids self-referencing RLS recursion during the UPDATE
policy's WITH CHECK evaluation).

```sql
create or replace function public.get_own_role()
returns public.user_role
language sql
security definer
stable
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;
```

### `moderate_user()`

```sql
public.moderate_user(
  p_user_id             uuid,
  p_is_page_active      boolean DEFAULT null,
  p_allow_gifting       boolean DEFAULT null,
  p_allow_subs          boolean DEFAULT null,
  p_is_founder_discount boolean DEFAULT null,
  p_suspension_reason   text    DEFAULT null
) RETURNS jsonb
```

Manager-gated profile moderation RPC. `SECURITY DEFINER`.

- Setting `p_is_page_active = false` requires `authorize_manager('users.suspend')` — stamps `suspension_reason`, `suspended_at`, `suspended_by`.
- Setting `p_is_page_active = true` requires `authorize_manager('users.reactivate')` — clears suspension fields.
- Changes to `allow_gifting`, `allow_subs`, `is_founder_discount` require `authorize_manager('content.moderate')`.
- Pass `null` to leave any field unchanged.
- Returns `{"success": true}` or `{"success": false, "error": "..."}`.

### `accept_creator_agreement()`

```sql
public.accept_creator_agreement(p_version varchar) RETURNS jsonb
```

Authenticated creator records acceptance of the Creator Agreement at the given
version. Stamps `accepted_creator_agreement_at = now()` and
`creator_agreement_version = p_version` on the caller's own profile.

```sql
grant execute on function public.accept_creator_agreement(varchar) to authenticated;
```

---

## Triggers

### `on_profile_updated`

Before update on `profiles`, for each row — calls `handle_updated_at()` to
auto-set `updated_at = now()`.

### `on_auth_user_created`

After insert on `auth.users`, for each row — calls `handle_new_user()` to
auto-create a profile row on signup.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, page_slug, role, full_name, avatar_url)
  values (
    new.id,
    new.id::text,
    new.id::text,
    'user',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
```

---

## Indexes

| Index | Type | Purpose |
|---|---|---|
| `idx_profiles_page_slug` | B-tree | Unique page slug lookups |
| `idx_profiles_username` | B-tree | Unique username lookups |
| `idx_profiles_categories` | GIN | Array containment queries for explore |
| `idx_profiles_popularity` | B-tree (desc) | Partial: `WHERE has_first_service = true AND is_page_active = true`; explore sort order |
| `idx_profiles_display_name_trgm` | GIN trigram | Leading-wildcard ILIKE search |
| `idx_profiles_full_name_trgm` | GIN trigram | Leading-wildcard ILIKE search |
| `idx_profiles_username_trgm` | GIN trigram | Leading-wildcard ILIKE search |

Trigram indexes require `pg_trgm` extension (enabled idempotently).

---

## Storage Policies

### `avatars` Bucket

| Property | Value |
|---|---|
| Public | Yes |
| Max file size | 2 MB |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml` |

Policies on `storage.objects`:

| Policy | Action | Scope |
|---|---|---|
| Authenticated users can upload avatars | `INSERT` | `bucket_id = 'avatars'` AND folder starts with `auth.uid()` |
| Users can read their own avatars | `SELECT` | `bucket_id = 'avatars'` AND folder starts with `auth.uid()` |
| Users can update their own avatars | `UPDATE` | `bucket_id = 'avatars'` AND `owner = auth.uid()` |
| Users can delete their own avatars | `DELETE` | `bucket_id = 'avatars'` AND `owner = auth.uid()` |
| Admins can upload any avatar | `INSERT` | `bucket_id = 'avatars'` AND `is_admin()` |
| Admins can update any avatar | `UPDATE` | `bucket_id = 'avatars'` AND `is_admin()` |
| Admins can delete any avatar | `DELETE` | `bucket_id = 'avatars'` AND `is_admin()` |

### `banners` Bucket

| Property | Value |
|---|---|
| Public | Yes |
| Max file size | 5 MB |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml` |

Same policy structure as `avatars`, with `bucket_id = 'banners'`.
