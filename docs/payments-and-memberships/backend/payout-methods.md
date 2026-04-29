# Payout Methods

The `payout_methods` table stores each creator's registered bank or mobile banking accounts for receiving withdrawals.

---

## Table Definition

```sql
create table public.payout_methods (
  id           uuid                    primary key default gen_random_uuid(),
  profile_id   uuid                    not null references public.profiles(id) on delete cascade,
  provider     public.payout_provider  not null,
  details      jsonb                   not null default '{}'::jsonb,
  is_default   boolean                 not null default false,
  is_active    boolean                 not null default true,
  created_at   timestamptz             not null default now(),
  updated_at   timestamptz             not null default now()
);
```

### Column Reference

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` | Primary key |
| `profile_id` | `uuid` | FK → `profiles.id` |
| `provider` | `payout_provider` | One of: `bkash`, `nagad`, `rocket`, `bank` |
| `details` | `jsonb` | Provider-specific account data (see below) |
| `is_default` | `boolean` | Whether this is the user's primary payout method |
| `is_active` | `boolean` | Soft-delete flag; inactive methods are hidden from UI |
| `created_at` | `timestamptz` | Row creation timestamp |
| `updated_at` | `timestamptz` | Auto-updated by trigger |

---

## `details` JSONB Shapes

The `details` column stores different fields depending on `provider`.

### Mobile Banking (bkash / nagad / rocket)

```json
{
  "number": "01XXXXXXXXX",
  "type": "personal"
}
```

| Field | Type | Description |
|---|---|---|
| `number` | `string` | 11-digit Bangladeshi mobile number |
| `type` | `string` | `"personal"` or `"merchant"` |

### Bank Transfer

```json
{
  "bank_name": "BRAC Bank",
  "account_name": "John Doe",
  "account_number": "123456789",
  "routing_number": "090000",
  "branch_name": "Gulshan"
}
```

| Field | Type | Description |
|---|---|---|
| `bank_name` | `string` | Full bank name |
| `account_name` | `string` | Account holder name |
| `account_number` | `string` | Bank account number |
| `routing_number` | `string` | Bank routing/branch code |
| `branch_name` | `string` | Branch name |

---

## Soft Delete vs Hard Delete

Payout methods should generally be **soft-deleted** by setting `is_active = false` rather than hard-deleted, because:

- A `withdrawal_requests` row has a `payout_method_id` FK with `ON DELETE RESTRICT`.
- Deleting a method that has historical withdrawals will raise a foreign key violation.

If a user wants to remove a method, set `is_active = false` and stop returning it in the UI.

::: tip
Hard deletes are safe only if the payout method has never been used in any `withdrawal_requests` row.
:::

---

## Default Method Logic

The `is_default` flag is application-managed — the database does not enforce a single default. Your server-side code must ensure at most one method per user is flagged as default, typically by running:

```sql
-- Clear existing defaults, then set new one
update public.payout_methods
set is_default = false
where profile_id = $1;

update public.payout_methods
set is_default = true
where id = $2 and profile_id = $1;
```

---

## Row Level Security

| Operation | Policy |
|---|---|
| `SELECT` | Owner only (`profile_id = auth.uid()`) |
| `INSERT` | Owner only |
| `UPDATE` | Owner only |
| `DELETE` | Owner only |

---

## Indexes

| Index | Columns | Purpose |
|---|---|---|
| `idx_payout_methods_profile_id` | `profile_id` | List all methods for a user |
| `idx_payout_methods_profile_active` | `(profile_id, is_active)` | Filter active methods efficiently |

---

## Trigger

```sql
create trigger on_payout_method_updated
  before update on public.payout_methods
  for each row
  execute procedure public.handle_updated_at();
```

---

## Payout Snapshot in Withdrawals

When a withdrawal request is created via `request_withdrawal`, the RPC copies the current `details` JSONB into `withdrawal_requests.payout_snapshot`. This preserves the payout method state at the time of request, even if the method is later edited or deleted.

```sql
-- Inside request_withdrawal RPC
select details
into v_payout_details
from public.payout_methods
where id = p_payout_method_id
  and profile_id = v_user_id
  and is_active = true;

-- ... later:
insert into public.withdrawal_requests (
  ...
  payout_snapshot,
  ...
) values (
  ...
  v_payout_details,  -- snapshot captured at request time
  ...
);
```
