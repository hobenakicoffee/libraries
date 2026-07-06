# Refunds

The `refunds` table tracks supporter/creator-initiated refund requests against a completed transaction. It is distinct from chargebacks/disputes (`transactions.is_disputed`) — see [Chargebacks / Disputes vs. Refunds](./transactions#chargebacks-disputes-vs-refunds).

Refunds do **not** move wallet funds automatically. For transactions paid via `provider = 'SSLCommerz'`, an approved refund is reversed at the gateway automatically — see [Gateway automation](#gateway-automation-sslcommerz) below. For every other provider (e.g. wallet-funded `HobeNakiCoffee` transactions), support still reverses the charge out-of-band and completes it manually via `admin_process_refund`. This table is the system of record for what was promised/approved/completed either way.

---

## Table Definition

```sql
create table public.refunds (
  id                      uuid                      primary key default gen_random_uuid(),
  transaction_id          uuid                      not null references public.transactions(id) on delete restrict,
  requested_by_profile_id uuid                      not null references public.profiles(id) on delete cascade,

  status                  public.refund_status_enum not null default 'requested',
  reason                  text                      not null,

  amount                  numeric(10,2)             not null check (amount > 0),
  platform_fee_refunded   numeric(10,2)             not null default 0 check (platform_fee_refunded >= 0),

  processed_by            uuid                      references public.profiles(id) on delete set null,
  processed_at            timestamptz,

  gateway_status          public.refund_gateway_status_enum not null default 'not_applicable',
  gateway_refund_ref_id   varchar(50),
  gateway_response        jsonb,
  gateway_initiated_at    timestamptz,
  gateway_confirmed_at    timestamptz,

  created_at              timestamptz               not null default now(),
  updated_at              timestamptz               not null default now()
);
```

### Column Reference

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` | Primary key |
| `transaction_id` | `uuid` | The transaction being refunded (typically the creator's credit-side row, which carries `platform_fee`). `ON DELETE RESTRICT` — a transaction with an open or resolved refund cannot be deleted |
| `requested_by_profile_id` | `uuid` | Whoever called `request_refund` — the supporter who paid, or the creator |
| `status` | `refund_status_enum` | `requested` → `approved`/`rejected` → `completed` |
| `reason` | `text` | Required free-text reason supplied by the requester |
| `amount` | `numeric(10,2)` | Amount requested to be refunded; must not exceed the original transaction's `amount` |
| `platform_fee_refunded` | `numeric(10,2)` | Set when a manager (or the gateway, on auto-completion) completes the refund; how much of the platform's fee was also given back |
| `processed_by` | `uuid` | FK → `profiles.id`; the manager who last actioned the refund (`ON DELETE SET NULL`). `null` when the refund auto-completed via gateway confirmation |
| `processed_at` | `timestamptz` | When `admin_process_refund` (or `admin_record_gateway_refund_result`) last finalised this row |
| `gateway_status` | `refund_gateway_status_enum` | SSLCommerz gateway lifecycle, independent of `status`. `not_applicable` for non-SSLCommerz transactions |
| `gateway_refund_ref_id` | `varchar(50)` | SSLCommerz's `refund_ref_id`, returned by `initiateRefund()` and used to poll status |
| `gateway_response` | `jsonb` | Raw response from the last `initiateRefund`/status-query call, for audit |
| `gateway_initiated_at` | `timestamptz` | Set the first time `gateway_status` leaves `not_applicable`/`pending` |
| `gateway_confirmed_at` | `timestamptz` | Set when `gateway_status` reaches a terminal state (`refunded`/`failed`) |

### `refund_status_enum`

| Value | Meaning |
|---|---|
| `requested` | Created via `request_refund`, awaiting manager action |
| `approved` | Manager approved; refund is in progress (out-of-band, or at the gateway for SSLCommerz) |
| `rejected` | Manager rejected; terminal state |
| `completed` | Refund confirmed done — either a manager's manual completion, or automatic once the gateway reports `refunded`; terminal state |

```mermaid
stateDiagram-v2
    [*] --> requested
    requested --> approved
    requested --> rejected
    approved --> completed
    rejected --> [*]
    completed --> [*]
```

### `refund_gateway_status_enum`

Tracks the SSLCommerz side of a refund independently of `status` above.

| Value | Meaning |
|---|---|
| `not_applicable` | Default; used for non-SSLCommerz transactions (manual path) |
| `pending` | SSLCommerz-provider refund approved but not yet sent to the gateway |
| `processing` | `sslcommerz-refund` successfully initiated the refund at the gateway; awaiting confirmation |
| `refunded` | Gateway confirmed the refund — `admin_record_gateway_refund_result` flips `status` to `completed` |
| `failed` | Gateway rejected the refund, or reported `cancelled` on a status poll |

```mermaid
stateDiagram-v2
    [*] --> not_applicable
    not_applicable --> processing: sslcommerz-refund initiates
    processing --> refunded: gateway confirms
    processing --> failed: gateway rejects/cancels
```

---

## `request_refund` RPC (authenticated)

Either party on the transaction — the supporter who paid, or the creator, on their own initiative — can request a refund.

### Signature

```sql
create or replace function public.request_refund(
  p_transaction_id uuid,
  p_reason         text,
  p_amount         numeric default null  -- defaults to the full transaction amount
)
returns jsonb
```

### What it does

1. Authenticates the caller via `auth.uid()`.
2. Requires a non-blank `p_reason`.
3. Looks up the transaction; the caller must be `user_profile_id` or `counterparty_profile_id` on that row.
4. Requires the transaction `status = 'completed'`.
5. Validates `0 < p_amount <= transaction.amount` (defaults to the full amount when omitted).
6. Rejects if a `requested`/`approved` refund is already pending for the same transaction.
7. Inserts the `refunds` row and returns its id.

### Return values

```json
{ "success": true, "refund_id": "..." }
{ "success": false, "error": "UNAUTHENTICATED" }
{ "success": false, "error": "REASON_REQUIRED" }
{ "success": false, "error": "TRANSACTION_NOT_FOUND" }
{ "success": false, "error": "FORBIDDEN" }
{ "success": false, "error": "TRANSACTION_NOT_COMPLETED" }
{ "success": false, "error": "INVALID_AMOUNT" }
{ "success": false, "error": "REFUND_ALREADY_PENDING" }
```

### Example

```sql
-- Full-amount refund request
select public.request_refund('transaction-uuid', 'Product not as described');

-- Partial refund request
select public.request_refund('transaction-uuid', 'One item missing', 150.00);
```

---

## `admin_process_refund` RPC (manager only — `transactions.refund`)

Approves, rejects, or completes a refund request. Does not move wallet funds — support reverses the underlying payment gateway charge out-of-band, then records the outcome here.

### Signature

```sql
create or replace function public.admin_process_refund(
  p_refund_id             uuid,
  p_new_status            public.refund_status_enum,  -- 'approved' | 'rejected' | 'completed'
  p_platform_fee_refunded numeric default 0            -- only applied when p_new_status = 'completed'
)
returns jsonb
```

Rejects any transition away from an already-finalised (`rejected`/`completed`) refund.

::: warning
**Security fix (SEC-10, 2026-06-24):** `EXECUTE` is now granted to `authenticated` (previously `service_role` only, which made the function unreachable since `service_role` has no `manager_role` JWT claim for `authorize_manager()` to check). Managers call this directly with their own session. See [Manager RPCs](../../managers-and-rbac/backend/rpcs.md#admin_process_refund).
:::

### Return values

```json
{ "success": true, "refund_id": "...", "new_status": "approved" }
{ "success": false, "error": "UNAUTHORIZED" }
{ "success": false, "error": "INVALID_STATUS" }
{ "success": false, "error": "NOT_FOUND" }
{ "success": false, "error": "ALREADY_FINALISED" }
```

### Example

```sql
-- Approve a pending refund request
select public.admin_process_refund('refund-uuid', 'approved');

-- Complete it once the gateway reversal has been confirmed,
-- also refunding the platform's fee
select public.admin_process_refund('refund-uuid', 'completed', 25.00);
```

---

## Gateway automation (SSLCommerz)

For transactions paid via `provider = 'SSLCommerz'`, `transactions.provider_transaction_id` already stores SSLCommerz's `bank_tran_id` (set in `sslcommerz-ipn`'s dispatch call — see [Payments](./payments.md)). Once a manager approves a refund (`admin_process_refund(..., 'approved')`), the gateway side is automated instead of manual:

1. **`sslcommerz-refund` edge function** (manager-invoked, JWT-verified): looks up the refund's transaction, confirms `provider = 'SSLCommerz'` and `status = 'approved'`, then calls SSLCommerz's real refund API (`initiateRefund()` in `_shared/sslcommerz/client.ts`) with `bank_tran_id`, `refund_amount`, and `refund_remarks` (the refund's `reason`). Records the outcome via `admin_record_gateway_refund_result` — `gateway_status` becomes `processing` on success or `failed` otherwise.
2. **`dispatch_pending_refund_reconciliation()`** (pg_cron, every 15 minutes): batches refunds stuck in `gateway_status = 'processing'` and posts them via `pg_net` to the **`sslcommerz-refund-status`** edge function (same `X-Dispatch-Secret` pattern as `dispatch_pending_email_notifications` in `email_notifications.sql` — reuses the same Vault secrets, no additional setup needed).
3. **`sslcommerz-refund-status` edge function** (dispatch-secret protected): polls SSLCommerz's refund-status endpoint (`getRefundStatus()`) for each pending refund and records the result — `refunded` flips `gateway_status` to `refunded` (which also completes the refund), `processing` is a no-op refresh, and `cancelled`/anything else maps to `failed`.

Non-SSLCommerz refunds are unaffected — `gateway_status` stays `not_applicable` and `admin_process_refund` remains the only way to move them through `approved`/`rejected`/`completed`.

::: warning
**Blocked on an operational step:** SSLCommerz requires the production server's public IP to be registered with them before `initiateRefund`/`getRefundStatus` will succeed against the live API. Until that's done, `sslcommerz-refund` will surface `APIConnect: INACTIVE`/`INVALID_REQUEST` as a `gateway_status = 'failed'` result rather than crashing, so this is safe to have deployed ahead of registration.
:::

### `admin_record_gateway_refund_result` RPC (service role only)

Called by `sslcommerz-refund` and `sslcommerz-refund-status` to record the outcome of a call to SSLCommerz's refund API. Not reachable by managers directly — the gateway call itself happens in the edge functions, since plpgsql cannot make HTTP requests.

### Signature

```sql
create or replace function public.admin_record_gateway_refund_result(
  p_refund_id              uuid,
  p_gateway_status         public.refund_gateway_status_enum,
  p_gateway_refund_ref_id  varchar default null,
  p_gateway_response       jsonb default null,
  p_platform_fee_refunded  numeric default 0
)
returns jsonb
```

Sets `gateway_status`/`gateway_refund_ref_id`/`gateway_response`, stamps `gateway_initiated_at`/`gateway_confirmed_at` as appropriate, and — only when `p_gateway_status = 'refunded'` — flips `status` to `completed` and records `platform_fee_refunded`/`processed_at`, mirroring what `admin_process_refund` does for the manual path. Rejects transitions on an already-finalised (`rejected`/`completed`) refund, same as `admin_process_refund`.

### Return values

```json
{ "success": true, "refund_id": "...", "gateway_status": "processing" }
{ "success": false, "error": "NOT_FOUND" }
{ "success": false, "error": "ALREADY_FINALISED" }
```

---

## Row Level Security

| Operation | Policy |
|---|---|
| `SELECT` | Requester (`requested_by_profile_id = auth.uid()`), the transaction's other party (`user_profile_id`/`counterparty_profile_id = auth.uid()`), or a manager with `transactions.refund` |
| `INSERT` | Blocked entirely (`with check (false)`) — use `request_refund` |
| `UPDATE` | Blocked entirely (`using (false)`) — use `admin_process_refund` |
| `DELETE` | Not allowed |

---

## Indexes

| Index | Columns | Purpose |
|---|---|---|
| `idx_refunds_transaction_id` | `transaction_id` | Look up refunds for a transaction |
| `idx_refunds_requested_by` | `requested_by_profile_id` | List a user's refund requests |
| `idx_refunds_status` | `status` | Admin queue filtering |
| `idx_refunds_gateway_status` | `gateway_status` | Reconciliation job's polling query (`gateway_status = 'processing'`) |
