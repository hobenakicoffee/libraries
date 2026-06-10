# Day 20 — Table Partitioning & Scaling Patterns

## Goal

By the end of today you understand why `public.messages` is a partitioned table, how range partitioning by date works, and what's involved in adding a new monthly partition.

---

## Resources

- [PostgreSQL: Table Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html)
- [PostgreSQL: Partition Pruning](https://www.postgresql.org/docs/current/ddl-partitioning.html#DDL-PARTITION-PRUNING)
- [Supabase: Partitioning guide](https://supabase.com/docs/guides/database/partitions)

---

## Why this matters

`public.messages` (in `messaging.sql`) is the only partitioned table in this project so far, and it's a real production pattern: chat messages accumulate forever and a single `messages` table would eventually become huge and slow to query/index/vacuum. Whoever maintains the messaging feature needs to understand this, including the operational task of creating new partitions before they're needed.

---

## What is partitioning?

Partitioning splits one **logical** table into multiple **physical** tables ("partitions"), each holding a subset of the rows, based on a rule. To everyone querying it, `public.messages` looks like one table. Under the hood, PostgreSQL stores the data in separate physical tables and routes each row to the right one automatically.

### Why partition `messages`?

- **Query performance**: Most queries filter by a recent date range (e.g., "messages in this conversation from the last few months"). PostgreSQL can skip entire partitions that can't contain matching rows (**partition pruning**) — much cheaper than scanning one giant table+index.
- **Maintenance**: Operations like `VACUUM`, index rebuilds, and `ANALYZE` run per-partition and stay fast even as the overall table grows to billions of rows.
- **Easy archival/deletion**: Old data can be dropped instantly by `DROP TABLE messages_2026_04` instead of a slow `DELETE` that scans and removes millions of rows one at a time.

---

## Range partitioning by date — the `messages` table

```sql
create table public.messages (
  id bigint not null,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(content) <= 5000),
  created_at timestamptz not null default now(),
  primary key (id, created_at)
) partition by range (created_at);
```

Key points:

- `partition by range (created_at)` declares this is a **range-partitioned** table, partitioned on the `created_at` column. PostgreSQL will route each inserted row to whichever partition's range covers its `created_at` value.
- The **primary key must include the partition key** (`created_at`) — that's why it's `primary key (id, created_at)` instead of just `primary key (id)`. This is a hard PostgreSQL requirement for partitioned tables: any unique constraint must include all partitioning columns.
- The parent table `public.messages` itself holds **no rows** — it's purely a routing definition. All actual data lives in the partition tables below it.

### The partitions themselves

```sql
create table messages_2026_04 partition of public.messages
  for values from ('2026-04-01') to ('2026-05-01');

create table messages_2026_05 partition of public.messages
  for values from ('2026-05-01') to ('2026-06-01');

create table messages_2026_06 partition of public.messages
  for values from ('2026-06-01') to ('2026-07-01');

create table messages_default partition of public.messages default;
```

- Each partition covers a `[from, to)` range — **inclusive of `from`, exclusive of `to`**. A message created at exactly `2026-05-01 00:00:00` goes into `messages_2026_05`, not `messages_2026_04`.
- `messages_default` is the **default partition** — a catch-all for any row whose `created_at` doesn't fall into any defined range (e.g., if someone inserts a message dated `2026-08-15` before a `messages_2026_08` partition exists). Without a default partition, such an `INSERT` would simply **fail**.

---

## The `id` sequence — why `bigint not null` with a separate sequence

```sql
create sequence public.messages_id_seq;
alter table public.messages alter column id set default nextval('public.messages_id_seq');
alter sequence public.messages_id_seq owned by public.messages.id;
```

Normally `id bigint generated always as identity primary key` (Day 5) handles auto-increment for you. But **identity columns aren't fully supported the same way across all partitions** in older PostgreSQL behavior patterns, so this project creates a single shared sequence manually and sets it as the `DEFAULT` for `id`. Every partition shares this one sequence, so `id` values stay globally unique and increasing across all partitions — important since `id` (combined with `created_at`) is the primary key.

`alter sequence ... owned by ...` ties the sequence's lifecycle to the column — if the column or table is dropped, the sequence is dropped too (no orphaned objects).

---

## RLS and policies on partitioned tables — the gotcha

```sql
-- Enable RLS on partitions (inherited from parent but explicit for clarity)
alter table messages_2026_04 enable row level security;
alter table messages_2026_05 enable row level security;
alter table messages_2026_06 enable row level security;
alter table messages_default enable row level security;

-- Manager policies on existing partitions (must be added manually; not inherited after creation)
create policy "Managers can view all messages" on messages_2026_04 for select to authenticated using ((select public.authorize_manager('content.moderate')));
create policy "Managers can delete messages"   on messages_2026_04 for delete to authenticated using ((select public.authorize_manager('content.delete')));
-- ... repeated for messages_2026_05, messages_2026_06, messages_default ...
```

This is the single most important operational fact about this table: **policies created on the parent `public.messages` table apply to partitions created *after* the policy exists, but partitions that already existed when a policy was added need it applied manually too** (and in some PostgreSQL versions / setups, policies don't propagate to partitions automatically at all — hence the explicit repetition here per the schema comment).

**Practical consequence:** every time a new monthly partition is created, you must remember to:
1. `ALTER TABLE messages_2026_07 ENABLE ROW LEVEL SECURITY;`
2. Re-create every policy that exists on the other partitions, on the new partition too.

Forgetting step 1 or 2 means a new partition could either be unreadable (RLS on, no policies) or — worse — **readable by everyone** (RLS not enabled), depending on table privileges. This is exactly the kind of thing the `.claude/rules/rls-audit.md` process in this repo is designed to catch.

---

## Indexes on partitioned tables

```sql
create index if not exists idx_messages_conversation_created_at
on public.messages (conversation_id, created_at desc);
```

When you create an index on the **parent** table, PostgreSQL automatically creates a matching index on every existing (and future, for ranges already covered) partition. Each partition gets its own physical index — there's no single "global" index spanning all partitions.

---

## Partition pruning in action

```sql
EXPLAIN
SELECT * FROM public.messages
WHERE conversation_id = '...' AND created_at >= '2026-06-01' AND created_at < '2026-06-15';
```

If the planner can prove from your `WHERE` clause that only `messages_2026_06` could contain matching rows, the `EXPLAIN` output will show only that partition being scanned — `messages_2026_04` and `messages_2026_05` are pruned (skipped entirely), even though the query never mentions partition names.

```sql
-- Without a created_at filter, ALL partitions must be scanned:
EXPLAIN SELECT * FROM public.messages WHERE conversation_id = '...';
```

This is why queries on partitioned tables should, where possible, include a filter on the partition key (`created_at`) — even an open-ended one like `created_at >= now() - interval '90 days'` — to let the planner prune.

---

## Operational task: adding next month's partition

This is something a developer or a scheduled job needs to do **before** the current latest partition's range ends (otherwise new messages fall into `messages_default`, which has no upper bound and defeats the purpose of partitioning).

```sql
-- before 2026-07-01:
create table messages_2026_07 partition of public.messages
  for values from ('2026-07-01') to ('2026-08-01');

alter table messages_2026_07 enable row level security;

create policy "Managers can view all messages" on messages_2026_07
  for select to authenticated using ((select public.authorize_manager('content.moderate')));
create policy "Managers can delete messages" on messages_2026_07
  for delete to authenticated using ((select public.authorize_manager('content.delete')));

-- repeat for any other policies that exist on messages_2026_06
```

Per `AGENTS.md`, this would be done by editing `supabase/schemas/messaging.sql` (adding the new partition + policies) and generating a migration via `supabase db diff --local -f add_messages_partition_2026_07` — never hand-written migrations.

---

## When *not* to partition

Partitioning adds complexity (the RLS gotcha above, primary key constraints, manual partition maintenance). It's worth it when:

- A table grows unboundedly (logs, messages, transactions, events).
- Queries naturally filter by the partition key (time-based data + time-range queries).
- You need fast bulk deletion of old data.

It's **not** worth it for tables that stay small (`profiles`, `wallets`, `managers`) — the added complexity has no payoff. None of the other tables in `supabase/schemas/` are partitioned, and that's the correct choice for them.

---

## Exercises

1. Open `supabase/schemas/messaging.sql` and confirm: how many partitions currently exist for `messages`, and what date range does each cover? Is there a gap or overlap in the ranges?

2. A message is inserted with `created_at = '2026-07-02 10:00:00+00'`. Which partition does it land in, given the partitions defined in the file today? Is that the *intended* partition, or does it fall through to `messages_default`?

3. Explain why `primary key (id, created_at)` is required instead of `primary key (id)`. What PostgreSQL rule does this satisfy?

4. Write the SQL (as you would add it to `messaging.sql`) to create the `messages_2026_07` partition, enable RLS on it, and add both manager policies shown above, following the exact pattern used for `messages_2026_06`.

5. `transactions.sql` is one of the largest and fastest-growing tables in this project (every gift, payment, and withdrawal creates a row), but it is **not** partitioned. Discuss with your tech lead: what would be the partition key if it were partitioned? What would break (constraints, indexes, RLS policies) if this table were converted to a partitioned table today?

6. Run `EXPLAIN ANALYZE` locally on a query against `public.messages` filtered by `conversation_id` only (no `created_at` filter), then again with a `created_at` range added. Compare the "Plan" sections — do you see all partitions scanned in the first, and pruning in the second?
