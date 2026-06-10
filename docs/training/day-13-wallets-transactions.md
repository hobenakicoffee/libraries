# Day 13 — Wallets, Transactions, and the Withdrawal Flow

## Goal

By the end of today you understand how money moves through the platform — from a gift payment to a creator's wallet balance to a withdrawal request — and can trace the full financial flow through the schema.

---

## Resources

- `supabase/schemas/wallets.sql`
- `supabase/schemas/transactions.sql`
- `supabase/schemas/withdrawal_requests.sql`
- `supabase/schemas/payout_methods.sql`
- `supabase/schemas/payments.sql`
- `supabase/tests/003-wallets-tests.sql`
- `supabase/tests/004-transactions-tests.sql`
- `supabase/tests/006-withdrawal-requests-tests.sql`
- [PostgreSQL: Advisory locks](https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS) — used in withdrawal processing

---

## The financial model

```
Supporter pays → payment recorded → creator's wallet.balance increases
                                   → transaction row created (credit)

Creator requests withdrawal → wallet.locked_balance increases
                              → wallet.balance decreases
                              → transaction row created (withdraw_lock)
                              → withdrawal_request row created

Manager processes withdrawal → actual payout sent (Bkash/bank)
                              → wallet.locked_balance decreases
                              → transaction row created (withdraw_complete)
                              → withdrawal_request status → 'paid'
```

---

## `wallets.sql` — the balance store

Every creator has exactly one wallet:

```sql
CREATE TABLE public.wallets (
  id           bigint generated always as identity primary key,
  profile_id   uuid not null references public.profiles on delete cascade,
  balance      numeric(12, 2) not null default 0.00,
  locked_balance numeric(12, 2) not null default 0.00,
  currency     text not null default 'BDT',
  ...
  UNIQUE (profile_id),  -- one wallet per creator
  CONSTRAINT balance_not_negative CHECK (balance >= 0),
  CONSTRAINT locked_balance_not_negative CHECK (locked_balance >= 0)
);
```

- `balance` — the amount available for withdrawal
- `locked_balance` — amount reserved for a pending withdrawal request (cannot be used until the withdrawal succeeds or fails)

**The balance is never set directly in application code.** All modifications go through SQL functions that update both the wallet and create a transaction record atomically in a single database transaction.

---

## `transactions.sql` — the immutable ledger

Transactions are **never updated or deleted** after creation. They are an append-only log of every money movement.

Key columns:

| Column | Meaning |
|--------|---------|
| `user_profile_id` | Whose wallet this affects |
| `direction` | `credit` (money in) or `debit` (money out) |
| `service_type` | `gift`, `newsletter`, `shop`, `withdrawal`, `adjustment` |
| `reference_type` | `one-time`, `subscription`, `payout`, `withdraw_lock`, `withdraw_release`, `withdraw_complete`, `manual_adjustment` |
| `amount` | Gross amount |
| `platform_fee` | Fee taken by the platform |
| `net_amount` | `amount - platform_fee` (what actually hits the wallet) |
| `balance_after` | Wallet balance after this transaction |
| `status` | `pending`, `processing`, `completed`, `failed`, etc. |

The `balance_after` column creates an auditable trail — you can verify every balance change is accounted for.

---

## `payout_methods.sql` — withdrawal accounts

Before withdrawing, a creator must register a payout account (Bkash number, bank account, etc.):

```sql
CREATE TABLE public.payout_methods (
  id           bigint generated always as identity primary key,
  profile_id   uuid not null references public.profiles on delete cascade,
  provider     public.payout_provider not null,  -- bkash, nagad, rocket, bank
  account_number text not null,
  is_primary   boolean default false,
  is_verified  boolean default false,
  ...
);
```

A creator can have multiple payout methods but only one primary.

---

## `withdrawal_requests.sql` — the withdrawal lifecycle

A withdrawal request moves through these statuses:

```
requested → approved → processing → paid
                     ↘ rejected
         ↘ rejected (by finance manager)
                              ↘ failed (payment failed)
```

Key function: `request_withdrawal(p_amount, p_payout_method_id)`

This function (inside `withdrawal_requests.sql`) does all of this atomically:
1. Checks the creator has KYC verified
2. Checks the creator has enough balance
3. Creates a `withdraw_lock` transaction (debit from balance, credit to locked_balance)
4. Creates the `withdrawal_requests` row
5. Returns the new request ID

