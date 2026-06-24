# Wallets

The `wallets` table is the single source of truth for a creator's available balance. Every creator has at most one wallet row, created on first payment.

---

## Table Definition

```sql
create table public.wallets (
  id             uuid          primary key default gen_random_uuid(),
  profile_id     uuid          not null unique references public.profiles(id) on delete cascade,
  balance        numeric(12,2) not null default 0 check (balance >= 0),
  locked_balance numeric(12,2) not null default 0 check (locked_balance >= 0),
  currency       text          not null default 'BDT',
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);
```

### Column Reference

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` | Primary key |
| `profile_id` | `uuid` | FK → `profiles.id`; unique — one wallet per user |
| `balance` | `numeric(12,2)` | Spendable balance in BDT. Always `≥ 0` |
| `locked_balance` | `numeric(12,2)` | Funds reserved for a pending withdrawal. Always `≥ 0` |
| `currency` | `text` | Always `'BDT'` for now |
| `created_at` | `timestamptz` | Row creation timestamp |
| `updated_at` | `timestamptz` | Auto-updated by trigger on every `UPDATE` |

---

## Balance vs Locked Balance

```
Total wallet value = balance + locked_balance
Immediately spendable = balance
In-flight withdrawal = locked_balance
```

When a user submits a withdrawal request:
- `balance` decreases by the requested amount.
- `locked_balance` increases by the same amount.

When the withdrawal is approved and paid:
- `locked_balance` decreases to zero (for that withdrawal).

When a withdrawal is rejected or fails:
- `locked_balance` decreases and `balance` is restored.

---

## Row Level Security

| Operation | Policy | Who |
|---|---|---|
| `SELECT` | `Users and managers can view wallets` | Owner (`profile_id = auth.uid()`) or `transactions.view` permission |
| `INSERT` | — | Not allowed for `authenticated`/`anon` |
| `UPDATE` | — | Not allowed for `authenticated`/`anon` |
| `DELETE` | — | Not allowed for `authenticated`/`anon` |

::: warning
**Security fix (SEC-02, 2026-06-24):** wallets used to carry an owner-writable `INSERT`/`UPDATE` policy with no balance constraint, letting an authenticated client set their own `balance` directly and then withdraw it. Those policies have been removed entirely; `insert/update/delete` is now revoked from `authenticated`/`anon` at the grant level (defense in depth, not just RLS). All balance mutations go exclusively through `SECURITY DEFINER` RPCs (`handle_successful_payment`, `request_withdrawal`, `process_withdrawal`), which bypass RLS as the function owner regardless of the table grants above.
:::

---

## Triggers

### `on_wallet_updated` — auto-`updated_at`

```sql
create trigger on_wallet_updated
  before update on public.wallets
  for each row
  execute procedure public.handle_updated_at();
```

### `on_wallet_balance_changed` — syncs `profiles.has_wallet_balance`

```sql
create or replace function public.handle_wallet_balance_change()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  update public.profiles
  set has_wallet_balance = (new.balance > 0),
      updated_at = now()
  where id = new.profile_id;
  return new;
end;
$$;

create trigger on_wallet_balance_changed
  after insert or update of balance on public.wallets
  for each row
  execute procedure public.handle_wallet_balance_change();
```

Whenever `balance` changes (including on `INSERT`), the trigger updates `profiles.has_wallet_balance`. This boolean flag lets you cheaply show/hide wallet-related UI without querying the wallets table on every profile load.

---

## Indexes

| Index | Columns | Purpose |
|---|---|---|
| `idx_wallets_profile_id` | `profile_id` | Fast lookup by user |
| `idx_wallets_updated_at` | `updated_at DESC` | Recent-activity queries |

---

## Wallet Creation

Wallets are created **lazily** — only when a creator first receives a payment. `handle_successful_payment` uses an `INSERT ... ON CONFLICT DO NOTHING` pattern:

```sql
insert into public.wallets (profile_id, balance)
values (p_creator_profile_id, 0)
on conflict (profile_id) do nothing;
```

You do not need to pre-create wallets when a user registers.

---

## Common Queries

### Get a user's wallet balance

```sql
select balance, locked_balance, currency
from public.wallets
where profile_id = auth.uid();
```

### Check if a user has a wallet (server-side)

```sql
select exists (
  select 1 from public.wallets where profile_id = $1
);
```
