# Day 21 — Scheduled Jobs (pg_cron), JSON Aggregation, and Privilege Grants

## Goal

By the end of today you can read and write `pg_cron` schedules, understand `array_agg`/`jsonb_agg` for collapsing related rows into a single column, and correctly use `GRANT`/`REVOKE` to control which roles (`anon`, `authenticated`, `service_role`) can access tables and functions.

---

## Resources

- [pg_cron extension](https://github.com/citusdata/pg_cron)
- [Supabase: Scheduling jobs with pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [PostgreSQL: array_agg](https://www.postgresql.org/docs/current/functions-aggregate.html)
- [PostgreSQL: GRANT](https://www.postgresql.org/docs/current/sql-grant.html)
- [PostgreSQL: REVOKE](https://www.postgresql.org/docs/current/sql-revoke.html)
- [Crontab syntax reference](https://crontab.guru/)

---

## Why this matters

This project relies on background jobs for things that must happen "later" or "periodically" with no user request driving them: expiring stale KYC sessions, recomputing the feed ranking algorithm, cleaning up old message partitions, sending membership-expiry notifications. All of these are `pg_cron` jobs defined directly in the schema files. Meanwhile, `array_agg`/`jsonb_agg` are how this project turns "a profile and its related rows" into the single nested JSON object the frontend expects. And every table/function in this project has explicit `GRANT`/`REVOKE` statements — get these wrong and you either break the app (over-revoke) or create a security hole (under-revoke), which is exactly what `.claude/rules/rls-audit.md` audits for.

---

## Part 1 — `pg_cron`: scheduling jobs inside PostgreSQL

`pg_cron` is a PostgreSQL extension that runs SQL on a cron schedule, **inside the database itself** — no external scheduler needed.

### Enabling the extension

```sql
-- from messaging.sql
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;
```

> Several schema files note that `pg_cron` must be enabled via the **Supabase dashboard** (Database → Extensions) on hosted projects — it can't always be enabled by a migration alone, since it requires superuser-level setup on the underlying instance.

### `cron.schedule(name, schedule, command)`

```sql
-- from kyc.sql: expire stale KYC sessions every hour, on the hour
select cron.schedule(
  'expire-kyc-sessions',
  '0 * * * *',
  $$
    update public.kyc_sessions
    set status = 'expired', updated_at = now()
    where status in ('pending', 'opened')
      and expires_at < now();
  $$
);
```

- **`'expire-kyc-sessions'`** — a unique job name. Re-running `cron.schedule` with the same name **updates** that job's schedule/command rather than creating a duplicate.
- **`'0 * * * *'`** — standard 5-field cron syntax: `minute hour day month weekday`. `0 * * * *` = "at minute 0 of every hour" = hourly.
- **`$$ ... $$`** — the SQL to run, as a dollar-quoted string (Day 6). Can be a raw statement or a function call.

### Calling a function instead of inline SQL

```sql
-- from kyc.sql: runs 30 minutes after expire-kyc-sessions
select cron.schedule(
  'cleanup-kyc-orphaned-files',
  '30 * * * *',
  $$ select public.cleanup_orphaned_kyc_documents(); $$
);
```

Preferred for anything beyond a one-line `UPDATE`/`DELETE` — keeps the logic testable as a normal PL/pgSQL function (Day 6), with the cron job just being a thin trigger.

### Reading other cron schedules in this project

| Job | Schedule | What it does | File |
|-----|----------|---------------|------|
| `expire-kyc-sessions` | `0 * * * *` (hourly) | Marks stale KYC sessions as expired | `kyc.sql` |
| `cleanup-kyc-orphaned-files` | `30 * * * *` (hourly, offset) | Deletes orphaned storage files | `kyc.sql` |
| `recompute-feed-rank-scores` | `*/30 * * * *` (every 30 min) | Recomputes feed ranking algorithm | `feed.sql` |
| `create-next-month-messages-partition` | `0 0 25 * *` (25th of each month) | Creates next month's `messages` partition (Day 20) | `messaging.sql` |
| `drop-old-message-partitions` | `0 2 * * *` (daily, 2am) | Drops expired message partitions | `messaging.sql` |
| membership expiry notifications | nightly at 22:00 UTC | Sends expiry warnings/notices | `memberships.sql` |
| newsletter subscriber digest | nightly at 02:00 UTC | Sends digest emails | `newsletter_service.sql` |

### Why `'0 0 25 * *'` for the partition job (ties back to Day 20)

Creating the next month's partition on the **25th** (not the 1st) gives a 5-6 day buffer before the new month starts — if the cron job fails for some reason, there's time to notice and create the partition manually before any `INSERT` would fall through to `messages_default`.

### Locking down cron-only functions

```sql
-- from feed.sql
revoke execute on function public.recompute_feed_rank_scores() from public, anon, authenticated;
```

Functions meant to be called **only** by `pg_cron` (which runs as a privileged role, typically `postgres`) should have `EXECUTE` revoked from `anon`/`authenticated`/`public` — a regular user should never be able to trigger a full feed recompute or partition maintenance directly via the API.

---

## Part 2 — `array_agg` and `jsonb_agg`: collapsing rows into one value

These are aggregate functions (Day 4), but instead of producing a number, they produce an **array** or a **JSON array** — one value representing *all* the matched rows.

### `array_agg` — real example (`creators.sql`)

```sql
select
  p.username,
  p.display_name,
  -- ... other profile columns ...
  (
    select array_agg(us.service order by us.service)
    from public.user_services us
    where us.profile_id = p.id
      and us.is_enabled = true
  ) as services
from public.profiles p;
```

For each profile `p`, the scalar subquery runs `array_agg` over that profile's enabled `user_services` rows, producing something like `{coffee_donation, newsletter, shop}` — a single Postgres array value in the `services` column. `ORDER BY us.service` inside `array_agg` controls the order of elements in the resulting array (aggregate functions don't guarantee row order otherwise).

If a profile has **no** enabled services, `array_agg` over zero rows returns `NULL` (not an empty array `{}`) — something to handle on the client side, or wrap in `COALESCE(array_agg(...), '{}')` if an empty array is preferred.

### `jsonb_agg` — real example (`messaging.sql`)

```sql
(
  select jsonb_agg(
    jsonb_build_object('id', p.id, 'username', p.username, 'avatar_url', p.avatar_url)
  )
  from public.conversation_participants cp2
  join public.profiles p on p.id = cp2.profile_id
  where cp2.conversation_id = uc.id
) as participants
```

Same idea, but each "row" is first turned into a JSON object with `jsonb_build_object` (Day 4), and `jsonb_agg` collects all those objects into a single JSON **array**:

```json
[
  {"id": "...", "username": "alice", "avatar_url": "..."},
  {"id": "...", "username": "bob", "avatar_url": "..."}
]
```

This is the standard pattern for "attach a list of related records as a nested JSON array" in an RPC's output — the client gets one row with a `participants` field that's already an array of objects, with no extra round-trips or client-side joining.

### `array_agg` vs `jsonb_agg` — when to use which

- **`array_agg`** — when the related values are all the *same simple type* (text, uuid, enum) and the client just needs a list, e.g. `services`, `tags`, `category` lists.
- **`jsonb_agg`** (usually combined with `jsonb_build_object`) — when each related row has *multiple fields* the client needs as a nested object, e.g. `participants`, `comments`, `line_items`.

---

## Part 3 — `GRANT` and `REVOKE`: controlling role access

PostgreSQL privileges are **separate from and in addition to** RLS (Day 8). RLS controls *which rows* a role can see/touch within a table it's allowed to query at all; `GRANT`/`REVOKE` controls *whether the role can query the table/function at all*. You need both layers: a role with no `GRANT` can't read a table no matter how permissive its RLS policies are, and a role with `GRANT` but restrictive RLS still can't see rows that don't match the policy.

### The three roles you'll see constantly

| Role | Used by |
|------|---------|
| `anon` | Unauthenticated requests (public API, no logged-in user) |
| `authenticated` | Logged-in users (any role: regular user, creator, manager) |
| `service_role` | Server-side/Edge Function calls that bypass RLS entirely (trusted backend code) |

### `REVOKE ALL ... FROM anon` — the default-deny pattern

```sql
-- from coffee_gifts.sql
revoke all on table public.coffee_gifts from anon;

-- from activities.sql
revoke all on table public.activities from anon;
```

Most tables in this project should **not** be readable by anonymous users at all — `revoke all ... from anon` is the first line of defense, before RLS policies even come into play. This is exactly the pattern enforced by `.claude/rules/rls-audit.md`: every table should have `anon` access fully revoked unless there's a specific, confirmed reason for public read access.

### `GRANT SELECT ... TO anon, authenticated` — for genuinely public data

```sql
-- from bd-geo-locations.sql
revoke all on divisions  from public, anon, authenticated;
revoke all on districts  from public, anon, authenticated;
revoke all on upazillas  from public, anon, authenticated;
revoke all on unions     from public, anon, authenticated;

grant select on divisions  to anon, authenticated;
grant select on districts  to anon, authenticated;
grant select on upazillas  to anon, authenticated;
grant select on unions     to anon, authenticated;
```

Bangladesh's administrative geography (divisions/districts/upazillas/unions) is **reference/lookup data** — the same for every user, not user-owned, no reason to restrict it. The pattern here is: **revoke everything first** (clean slate, no inherited privileges), **then grant back exactly what's needed** (`select` only — no `insert`/`update`/`delete` for any client role; only migrations/admins change this data).

### `GRANT EXECUTE` / `REVOKE EXECUTE` on functions

Functions need their own grants, separate from the tables they touch — this is especially important for `SECURITY DEFINER` functions (Day 6/12), which run with the *function owner's* privileges regardless of who calls them.

```sql
-- from activities.sql: a public RPC, callable by logged-in users
grant execute on function get_creator_public_activities(uuid, int, timestamptz, uuid)
  to authenticated;

-- from feed.sql: search is for logged-in users only, not anonymous
revoke execute on function public.search_feed(text, int, bigint) from anon;
grant execute on function public.search_feed(text, int, bigint) to authenticated;

-- from wallets.sql / profiles.sql: internal trigger functions, nobody should call directly
revoke execute on function public.handle_wallet_balance_change() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
```

Notice the function **signature** (parameter types) is part of what you grant/revoke on — `search_feed(text, int, bigint)` — because PostgreSQL allows multiple functions with the same name but different parameter types (overloading).

### Decision checklist when adding a new table or function

1. Does `anon` need access at all? Default to **no** — `revoke all ... from anon`.
2. Does `authenticated` need raw table access, or only via RPC functions? Prefer RPCs for anything beyond simple owner-scoped reads.
3. For every `SECURITY DEFINER` function: who should be able to call it — `anon`, `authenticated`, or neither (cron/service-role only)? Revoke from everyone else explicitly.
4. Is this a trigger function (Day 6)? It should never be directly callable — `revoke execute ... from public, anon, authenticated`.

---

## Exercises

1. Open `supabase/schemas/memberships.sql` and find the `pg_cron` schedule for membership-expiry notifications. What time does it run (UTC and BDT)? Why might "nightly" be sufficient instead of hourly for this job?

2. Open `supabase/schemas/messaging.sql` and find `create_next_month_partition` and `drop_old_partitions`. Read each function body and, in plain English, describe what each does. Cross-reference with Day 20 — what would happen to the `messages` table if both cron jobs were disabled for 3 months?

3. Write a query (doesn't need to run) that returns each creator's `username` plus a `jsonb_agg` of their last 5 coffee gifts (`supporter_name`, `coffee_count`, `created_at`), ordered by `created_at` descending. Use a correlated subquery like the `participants` example above.

4. Open `supabase/schemas/shop_service.sql` and find one table. Check: does it have `revoke all ... from anon`? Does it have any `grant select ... to authenticated`? If `authenticated` has no direct table grant, how do users read this table's data — find the RPC function(s) instead.

5. A new table `public.creator_payout_settings` stores sensitive bank details. Write the `revoke`/`grant` statements you'd add, following the patterns above, assuming: `anon` should never access it, `authenticated` users should only access their *own* row (via RLS, not direct grants beyond `select`/`update`), and there's a `SECURITY DEFINER` function `get_payout_settings(p_profile_id uuid)` that only `authenticated` should call.

6. Find one `revoke execute ... from public, anon, authenticated` in `wallets.sql` or `profiles.sql` on a trigger function. Explain: if this revoke were *missing*, could a regular authenticated user call this function directly via `supabase.rpc(...)`? What's the worst thing they could do if they could?
