# Day 2 — Writing Data: INSERT, UPDATE, DELETE

## Goal

By the end of today you can write SQL that creates, modifies, and removes rows in any table. You also understand transactions and why they matter for financial data.

---

## Resources

- [SQLBolt lessons 13–16](https://sqlbolt.com/lesson/inserting_rows) — INSERT, UPDATE, DELETE
- [PostgreSQL INSERT docs](https://www.postgresql.org/docs/current/sql-insert.html)
- [PostgreSQL UPDATE docs](https://www.postgresql.org/docs/current/sql-update.html)
- [PostgreSQL Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)

---

## INSERT — Creating new rows

```sql
INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...);
```

### Example: insert a row in the `activities` table

```sql
INSERT INTO public.activities (
  profile_id,
  type,
  payload
)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'gift_sent',
  '{"amount": 100, "currency": "BDT"}'::jsonb
);
```

### INSERT with RETURNING

`RETURNING` gives you back columns from the row that was just inserted — very useful for getting the auto-generated `id`:

```sql
INSERT INTO public.follows (follower_id, following_id)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'b1ffcd00-1d1c-5fg9-cc7e-7cc0ce491b22'
)
RETURNING id, created_at;
```

### ON CONFLICT — upsert pattern

Sometimes you want to insert a row if it doesn't exist, or update it if it does. This project uses this pattern for wallets, settings, etc.

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- or update on conflict:
INSERT INTO public.wallets (profile_id, balance, currency)
VALUES ('some-uuid', 0.00, 'BDT')
ON CONFLICT (profile_id) DO UPDATE
SET balance = EXCLUDED.balance;
```

`EXCLUDED` refers to the row that failed to insert (the proposed new values).

---

## UPDATE — Modifying existing rows

```sql
UPDATE table_name
SET column1 = value1, column2 = value2
WHERE condition;
```

**Always include a WHERE clause.** Without it you update every row in the table.

```sql
-- mark a profile's onboarding as complete
UPDATE public.profiles
SET
  onboarding_completed_at = now(),
  onboarding_step = 5
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
```

### COALESCE — update only if a new value is provided

A pattern used heavily in this project for "partial updates":

```sql
-- only change is_page_active if the new value is not null
UPDATE public.profiles
SET is_page_active = COALESCE(p_is_page_active, is_page_active)
WHERE id = p_user_id;
```

`COALESCE(a, b)` returns `a` if `a` is not null, otherwise `b`. So if `p_is_page_active` is null, the column keeps its current value.

### UPDATE … RETURNING

Like INSERT, you can see what changed:

```sql
UPDATE public.profiles
SET follower_count = follower_count + 1
WHERE id = 'some-uuid'
RETURNING id, follower_count;
```

### Checking if UPDATE found any rows

In PL/pgSQL functions (Day 6), you use `IF NOT FOUND` after an update:

```sql
UPDATE public.profiles SET ... WHERE id = p_user_id;
IF NOT FOUND THEN
  RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND');
END IF;
```

You'll see this pattern in `supabase/schemas/profiles.sql` in the `moderate_user` function.

---

## DELETE — Removing rows

```sql
DELETE FROM table_name
WHERE condition;
```

**Always include a WHERE clause.** Without it you delete every row.

```sql
-- remove a follow relationship
DELETE FROM public.follows
WHERE follower_id = 'uuid-a' AND following_id = 'uuid-b';
```

### Cascading deletes

When a table uses `ON DELETE CASCADE` in a foreign key, deleting the parent row automatically deletes all child rows.

Example from `supabase/schemas/profiles.sql`:
```sql
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  ...
);
```

This means: if an `auth.users` row is deleted, the corresponding `profiles` row is automatically deleted too. No manual cleanup needed.

---

## Transactions — grouping operations atomically

A **transaction** groups multiple SQL statements so they all succeed or all fail together. This is critical for financial operations (wallets, payments).

```sql
BEGIN;

  UPDATE public.wallets
  SET balance = balance - 500
  WHERE profile_id = 'sender-uuid';

  UPDATE public.wallets
  SET balance = balance + 500
  WHERE profile_id = 'receiver-uuid';

  INSERT INTO public.transactions (...)
  VALUES (...);

COMMIT;
```

If anything fails between `BEGIN` and `COMMIT`, you run `ROLLBACK` and nothing is saved. In practice, PL/pgSQL functions (Day 6) handle this automatically — any exception causes a rollback.

**Key resource:** [PostgreSQL Transactions tutorial](https://www.postgresql.org/docs/current/tutorial-transactions.html)

---

## The `now()` function

`now()` returns the current timestamp with timezone. Used everywhere:

```sql
SET updated_at = now()
SET created_at = now()
```

In this project, `updated_at` is maintained automatically by a trigger (you'll learn about triggers on Day 6), so you never need to set it manually in application code.

---

## How this project's default values work

When a table column has a `DEFAULT`, you can omit it in INSERT and PostgreSQL fills it in automatically.

From `profiles.sql`:
```sql
role public.user_role not null default 'user',
onboarding_step int default 0,
follower_count bigint default 0,
created_at timestamptz default now(),
```

So this is valid (role, step, follower_count, created_at are all filled by defaults):
```sql
INSERT INTO public.profiles (id, username, page_slug)
VALUES ('some-uuid', 'johndoe', 'johndoe');
```

---

## Exercises

1. **SQLBolt:** Complete lessons 13–16 at [sqlbolt.com](https://sqlbolt.com/).

2. Write an INSERT that adds a row to `public.follows` — pick two profile UUIDs from your local seeded data. Use `RETURNING *` to confirm what was inserted.

3. Write an UPDATE that sets `bio = 'Hello, I am a creator!'` for a specific profile by its `id`. Use `RETURNING id, bio` to confirm.

4. Write a DELETE that removes the follow you created in exercise 2.

5. Look at the `moderate_user` function in `supabase/schemas/profiles.sql` (lines 191–230). It uses `COALESCE` and checks `IF NOT FOUND`. Explain in your own words what each `COALESCE` call does and why `IF NOT FOUND` matters.

6. Open `supabase/schemas/wallets.sql`. Find any `ON CONFLICT` or `ON DELETE` clauses and explain what they do.
