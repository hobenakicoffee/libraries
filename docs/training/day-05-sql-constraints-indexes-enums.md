# Day 5 — Constraints, Indexes, and Enums

## Goal

By the end of today you understand how PostgreSQL enforces data integrity through constraints, how indexes make queries fast, and how this project uses custom enum types.

---

## Resources

- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [Use the Index, Luke — The 3 things of an index](https://use-the-index-luke.com/sql/anatomy) — very approachable
- [PostgreSQL ENUM types](https://www.postgresql.org/docs/current/datatype-enum.html)
- [EXPLAIN ANALYZE guide](https://www.postgresql.org/docs/current/sql-explain.html)

---

## Constraints — enforcing data integrity

Constraints are rules that PostgreSQL enforces at the database level. If you try to insert or update a row that violates a constraint, PostgreSQL rejects it with an error — even if the application code has a bug.

### PRIMARY KEY

Every table needs one. Uniquely identifies each row. Can never be NULL.

```sql
-- bigint auto-increment (standard in this project for non-user tables)
id bigint generated always as identity primary key

-- uuid (used for user-owned tables)
id uuid primary key references auth.users on delete cascade
```

### UNIQUE

Ensures a column (or combination of columns) has no duplicates.

```sql
username text unique not null,
page_slug text unique not null,

-- from wallets.sql: one wallet per profile
UNIQUE (profile_id)

-- from manager_user_roles: one role per manager
UNIQUE (user_id)
```

### NOT NULL

The column must always have a value:

```sql
username text not null,
email text not null,
status manager_status default 'ACTIVE' not null,
```

### CHECK — custom validation rules

```sql
-- from profiles.sql
constraint username_length check (char_length(username) between 3 and 50),
constraint follower_count_not_negative check (follower_count >= 0),
constraint total_supporter_count_not_negative check (total_supporter_count >= 0)
```

If you try to insert a username shorter than 3 characters, PostgreSQL will reject it.

### FOREIGN KEY with ON DELETE

Controls what happens when the referenced row is deleted:

```sql
-- cascade: delete child rows too
id uuid references auth.users on delete cascade

-- set null: set the foreign key column to null
creator_id uuid references public.profiles on delete set null

-- restrict (default): block the delete if child rows exist
```

### Composite primary key

Some tables use two columns together as the primary key — neither alone is unique, but the combination is:

```sql
-- from follows: a user can only follow another user once
primary key (follower_id, following_id)
```

---

## Enums — a fixed set of valid values

An enum is a custom data type that only accepts a predefined list of values. Much safer than a free-text `status` column that could have typos.

From `supabase/schemas/common.sql`:

```sql
create type public.payment_status_enum as enum (
  'pending',
  'processing',
  'completed',
  'failed',
  'reversed',
  'cancelled',
  'refunded',
  'reviewing'
);
```

Usage:
```sql
-- inserting with an enum
INSERT INTO public.transactions (..., status)
VALUES (..., 'completed');

-- querying
WHERE status = 'completed'
WHERE status IN ('pending', 'processing')
```

If you try to insert `'done'`, PostgreSQL will error: `invalid input value for enum payment_status_enum: "done"`.

### Enums in this project (from `common.sql` and other schema files)

| Enum | File | Key values |
|------|------|------------|
| `payment_status_enum` | common.sql | pending, processing, completed, failed, ... |
| `payout_provider` | common.sql | bkash, nagad, rocket, bank |
| `withdrawal_status` | common.sql | requested, approved, processing, paid, rejected, failed |
| `transaction_direction_enum` | common.sql | debit, credit |
| `user_role` | profiles.sql | user, admin |
| `manager_role` | managers.sql | super_admin, content_manager, support_manager, finance_manager, developer_manager |
| `manager_permission` | managers.sql | managers.create, content.moderate, users.suspend, ... |
| `visibility_enum` | common.sql | public, private |

---

## Indexes — making queries fast

An index is a data structure that helps PostgreSQL find rows quickly without scanning the entire table. Think of it like a book's index: instead of reading every page, you look up the page number in the back.

### When PostgreSQL uses an index

PostgreSQL uses an index when you filter or sort by an indexed column in a `WHERE`, `ORDER BY`, or `JOIN ON` clause — and the index makes the query faster than a full scan.

### B-tree index (default)

The standard index type. Good for equality (`=`) and range (`<`, `>`, `BETWEEN`) queries.

```sql
-- from profiles.sql
create index idx_profiles_page_slug on public.profiles(page_slug);
create index idx_profiles_username on public.profiles(username);
create index idx_profiles_follower_count on public.profiles(follower_count);
```

After these indexes, `WHERE username = 'johndoe'` is instant even if there are millions of profiles.

### Partial index — index only a subset of rows

From `profiles.sql`:

```sql
create index idx_profiles_popularity on public.profiles(popularity_score desc, id desc)
  where has_first_service = true and is_page_active = true;
```

This index only covers active creators with at least one service. The explore page always queries with `WHERE has_first_service = true AND is_page_active = true`, so this index is very efficient — it excludes all inactive profiles.

### GIN index — for arrays and full-text search

```sql
-- from profiles.sql: index categories array for containment queries
create index idx_profiles_categories on public.profiles using gin(categories);

-- from managers.sql: trigram index for ILIKE search
create index idx_managers_email_trgm on public.managers using gin (email gin_trgm_ops);
```

The `gin_trgm_ops` index (from the `pg_trgm` extension) makes `ILIKE '%search%'` fast — without it, a leading wildcard forces a full table scan.

### Composite index — multiple columns

```sql
-- order of columns matters: put the most selective (highest cardinality) column first
create index idx_transactions_user_status on public.transactions(user_profile_id, status);
```

This helps queries like `WHERE user_profile_id = $1 AND status = 'completed'`.

### Checking if your query uses an index

Use `EXPLAIN ANALYZE` to see the query plan:

```sql
EXPLAIN ANALYZE
SELECT * FROM public.profiles WHERE username = 'johndoe';
```

Look for `Index Scan` (good) vs `Seq Scan` (sequential scan — slow for large tables).

---

## Generated columns

A special column whose value is always computed from other columns:

```sql
-- from profiles.sql
popularity_score bigint generated always as (follower_count + (total_supporter_count * 5)) stored,
```

- `stored` means the value is computed and saved on every write (takes space, but fast to read)
- You cannot INSERT or UPDATE a generated column — PostgreSQL manages it
- You CAN index and ORDER BY it

---

## Exercises

1. Open `supabase/schemas/transactions.sql`. List every constraint defined on the table (PRIMARY KEY, UNIQUE, CHECK, FOREIGN KEY, NOT NULL). For each one, explain in one sentence what data integrity rule it enforces.

2. Open `supabase/schemas/wallets.sql`. Find the UNIQUE constraint. Why does it exist? What would happen if two wallet rows for the same profile were allowed?

3. Open `supabase/schemas/common.sql`. Read every enum type. Then open `supabase/schemas/withdrawal_requests.sql`. Which enums from `common.sql` does that table use?

4. Look at the indexes on `public.profiles` in `profiles.sql`. For each index, write down: which column(s) it indexes, and which type of query it helps (give an example SQL query).

5. Run `EXPLAIN ANALYZE SELECT * FROM public.profiles WHERE page_slug = 'some-slug';` in your SQL client (after `supabase start`). What does the output say? Is it using an index?

6. Open `supabase/schemas/managers.sql`. Find the `pg_trgm` extension and the trigram indexes. In your own words, why are trigram indexes needed for `ILIKE '%search%'` queries?
