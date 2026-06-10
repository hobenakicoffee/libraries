# Day 17 — Transactions, Row Locking & Concurrency Control

## Goal

By the end of today you understand what database transactions guarantee, why this project locks rows with `FOR UPDATE`, and how to reason about race conditions in money-moving code like wallet transfers.

---

## Resources

- [PostgreSQL: Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [PostgreSQL: Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL: Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html)
- [Use the Index, Luke — Locking](https://use-the-index-luke.com/sql/clustering/index-organized-clustered-index)

---

## Why this matters

This project moves real money between wallets (`process_payment` in `payments.sql`, gift flows in `coffee_gifts.sql`, withdrawals in `withdrawal_requests.sql`). If two requests touch the same wallet at the same time and the code isn't careful, you can lose money, double-spend, or create an inconsistent balance. This is the single most important topic for anyone touching `wallets.sql`, `payments.sql`, or `transactions.sql`.

---

## What is a transaction?

A transaction is a group of SQL statements that all succeed together or all fail together — there is no in-between state visible to anyone else.

```sql
BEGIN;

UPDATE public.wallets SET balance = balance - 100 WHERE profile_id = 'A';
UPDATE public.wallets SET balance = balance + 100 WHERE profile_id = 'B';

COMMIT;
```

If the second `UPDATE` fails for any reason (constraint violation, connection drop, `RAISE EXCEPTION`), PostgreSQL automatically `ROLLBACK`s the whole transaction — wallet A keeps its original balance. Without a transaction, you could end up with money deducted from A but never credited to B.

### Transactions in PL/pgSQL functions

You don't usually write `BEGIN`/`COMMIT` yourself in this project. **Every PL/pgSQL function call runs inside an implicit transaction.** If `RAISE EXCEPTION` is called anywhere inside the function, *everything* the function did is rolled back automatically. This is why this project uses `RAISE EXCEPTION` so heavily for validation (Day 18) — it's the cleanest way to "abort and undo everything" inside an RPC.

```sql
-- from payments.sql (simplified)
create or replace function public.process_payment(...)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- step 1: deduct from supporter wallet
  update public.wallets set balance = balance - p_amount where profile_id = p_supporter_profile_id;

  if v_supporter_balance < p_amount then
    raise exception 'Insufficient wallet balance';
    -- ^ this rolls back the UPDATE above too — nothing is saved
  end if;

  -- step 2: credit creator wallet
  update public.wallets set balance = balance + v_net_amount where profile_id = p_creator_profile_id;

  -- step 3: insert transaction records
  insert into public.transactions (...) values (...);

  return jsonb_build_object('success', true);
end;
$$;
```

The whole function is one atomic unit: either *all* of (deduct, credit, record) happen, or *none* do.

---

## The ACID properties (briefly)

| Property | Meaning |
|----------|---------|
| **Atomicity** | All-or-nothing — covered above |
| **Consistency** | Constraints (Day 5) are never violated, even mid-transaction |
| **Isolation** | Concurrent transactions don't see each other's uncommitted changes |
| **Durability** | Once committed, data survives crashes |

The one that causes the most bugs in financial code is **Isolation** — and that's where row locking comes in.

---

## The race condition: why `balance = balance - 100` isn't enough

Imagine two requests hit `process_payment` for the **same supporter wallet** at almost the same time (e.g., a double-click, or a retried request):

```
Request A reads balance: 100
Request B reads balance: 100
Request A checks: 100 >= 80? yes. Deducts 80. New balance = 20. Writes 20.
Request B checks: 100 >= 80? yes. Deducts 80. New balance = 20. Writes 20.
```

Both requests succeeded, both think they deducted money — but the wallet only went from 100 to 20 once. **80 BDT vanished from the system's accounting** even though the wallet balance is "correct"-looking. This is a classic **lost update** race condition.

---

## The fix: `SELECT ... FOR UPDATE`

`FOR UPDATE` takes a **row lock** on the selected row(s). Any other transaction that tries to `SELECT ... FOR UPDATE` (or `UPDATE`) the *same row* will **wait** until the first transaction commits or rolls back.

### Real example: `process_payment` (payments.sql)

```sql
-- Lock supporter wallet
select id, balance
into v_supporter_wallet_id, v_supporter_balance
from public.wallets
where profile_id = p_supporter_profile_id
for update;

if v_supporter_balance < p_amount then
  raise exception 'Insufficient wallet balance';
end if;
```

Walk through the race condition again, this time with `FOR UPDATE`:

```
Request A: SELECT ... FOR UPDATE on wallet A → acquires lock, reads balance 100
Request B: SELECT ... FOR UPDATE on wallet A → BLOCKS, waits for A's lock to release
Request A: checks 100 >= 80 → yes. Deducts 80. Writes balance = 20. COMMIT (lock released)
Request B: now proceeds, reads balance 20 (the up-to-date value)
Request B: checks 20 >= 80 → NO. raise exception 'Insufficient wallet balance'.
```

The lock forces request B to wait until A is completely done, so B sees the *correct, post-A* balance. The second gift correctly fails instead of silently corrupting the balance.

### Rules of thumb for `FOR UPDATE`

- Use it whenever you `SELECT` a row that you are about to `UPDATE` based on its current value (balances, counters, "one draft per X" upserts).
- Lock rows in a **consistent order** across the whole codebase (e.g., always lock the supporter's wallet before the creator's wallet) to avoid **deadlocks** — two transactions each waiting on a lock the other holds.
- Keep the transaction short — don't do slow work (network calls, loops over thousands of rows) while holding a lock, because every other request touching that row queues up behind you.

---

## `FOR UPDATE SKIP LOCKED` — for queue-style processing

Not used heavily in this project yet, but you'll see it in scheduled/cron-style functions that process a batch of pending rows (e.g., notification queues in `memberships.sql`). `SKIP LOCKED` tells PostgreSQL: "if a row is already locked by another worker, skip it instead of waiting."

```sql
-- a worker grabbing the next 10 unprocessed jobs without colliding with other workers
SELECT id FROM public.job_queue
WHERE status = 'pending'
ORDER BY created_at
LIMIT 10
FOR UPDATE SKIP LOCKED;
```

This lets multiple workers process a queue in parallel without ever processing the same row twice or blocking each other.

---

## `ON CONFLICT` as a concurrency tool

Recall `ON CONFLICT` (Day 2). It's not just an "upsert convenience" — it's also **atomic**, which makes it safer than "check if exists, then insert" under concurrency:

```sql
-- BAD: race condition between the SELECT and the INSERT
SELECT id FROM public.wallets WHERE profile_id = $1;
-- ... if not found ...
INSERT INTO public.wallets (profile_id, balance) VALUES ($1, 0);

-- GOOD: atomic, safe even if two requests run this at the same time
INSERT INTO public.wallets (profile_id, balance)
VALUES ($1, 0)
ON CONFLICT (profile_id) DO NOTHING;
```

With the "BAD" version, two concurrent requests could both see "not found" and both try to `INSERT`, causing a unique constraint violation (or two wallets, if there were no unique constraint). `ON CONFLICT` lets PostgreSQL handle the race internally, in a single atomic statement.

---

## Isolation levels (awareness only)

PostgreSQL's default isolation level is **Read Committed** — every statement in your transaction sees the latest committed data at the moment that statement runs. This is what makes `FOR UPDATE` necessary: without it, two `SELECT`s in different transactions can both read the "old" value before either writes.

You won't need to change isolation levels in this project, but if you ever see `SET TRANSACTION ISOLATION LEVEL ...` in a migration, it means someone needed stronger guarantees (e.g., `SERIALIZABLE` for a report that must be perfectly consistent across multiple tables).

---

## Exercises

1. Open `supabase/schemas/payments.sql` and find every `for update` in `process_payment`. For each one, write down: which table/row is locked, and why (what bad outcome does it prevent?).

2. Explain in your own words why `RAISE EXCEPTION` after a `SELECT ... FOR UPDATE` but before any `UPDATE` is still safe — i.e., why doesn't the lock "leak" if the function aborts?

3. Two creators, A and B, both run a function that does `select balance from wallets where profile_id = A's id for update` then later `select balance from wallets where profile_id = B's id for update` — but in the *opposite order* in a different code path. Explain how this could cause a deadlock, and how PostgreSQL would respond (hint: search "deadlock_timeout" in the PostgreSQL docs).

4. Find the wallet-creation `ON CONFLICT (profile_id) DO NOTHING` pattern in `payments.sql`. Explain why this is safer than checking `SELECT ... WHERE profile_id = $1` first and only inserting if no row is found.

5. Open `supabase/schemas/withdrawal_requests.sql`. Does the withdrawal-creation function lock the wallet row before checking the available balance? If yes, find the `for update`. If no, discuss with your tech lead whether it should.