```sql
-- simplified version of the logic:
BEGIN
  -- lock the wallet row to prevent concurrent withdrawals
  SELECT * FROM public.wallets
  WHERE profile_id = auth.uid()
  FOR UPDATE;  -- row lock

  -- check sufficient balance
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- lock the funds
  UPDATE public.wallets SET
    balance = balance - p_amount,
    locked_balance = locked_balance + p_amount
  WHERE profile_id = auth.uid();

  -- record the lock transaction
  INSERT INTO public.transactions (...) VALUES (..., 'withdraw_lock', ...);

  -- create the request
  INSERT INTO public.withdrawal_requests (...) VALUES (...);
  
COMMIT;
```

The `FOR UPDATE` lock prevents two concurrent withdrawal requests from both seeing the same balance and double-spending. PostgreSQL ensures only one transaction proceeds at a time.

---

## The `process_withdrawal` function

Called by finance managers to actually pay out a withdrawal:

1. Verifies the caller has `payouts.process` permission
2. Marks the request as `processing`
3. (External step: actual Bkash/bank API call happens outside this function)
4. On success: decrements `locked_balance`, creates `withdraw_complete` transaction
5. On failure: releases the lock back to `balance`, creates `withdraw_release` transaction

The `superseded_by` column on withdrawal requests supports the retry flow — if a withdrawal fails, a new request is created and the old one points to the new one via `superseded_by`.

---

## Transaction stats RPC

The project has RPCs for the transaction stats dashboard. Open `supabase/schemas/transactions.sql` and find the `get_transaction_stats` function (or similar). It uses:

```sql
COUNT(id) FILTER (WHERE reference_type = 'one-time' AND direction = 'credit') AS earned_one_time,
COUNT(id) FILTER (WHERE reference_type = 'subscription' AND direction = 'credit') AS earned_subscription,
SUM(net_amount) FILTER (WHERE direction = 'credit' AND status = 'completed') AS total_earned,
```

`FILTER (WHERE ...)` is PostgreSQL's way of computing conditional aggregates in one pass — much more efficient than multiple queries.

---

## Why `numeric(12, 2)` for money?

```sql
balance numeric(12, 2)
```

`NUMERIC` stores exact decimal values — unlike `FLOAT` which can have rounding errors. `(12, 2)` means up to 12 digits total, 2 after the decimal point. For BDT amounts up to 9,999,999,999.99 — more than enough.

**Never use `FLOAT` or `REAL` for money.** Floating-point arithmetic can produce values like `100.1 + 200.2 = 300.30000000000001`.

---

## Reading the withdrawal test file

Open `supabase/tests/006-withdrawal-requests-tests.sql`. Notice the test structure:

1. Setup: create test users and wallets
2. Test happy path: request → approve → process → paid
3. Test edge cases: insufficient balance, double withdrawal, KYC not verified
4. Test permission: non-finance-manager cannot process
5. Teardown: implicit via `ROLLBACK` at test end

This is the pattern for testing financial logic — always test both the success case and every error case.

---

## Exercises

1. Open `supabase/schemas/wallets.sql`. Find every SQL function defined. For each one, write: what does it do, who can call it (permissions), and what does it return?

2. Trace a full gift flow on paper:
   - Supporter sends a 500 BDT gift to a creator
   - Platform takes a 10% fee
   - Write down every database change that should happen (wallet update, transaction insert, etc.)
   - Then open `supabase/schemas/coffee_gifts.sql` and verify your trace matches the actual code.

3. Open `supabase/schemas/withdrawal_requests.sql`. Find the `FOR UPDATE` row lock. Why is this needed? What bad thing could happen without it?

4. Open `supabase/tests/006-withdrawal-requests-tests.sql`. Find the test that verifies the balance constraint. What SQL assertions does it use? (Look for `SELECT results_eq`, `SELECT is`, `SELECT ok` — these are pgTAP assertion functions.)

5. Write a SQL query that shows, for each creator, their current `balance`, `locked_balance`, and the total `net_amount` of completed credit transactions from the `transactions` table. The two totals should roughly match (they differ only if there are pending/failed transactions). Run it in your local DB.

6. The `superseded_by` column on `withdrawal_requests` supports the retry flow. Open the migration `20260515020000_add_superseded_by_to_withdrawal_requests.sql`. What does it add and why?
