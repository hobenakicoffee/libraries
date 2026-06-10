# Day 3 — Joining Tables: Relationships and Foreign Keys

## Goal

By the end of today you understand foreign keys, can write JOIN queries across multiple tables, and can trace the relationships between the main tables in this project.

---

## Resources

- [SQLBolt lessons 6–12](https://sqlbolt.com/lesson/select_queries_with_joins) — JOINs (do these today)
- [PostgreSQL JOINs visual explanation — Atlassian](https://www.atlassian.com/data/sql/sql-join-types-explained-visually)
- [PostgreSQL Foreign Keys](https://www.postgresql.org/docs/current/tutorial-fk.html)
- [Use the Index, Luke — joins](https://use-the-index-luke.com/sql/join) — deeper reading for later

---

## Foreign keys — linking tables together

A **foreign key** is a column whose value must match the primary key of another table. It enforces a relationship.

Example from `supabase/schemas/profiles.sql`:
```sql
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  ...
);
```

The `id` column is both the primary key of `profiles` AND a foreign key pointing at `auth.users`. Every profile must correspond to a real auth user.

From `supabase/schemas/follows.sql`:
```sql
create table public.follows (
  follower_id  uuid references public.profiles on delete cascade,
  following_id uuid references public.profiles on delete cascade,
  ...
);
```

Both `follower_id` and `following_id` reference the `profiles` table — a follows row links two profiles.

The naming convention in this project: `{referenced_table}_id`. So `profile_id` always points to `public.profiles`, `wallet_id` to `public.wallets`, etc.

---

## JOIN — combining data from multiple tables

```sql
SELECT a.col1, b.col2
FROM table_a a
JOIN table_b b ON a.foreign_key = b.id;
```

The alias (`a`, `b`) is shorthand so you don't have to type the full table name every time.

### INNER JOIN (default JOIN)

Only returns rows where the join condition matches in BOTH tables.

```sql
-- get transaction details with the profile username
SELECT
  t.id,
  t.net_amount,
  t.status,
  p.username
FROM public.transactions t
JOIN public.profiles p ON t.user_profile_id = p.id
WHERE t.status = 'completed'
ORDER BY t.created_at DESC
LIMIT 20;
```

### LEFT JOIN

Returns all rows from the LEFT table, plus matching rows from the RIGHT table. If there's no match, right-table columns are NULL.

```sql
-- all profiles, plus their wallet balance if they have one
SELECT
  p.username,
  p.is_page_active,
  w.balance
FROM public.profiles p
LEFT JOIN public.wallets w ON w.profile_id = p.id;
```

A profile without a wallet row will have `w.balance = NULL`.

### Joining through multiple tables

```sql
-- supporters with the gifter's and creator's username
SELECT
  s.id,
  gifter.username AS gifter_username,
  creator.username AS creator_username,
  s.total_amount
FROM public.supporters s
JOIN public.profiles gifter  ON s.profile_id = gifter.id
JOIN public.profiles creator ON s.creator_id  = creator.id;
```

Notice that `public.profiles` is joined twice with different aliases — `gifter` and `creator` — because `supporters` links two profiles.

---

## How this project's tables relate

Here is the high-level relationship map you need to know:

```
auth.users (Supabase built-in)
  └── profiles (1:1, cascade delete)
        ├── wallets (1:1)
        │     └── transactions (many per wallet/profile)
        │           └── withdrawal_requests (many)
        ├── followers / following → follows (many:many self-join)
        ├── supporters (many — who supported whom)
        ├── memberships (subscriptions to creators)
        ├── coffee_gifts (one-time gifts)
        ├── activities (event log per profile)
        ├── payout_methods (bank/bkash accounts)
        └── user_services
              ├── newsletter_service (1:1)
              └── shop_service (1:1, with shop_products)
```

---

## Aggregating joined data

You'll often want to count or sum related rows. Use `GROUP BY` with JOIN:

```sql
-- count how many times each creator has been supported
SELECT
  p.username,
  COUNT(s.id) AS support_count,
  SUM(s.total_amount) AS total_earned
FROM public.profiles p
LEFT JOIN public.supporters s ON s.creator_id = p.id
GROUP BY p.id, p.username
ORDER BY total_earned DESC NULLS LAST;
```

`NULLS LAST` puts NULL values (profiles with no supporters) at the bottom.

---

## Subqueries

Sometimes you need the result of one query inside another:

```sql
-- profiles that have at least one completed transaction
SELECT username
FROM public.profiles
WHERE id IN (
  SELECT user_profile_id
  FROM public.transactions
  WHERE status = 'completed'
);
```

An alternative using EXISTS (often faster):

```sql
SELECT username
FROM public.profiles p
WHERE EXISTS (
  SELECT 1
  FROM public.transactions t
  WHERE t.user_profile_id = p.id
  AND t.status = 'completed'
);
```

---

## Self-referential joins: the follows table

The `follows` table is a self-join on `profiles`. Both `follower_id` and `following_id` point to `profiles.id`.

```sql
-- who is user X following?
SELECT
  target.username AS following
FROM public.follows f
JOIN public.profiles target ON target.id = f.following_id
WHERE f.follower_id = 'user-x-uuid';

-- who follows user X?
SELECT
  follower.username AS follower
FROM public.follows f
JOIN public.profiles follower ON follower.id = f.follower_id
WHERE f.following_id = 'user-x-uuid';
```

---

## Exercises

1. **SQLBolt:** Complete lessons 6–12 at [sqlbolt.com](https://sqlbolt.com/).

2. Write a query that lists all transactions for a given `user_profile_id`, showing the profile's `username` alongside `net_amount`, `status`, and `created_at`. (JOIN `transactions` with `profiles`.)

3. Write a query that lists all profiles and their wallet `balance`. Include profiles that have no wallet (use LEFT JOIN). Order by balance descending, nulls last.

4. Open `supabase/schemas/followers.sql` (or `follows.sql`). Draw (on paper or in a comment) the relationships defined there. Which table does each foreign key point to?

5. Write a query that counts how many followers each profile has, using a JOIN (not the cached `follower_count` column). Compare your result with the `follower_count` column to see if the cache is accurate.

6. Open `supabase/schemas/memberships.sql`. What tables does it reference via foreign keys? Write a JOIN query that shows the subscriber's `username`, the creator's `username`, and the membership `status`.
