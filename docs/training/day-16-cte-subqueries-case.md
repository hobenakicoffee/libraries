# Day 16 — CTEs, Subqueries, and CASE Expressions

## Goal

By the end of today you can read and write `WITH` clauses (Common Table Expressions), subqueries, and `CASE WHEN` expressions — the building blocks of almost every reporting RPC in this project.

---

## Resources

- [PostgreSQL: WITH Queries (CTEs)](https://www.postgresql.org/docs/current/queries-with.html)
- [PostgreSQL: Subqueries](https://www.postgresql.org/docs/current/functions-subquery.html)
- [PostgreSQL: CASE expressions](https://www.postgresql.org/docs/current/functions-conditional.html)
- [Mode SQL Tutorial — Subqueries](https://mode.com/sql-tutorial/sql-sub-queries/)

---

## Why this matters

Open `supabase/schemas/transactions.sql` and search for `with filtered as`. Open `supabase/schemas/feed.sql` and search for `with q as`. Open `supabase/schemas/messaging.sql` and search for `with user_conversations as`. Almost every multi-step RPC in this codebase is built from CTEs chained together. If you can't read a `WITH` block, you can't read most of this project's business logic.

---

## CTEs (Common Table Expressions) — `WITH ... AS (...)`

A CTE lets you name a subquery and reuse it, breaking a complicated query into readable, sequential steps — like naming intermediate variables.

```sql
WITH step_one AS (
  SELECT ...
  FROM ...
  WHERE ...
),
step_two AS (
  SELECT ...
  FROM step_one
  WHERE ...
)
SELECT * FROM step_two;
```

Each CTE can reference the ones defined before it. The final `SELECT` (or `INSERT`/`UPDATE`) at the bottom is what actually runs and returns rows.

### Real example: `get_transaction_service_breakdown` (transactions.sql)

```sql
with filtered as (
  select
    t.service_type,
    case
      when p_direction = 'credit' then t.net_amount
      else t.amount
    end as tx_amount
  from public.transactions t
  where t.user_profile_id = (select auth.uid())
    and t.direction       = p_direction
    and t.status          = 'completed'
    and t.created_at     >= p_from
    and t.created_at      < p_to + interval '1 microsecond'
),
grouped as (
  select
    service_type::text,
    coalesce(sum(tx_amount), 0)  as total_amount,
    count(*)                     as transaction_count
  from filtered
  group by service_type
),
totals as (
  select coalesce(sum(total_amount), 0) as grand_total
  from grouped
)
select
  g.service_type,
  g.total_amount,
  g.transaction_count,
  case
    when t.grand_total = 0 then 0
    else round(g.total_amount / t.grand_total * 100, 1)
  end as percentage
from grouped g
cross join totals t;
```

Read this top to bottom as a story:

1. **`filtered`** — pick the user's completed transactions in the date range, and decide (per row) which amount column to use.
2. **`grouped`** — sum and count those rows, one group per `service_type`.
3. **`totals`** — add up everything in `grouped` to get a single grand total.
4. **Final `SELECT`** — combine `grouped` with `totals` to compute each service type's percentage of the total.

Each step is simple on its own. Trying to write this as one giant query without CTEs would be far harder to read or debug.

### Why use a CTE instead of a subquery?

- **Readability** — named steps read like a recipe.
- **Reuse** — reference the same CTE multiple times without repeating the SQL (PostgreSQL may still re-evaluate it, but the *text* isn't duplicated).
- **Debugging** — you can run just `SELECT * FROM filtered` while developing, then add the next step.

---

## Subqueries

A subquery is a `SELECT` nested inside another query. There are three flavors you'll see constantly:

### 1. Scalar subquery — returns a single value

```sql
-- from feed.sql RLS policies, used everywhere:
where supporter_profile_id = (select auth.uid())
```

`(select auth.uid())` returns exactly one value (the current user's ID), so it can be used anywhere a single value is expected.

### 2. Subquery in `FROM` (derived table)

```sql
SELECT service_type, total_amount
FROM (
  SELECT service_type, SUM(net_amount) AS total_amount
  FROM public.transactions
  WHERE status = 'completed'
  GROUP BY service_type
) AS sub
WHERE total_amount > 1000;
```

This is the same idea as a CTE, just inline and unnamed. CTEs are usually preferred for readability when there's more than one step.

### 3. `EXISTS` / `NOT EXISTS` — correlated subqueries

A correlated subquery references a column from the outer query. `EXISTS` checks whether *any* row matches, without caring how many.

```sql
-- from feed.sql search_feed RPC: "did the current user like this feed item?"
exists(
  select 1
  from public.feed_item_likes l
  where l.feed_item_id = fi.id
    and l.profile_id = (select auth.uid())
) as is_liked
```

`EXISTS` is efficient because PostgreSQL stops scanning as soon as it finds one matching row — it never needs to count or return actual data.

### `IN` vs `EXISTS`

```sql
-- IN: subquery returns a list of values to match against
WHERE creator_id IN (
  SELECT following_id FROM public.follows WHERE follower_id = (select auth.uid())
)

-- EXISTS: equivalent, often faster on large tables
WHERE EXISTS (
  SELECT 1 FROM public.follows f
  WHERE f.follower_id = (select auth.uid())
    AND f.following_id = creator_id
)
```

Both return the same result here. `EXISTS` is generally preferred when the subquery would return many rows, because it can short-circuit.

---

## `CASE WHEN` — conditional expressions

`CASE` is SQL's if/else. It returns a value, so you can use it anywhere an expression is allowed: `SELECT`, `WHERE`, `ORDER BY`, `GROUP BY`, inside aggregates.

### Basic form

```sql
CASE
  WHEN condition1 THEN result1
  WHEN condition2 THEN result2
  ELSE default_result
END
```

### Real example: choosing which amount column to use (transactions.sql)

```sql
case
  when p_direction = 'credit' then t.net_amount
  else t.amount
end as tx_amount
```

For credit transactions (money coming in), the *net* amount (after platform fees) is what matters. For debit transactions, the gross `amount` is used.

### `CASE` inside an aggregate — conditional counting

This is one of the most useful patterns in the whole codebase:

```sql
SELECT
  user_profile_id,
  COUNT(*) AS total_transactions,
  COUNT(*) FILTER (WHERE service_type = 'gift') AS gift_count,
  SUM(CASE WHEN status = 'completed' THEN net_amount ELSE 0 END) AS completed_total,
  SUM(CASE WHEN status = 'reversed' THEN net_amount ELSE 0 END) AS reversed_total
FROM public.transactions
GROUP BY user_profile_id;
```

`COUNT(*) FILTER (WHERE ...)` (seen on Day 4) and `SUM(CASE WHEN ... THEN x ELSE 0 END)` solve the same problem two different ways — both let you compute several conditional aggregates in a single pass over the table instead of running multiple queries.

### Avoiding divide-by-zero with `CASE`

```sql
case
  when t.grand_total = 0 then 0
  else round(g.total_amount / t.grand_total * 100, 1)
end as percentage
```

Without the `CASE`, dividing by `t.grand_total` when it's `0` would raise a `division_by_zero` error and crash the whole RPC. Always guard divisions with `CASE` (or `NULLIF`, see below) when the denominator could be zero.

### `NULLIF` — a shortcut for the divide-by-zero guard

```sql
-- equivalent to the CASE above, more compact
round(g.total_amount / NULLIF(t.grand_total, 0) * 100, 1)
```

`NULLIF(a, b)` returns `NULL` if `a = b`, otherwise `a`. Dividing by `NULL` produces `NULL` (not an error), so the whole expression becomes `NULL` instead of crashing. Whether you want `0` or `NULL` as the fallback determines whether you use `CASE` or `NULLIF`.

---

## Putting it together: reading `get_user_conversations` (messaging.sql)

```sql
with user_conversations as (
  select c.id, c.type, c.name, c.last_message_at, c.last_message_preview
  from public.conversations c
  join public.conversation_participants cp on cp.conversation_id = c.id
  where cp.profile_id = current_user_id
),
with_participants as (
  select
    uc.id,
    uc.type,
    uc.name,
    uc.last_message_at,
    uc.last_message_preview,
    (
      select jsonb_agg(
        jsonb_build_object('id', p.id, 'username', p.username)
      )
      from public.conversation_participants cp2
      join public.profiles p on p.id = cp2.profile_id
      where cp2.conversation_id = uc.id
    ) as participants
  from user_conversations uc
)
select * from with_participants;
```

Notice the `participants` column is itself built from a **scalar subquery that returns a JSON array** (`jsonb_agg` turns multiple rows into one JSON array value — more on this on Day 19/Day 11). This is a common pattern: use a CTE for the "main" rows, then a correlated subquery per row to attach a nested JSON structure.

---

## Exercises

1. Open `supabase/schemas/transactions.sql` and find `get_transaction_service_breakdown`. Without looking at the explanation above, write one sentence describing what each of the three CTEs (`filtered`, `grouped`, `totals`) does.

2. Rewrite this query using a CTE instead of a subquery in `FROM`:
   ```sql
   SELECT username, total_earned
   FROM (
     SELECT user_profile_id, SUM(net_amount) AS total_earned
     FROM public.transactions
     WHERE direction = 'credit' AND status = 'completed'
     GROUP BY user_profile_id
   ) AS earnings
   JOIN public.profiles ON profiles.id = earnings.user_profile_id
   WHERE total_earned > 5000;
   ```

3. Write a query using `EXISTS` that returns all profiles who have **never** received a coffee gift (no row in `public.coffee_gifts` where `creator_profile_id` matches).

4. Write a query that uses `CASE WHEN` to label each transaction as `'large'` (net_amount >= 1000), `'medium'` (>= 100), or `'small'` (< 100), then `GROUP BY` that label and count transactions in each bucket.

5. Open `supabase/schemas/feed.sql` and find the `search_feed` function. Identify every CTE and every correlated subquery (`exists(...)`, scalar `select`). For each one, write one sentence describing what it computes.

6. Take your answer to exercise 4 and rewrite the divide-by-zero-safe percentage calculation from `get_transaction_service_breakdown`, but using `NULLIF` instead of `CASE`.
