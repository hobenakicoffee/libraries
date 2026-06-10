# Day 4 — Functions and Aggregates: COUNT, SUM, GROUP BY, Window Functions

## Goal

By the end of today you can write aggregate queries for reporting, use built-in PostgreSQL functions, and understand how this project uses them in RPCs (Remote Procedure Calls).

---

## Resources

- [SQLBolt lessons 10–12](https://sqlbolt.com/lesson/select_queries_with_aggregates) — aggregates and GROUP BY
- [PostgreSQL aggregate functions](https://www.postgresql.org/docs/current/functions-aggregate.html)
- [PostgreSQL window functions tutorial](https://www.postgresql.org/docs/current/tutorial-window.html)
- [PostgreSQL string functions](https://www.postgresql.org/docs/current/functions-string.html)
- [Mode Analytics SQL Tutorial — aggregates](https://mode.com/sql-tutorial/sql-aggregate-functions/)

---

## Aggregate functions

Aggregate functions collapse many rows into a single result.

| Function | What it does |
|----------|-------------|
| `COUNT(*)` | Count all rows |
| `COUNT(col)` | Count non-null values in a column |
| `SUM(col)` | Sum of all values |
| `AVG(col)` | Average |
| `MIN(col)` | Minimum value |
| `MAX(col)` | Maximum value |

```sql
-- how many completed transactions in total?
SELECT COUNT(*) FROM public.transactions WHERE status = 'completed';

-- total net amount earned platform-wide
SELECT SUM(net_amount) FROM public.transactions WHERE direction = 'credit' AND status = 'completed';

-- average gift amount
SELECT AVG(net_amount)
FROM public.transactions
WHERE service_type = 'gift' AND status = 'completed';
```

---

## GROUP BY — aggregate per group

Without `GROUP BY`, aggregates collapse ALL rows. With `GROUP BY`, they collapse per distinct value of the grouping column.

```sql
-- total earned per creator
SELECT
  user_profile_id,
  SUM(net_amount) AS total_earned,
  COUNT(*) AS transaction_count
FROM public.transactions
WHERE direction = 'credit' AND status = 'completed'
GROUP BY user_profile_id
ORDER BY total_earned DESC;
```

### HAVING — filter on aggregated results

`WHERE` filters rows before aggregation. `HAVING` filters after:

```sql
-- creators who have earned more than 10000 BDT
SELECT
  user_profile_id,
  SUM(net_amount) AS total_earned
FROM public.transactions
WHERE direction = 'credit' AND status = 'completed'
GROUP BY user_profile_id
HAVING SUM(net_amount) > 10000
ORDER BY total_earned DESC;
```

---

## Common built-in functions used in this project

### Date/time

```sql
now()                    -- current timestamp with timezone
now() - interval '7 days'  -- 7 days ago
now() - interval '30 days' -- 30 days ago
date_trunc('day', created_at)   -- truncate to day
date_trunc('month', created_at) -- truncate to month
EXTRACT(epoch FROM (now() - created_at))  -- seconds since created
```

### String

```sql
LOWER(email)             -- lowercase
UPPER(username)          -- uppercase
TRIM(text)               -- remove leading/trailing spaces
CONCAT(a, b)             -- join strings
LENGTH(text)             -- character count
char_length(username)    -- same as LENGTH for text
ILIKE '%pattern%'        -- case-insensitive LIKE
```

### JSON/JSONB

```sql
-- access a key from jsonb
payload ->> 'amount'           -- returns text
payload -> 'nested' ->> 'key'  -- navigate nested

-- build json
jsonb_build_object('key', value, 'key2', value2)

-- check key exists
payload ? 'amount'

-- append to jsonb array
social_links || '{"platform":"twitter"}'::jsonb
```

You'll see jsonb everywhere in this project — `theme`, `layout`, `social_links`, `payload` in activities, and all Edge Function request/response bodies.

### NULL handling

```sql
COALESCE(a, b, c)   -- first non-null value
NULLIF(a, b)         -- returns null if a = b, else a
IS NULL
IS NOT NULL
```

---

## DISTINCT — remove duplicates

```sql
-- how many unique creators have been supported?
SELECT COUNT(DISTINCT creator_id) FROM public.supporters;
```

---

## Window functions

Window functions are like aggregates but they don't collapse rows — each row keeps its identity and gets a computed value based on a "window" of nearby rows.

```sql
-- rank creators by total_supporter_count
SELECT
  username,
  total_supporter_count,
  RANK() OVER (ORDER BY total_supporter_count DESC) AS rank
FROM public.profiles
WHERE has_first_service = true AND is_page_active = true;
```

```sql
-- running total of net_amount per profile over time
SELECT
  id,
  created_at,
  net_amount,
  SUM(net_amount) OVER (
    PARTITION BY user_profile_id
    ORDER BY created_at
  ) AS running_total
FROM public.transactions
WHERE direction = 'credit';
```

**Key concepts:**
- `OVER (ORDER BY ...)` — defines the window
- `PARTITION BY` — restart the window for each group (like a per-group GROUP BY, but rows are kept)
- `RANK()`, `ROW_NUMBER()`, `DENSE_RANK()` — ranking functions

---

## How RPCs use aggregates in this project

The project uses PostgreSQL **functions** (called RPCs — Remote Procedure Calls — from the client) to return complex aggregated results as JSON. Here is a simplified version of the pattern:

```sql
CREATE OR REPLACE FUNCTION public.get_creator_stats(p_creator_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_earned',    COALESCE(SUM(t.net_amount), 0),
    'gift_count',      COUNT(t.id) FILTER (WHERE t.service_type = 'gift'),
    'supporter_count', p.total_supporter_count
  )
  INTO v_result
  FROM public.transactions t
  JOIN public.profiles p ON p.id = t.user_profile_id
  WHERE t.user_profile_id = p_creator_id
    AND t.direction = 'credit'
    AND t.status = 'completed'
  GROUP BY p.total_supporter_count;

  RETURN v_result;
END;
$$;
```

`COUNT(x) FILTER (WHERE condition)` is a PostgreSQL-specific way to count only rows that match a condition, within a single aggregate query.

---

## The `popularity_score` generated column

Look at `supabase/schemas/profiles.sql`:

```sql
popularity_score bigint generated always as (follower_count + (total_supporter_count * 5)) stored,
```

This is a **generated column** — PostgreSQL computes it automatically from other columns on every insert/update. You never write to it directly. You can read it in SELECT and ORDER BY.

---

## Exercises

1. **SQLBolt:** Complete lessons 10–12 at [sqlbolt.com](https://sqlbolt.com/).

2. Write a query that counts transactions grouped by `status`, ordered by count descending. (You should see 'completed', 'pending', etc.)

3. Write a query that finds the total `net_amount` and count of transactions per `service_type` for `direction = 'credit'` and `status = 'completed'`.

4. Write a query that finds the top 5 profiles by `total_supporter_count`, showing `username` and `total_supporter_count`.

5. Write a query that uses `date_trunc('month', created_at)` to count how many profiles were created per month. Order by month ascending.

6. Open `supabase/schemas/shop_service.sql`. Find any function that returns aggregated stats (look for `SUM`, `COUNT`, `GROUP BY`). Read it and explain what it returns in plain English.

7. Write a query using a window function that assigns a `ROW_NUMBER()` to each transaction per `user_profile_id`, ordered by `created_at`. (This tells you "this is the Nth transaction for this user".)
