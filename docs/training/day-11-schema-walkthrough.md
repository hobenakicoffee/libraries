# Day 11 — Project Schema Walkthrough: Profiles, Common, Managers

## Goal

By the end of today you have a complete mental map of the project's data model. You can look at any schema file and understand its purpose, its relationships, and the business logic it encodes.

---

## Resources

- All files in `supabase/schemas/` — read today alongside this guide
- `supabase/schemas/common.sql` — shared types and functions
- `supabase/schemas/profiles.sql` — core user identity
- `supabase/schemas/managers.sql` — RBAC system

---

## How to read a schema file

Each schema file follows this structure:

1. **Custom types / enums** — data types used by this table
2. **Table definition** — `CREATE TABLE` with all columns
3. **Comments** — `COMMENT ON TABLE/COLUMN` explaining intent
4. **Helper functions** — SQL functions related to this domain
5. **RLS** — `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policies
6. **Indexes** — performance indexes
7. **RPCs** — stored procedures called by the client
8. **Triggers** — auto-maintenance logic
9. **Grants/Revokes** — access control for functions

---

## The schema dependency order

Tables must be created in dependency order (referenced tables first). The migration files show this:

```
init (extensions)
  → common (enums, shared functions)
    → profiles (depends on auth.users)
      → platform_settings
      → managers (depends on auth.users, profiles)
      → messaging (depends on profiles)
      → supporters (depends on profiles)
      → wallets (depends on profiles)
        → transactions (depends on wallets, profiles)
          → payments (depends on transactions)
          → withdrawal_requests (depends on wallets)
      → activities (depends on profiles)
      → memberships (depends on profiles)
      → follows (depends on profiles)
      → user_services (depends on profiles)
        → newsletter_service (depends on user_services)
        → shop_service (depends on user_services)
      → coffee_gifts (depends on profiles)
      → kyc (depends on profiles)
      → feed (depends on profiles, newsletter_service, shop_service)
      → reviews (depends on profiles, shop_service)
      → creator_reports (depends on profiles)
```

---

## `common.sql` — the foundation

This file has no tables. It defines:

**Enums** (shared types used across many tables):
- `payment_status_enum` — transaction/payment lifecycle
- `payout_provider` — bkash, nagad, rocket, bank
- `withdrawal_status` — withdrawal request lifecycle
- `transaction_direction_enum` — debit / credit
- `provider_enum` — payment gateway list
- `visibility_enum` — public / private
- `supporter_platform_enum` — social platform names
- `reference_type_enum` — what a transaction represents

**Functions**:
- `handle_updated_at()` — trigger function used by every table to auto-update `updated_at`

---

## `profiles.sql` — user identity and the central hub

Every other table eventually connects back to `profiles`. Understanding this table deeply is essential.

**Key column groups:**

| Group | Columns | Purpose |
|-------|---------|---------|
| Identity | `id`, `username`, `display_name`, `bio`, `avatar_url`, `banner_url` | Public profile |
| Navigation | `page_slug` | The creator's public URL slug |
| RBAC | `role` | `user` or `admin` |
| Customization | `theme`, `layout`, `social_links`, `thank_you_items` | JSONB, flexible |
| Onboarding | `onboarding_step`, `onboarding_completed_at`, `has_first_service` | Progress tracking |
| Feature flags | `allow_gifting`, `allow_subscriptions`, `is_page_active` | Toggle platform features |
| Stats (cached) | `follower_count`, `following_count`, `total_supporter_count` | Denormalized for performance |
| Computed | `popularity_score` | Generated always, used for explore sort |
| KYC | `is_kyc_verified`, `is_verified`, `kyc_verified_at` | Identity verification |

**Why are counts cached?** Computing `COUNT(*) FROM follows WHERE following_id = profile_id` on every page load would be slow. Instead, triggers on the `follows` and `supporters` tables increment/decrement these counters atomically — the result is always correct and instant to read.

**Triggers:**
- `on_profile_updated` → `handle_updated_at()` — auto-sets `updated_at`
- `on_auth_user_created` → `handle_new_user()` — auto-creates profile on signup

**Key functions:**
- `is_admin()` — checks `role = 'admin'` for the current user
- `handle_new_user()` — creates the profile row on first signup
- `moderate_user()` — manager RPC to suspend/enable users/content

---

## `managers.sql` — RBAC for the admin panel

This is the most complex schema. Read it as three separate systems:

### 1. The RBAC data model

Three tables:
- `managers` — manager account data (linked to `auth.users`)
- `manager_user_roles` — which role each manager has (one per manager)
- `manager_role_permissions` — which permissions each role has (many per role)

```
manager_role (e.g., 'finance_manager')
    ↓
