# Day 1 — SQL Basics: What It Is and How to Read Data

## Goal

By the end of today you can open a SQL client, connect to the local Supabase database, and read data from any table using SELECT.

---

## What is SQL?

SQL (Structured Query Language) is the language used to talk to relational databases. A relational database stores data in **tables** — rows and columns, like a very structured spreadsheet. Every table has a fixed set of columns, and each row is one record.

In this project the database is **PostgreSQL** (the world's most advanced open-source relational database), managed through **Supabase** which adds auth, a REST API, and a dashboard on top of it.

**Key resources:**
- [PostgreSQL official documentation](https://www.postgresql.org/docs/current/)
- [SQL Tutorial — w3schools](https://www.w3schools.com/sql/) — good quick reference
- [SQLBolt — interactive SQL lessons](https://sqlbolt.com/) — do lessons 1–6 today
- [Supabase: Database overview](https://supabase.com/docs/guides/database/overview)

---

## Data types you will see in this project

| Type | What it stores | Example |
|------|---------------|---------|
| `text` | Any string of characters | `'hello'`, `'user@example.com'` |
| `bigint` | Large whole numbers | `1000000` |
| `boolean` | True or false | `true`, `false` |
| `uuid` | Universally unique ID | `'a0eebc99-9c0b-...'` |
| `timestamptz` | Date + time with timezone | `'2026-06-10 12:00:00+06'` |
| `jsonb` | JSON stored as binary | `'{"key": "value"}'` |
| `numeric(precision, scale)` | Decimal numbers (money) | `1500.50` |
| `text[]` | Array of text values | `'{Tech,Comedy}'` |

---

## The SELECT statement

SELECT is how you read data. The basic form:

```sql
SELECT column1, column2
FROM table_name
WHERE condition;
```

Use `*` to select all columns:

```sql
SELECT *
FROM public.profiles;
```

> **Note:** In this project every table is in the `public` schema. You must write `public.profiles`, not just `profiles`. This matters for security (we'll explain in Day 8).

### Filtering with WHERE

```sql
-- only profiles that have completed onboarding
SELECT id, username, full_name
FROM public.profiles
WHERE onboarding_completed_at IS NOT NULL;

-- profiles with the admin role
SELECT id, username
FROM public.profiles
WHERE role = 'admin';
```

### Sorting with ORDER BY

```sql
-- most popular creators first
SELECT username, popularity_score
FROM public.profiles
ORDER BY popularity_score DESC;
```

### Limiting results

```sql
-- only the top 10
SELECT username, popularity_score
FROM public.profiles
ORDER BY popularity_score DESC
LIMIT 10;
```

### Skipping rows with OFFSET

```sql
-- rows 11-20 (page 2, if page size is 10)
SELECT username, popularity_score
FROM public.profiles
ORDER BY popularity_score DESC
LIMIT 10
OFFSET 10;
```

### Useful WHERE operators

```sql
-- exact match
WHERE status = 'completed'

-- not equal
WHERE status != 'failed'

-- null checks
WHERE avatar_url IS NULL
WHERE avatar_url IS NOT NULL

-- multiple conditions
WHERE role = 'user' AND is_page_active = true

-- any of a list
WHERE status IN ('completed', 'processing')

-- text contains
WHERE username ILIKE '%coffee%'   -- case-insensitive
WHERE username LIKE '%coffee%'    -- case-sensitive

-- numeric ranges
WHERE net_amount >= 100 AND net_amount <= 500
-- or equivalently:
WHERE net_amount BETWEEN 100 AND 500
```

---

## Connecting to the local database

After `supabase start`, connect with your SQL client using these credentials:

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `54322` |
| Database | `postgres` |
| Username | `postgres` |
| Password | `postgres` |

Or use the Supabase Studio UI at `http://localhost:54323` → SQL Editor.

---

## Reading a real table: `profiles`

Open the file `supabase/schemas/profiles.sql` in the project. Read the column definitions at the top of the `CREATE TABLE public.profiles` block. Every column you see there you can now SELECT.

Try this in your SQL client:

```sql
SELECT
  id,
  username,
  role,
  is_page_active,
  popularity_score,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;
```

---

## Exercises

Complete these before Day 2. Run each query in the local database (after `supabase start`).

1. **SQLBolt:** Complete lessons 1–6 at [sqlbolt.com](https://sqlbolt.com/).

2. Write a query that selects `username`, `full_name`, and `created_at` from `public.profiles` where `role = 'user'` and `is_page_active = true`, ordered by `created_at` descending, limited to 20 rows.

3. Write a query that finds all profiles where `has_first_service = false` and `onboarding_step > 0`.

4. Write a query that selects the `id`, `username`, and `follower_count` of profiles whose `follower_count` is greater than 0, sorted by `follower_count` descending.

5. Look at `supabase/schemas/common.sql` and list every enum type defined there. What are the possible values for `payment_status_enum`?