manager_role_permissions
    ↓
manager_permission (e.g., 'payouts.approve')
```

### 2. Permission checking: `authorize_manager(permission)`

```sql
SELECT COUNT(*)
FROM public.manager_role_permissions
WHERE permission = requested_permission
  AND role = (auth.jwt() ->> 'manager_role')::public.manager_role;
```

This reads the `manager_role` from the JWT (no database lookup for the role itself — it's baked into the token). Then checks if that role has the requested permission.

### 3. The JWT hook: `custom_access_token_hook(event)`

Called by Supabase Auth on every login. Injects `manager_role` into the JWT:

```sql
SELECT role INTO user_role
FROM public.manager_user_roles
WHERE user_id = (event ->> 'user_id')::UUID;

claims := jsonb_set(claims, '{manager_role}', to_jsonb(user_role));
```

Result: every API call from a manager carries their role in the token — fast, no extra DB roundtrips.

---

## Walking through each remaining schema

Open each file as you read these descriptions:

### `wallets.sql`
One wallet per profile. Tracks `balance` (available), `locked_balance` (pending withdrawals). Never set `balance` directly — always use the transaction-based RPCs which update both the wallet and create a transaction record atomically.

### `transactions.sql`
Immutable ledger — never updated, only inserted. Every money movement (gift received, subscription payment, withdrawal, refund) creates a transaction row. `direction` is `credit` (money in) or `debit` (money out).

### `activities.sql`
Event log for user-visible activity history. Stores rich `payload` JSONB. Used for the activity feed on each creator's page.

### `follows.sql`
Composite primary key `(follower_id, following_id)`. Triggers maintain `follower_count` and `following_count` on `profiles` — these counters auto-update on INSERT and DELETE from this table.

### `supporters.sql`
One row per (supporter, creator) pair. Aggregates total gifted/subscribed amount. Triggers update `total_supporter_count` on `profiles`.

### `memberships.sql`
Subscription to a creator's newsletter/content. Has `status` (active, cancelled, expired, paused) and `tier_id` linking to membership tier definitions.

### `coffee_gifts.sql`
One-time gift from a supporter to a creator. Contains the gift amount, message, and visibility setting.

### `newsletter_service.sql`
The creator's newsletter/blog. Has posts with `published_at` and `visibility_enum`. When a post is published, a trigger auto-creates a `feed_item`.

### `shop_service.sql`
The creator's digital product shop. Has `shop_settings` (branding) and `shop_products` (items for sale). When a product is published, a trigger auto-creates a `feed_item`.

### `feed.sql`
Central discovery feed. `feed_items` rows are auto-created by triggers on `newsletter_service` and `shop_service`. Has interaction tables (`feed_likes`, `feed_comments`, `feed_shares`) with counter-cache triggers.

### `kyc.sql`
KYC (Know Your Customer) verification flow. Used before a creator can withdraw funds. Has document upload tracking and status management.

### `creator_reports.sql`
Abuse/report system. Supporters and viewers can report creators; managers can review and resolve reports.

---

## Exercises

1. Open `supabase/schemas/wallets.sql`. What columns does it have? What constraints prevent the balance from going negative? What trigger(s) exist?

2. Open `supabase/schemas/follows.sql`. Find the trigger that updates `follower_count` and `following_count` on `profiles`. Trace its logic: what happens on INSERT? What happens on DELETE?

3. Open `supabase/schemas/transactions.sql`. Can transactions be UPDATE'd or DELETE'd based on RLS? Should they be? Why?

4. Open `supabase/schemas/feed.sql`. Find the trigger that creates `feed_items` when a newsletter post is published. What conditions must be true for the feed item to be created?

5. Draw (on paper or in comments) the full relationship diagram between `profiles`, `wallets`, `transactions`, `withdrawal_requests`, and `payout_methods`. Which direction do foreign keys point?

6. Open `supabase/schemas/memberships.sql`. What are the possible statuses? What RLS policy controls who can see a membership record?
