# Manager RPCs

Manager-specific RPCs are `SECURITY DEFINER` functions that enforce their own permission checks internally. They bypass RLS and operate on the caller's JWT claims via `authorize_manager()`.

---

## `moderate_user`

Toggles moderation flags on a user profile. Pass `null` for any flag to leave it unchanged.

### Signature

```sql
public.moderate_user(
  p_user_id             uuid,
  p_is_page_active      boolean default null,
  p_allow_gifting       boolean default null,
  p_allow_subs          boolean default null,
  p_is_founder_discount boolean default null,
  p_suspension_reason   text    default null
)
returns jsonb
```

Granted to `service_role` only (not `authenticated`) — callers must go through your backend/edge function, which forwards the manager's JWT claims via `request.jwt.claims` so `authorize_manager()` still resolves correctly.

### Permission gates

| Parameter | Permission required |
|---|---|
| `p_is_page_active = false` | `users.suspend` |
| `p_is_page_active = true` | `users.reactivate` |
| `p_allow_gifting`, `p_allow_subs`, or `p_is_founder_discount` | `content.moderate` |

A single call can mix flags (e.g. suspend + disable gifting), but each flag is checked independently. If any permission check fails, the function returns immediately with `UNAUTHORIZED` — **no partial writes occur**.

### Suspension audit trail

When `p_is_page_active = false`, the profile's `suspension_reason`, `suspended_at`, and `suspended_by` columns are stamped with `p_suspension_reason`, `now()`, and the acting manager's `auth.uid()` respectively. When `p_is_page_active = true`, all three are cleared back to `null`. Leaving `p_is_page_active` as `null` (e.g. when only toggling `p_allow_gifting`) leaves the audit trail untouched.

### Return values

```json
{ "success": true }
{ "success": false, "error": "UNAUTHORIZED" }
{ "success": false, "error": "NOT_FOUND" }
```

### Examples

```sql
-- Suspend a user's page, recording why
select public.moderate_user(
  'user-uuid',
  p_is_page_active    := false,
  p_suspension_reason := 'Repeated policy violations'
);

-- Reactivate a suspended page (clears suspension_reason/suspended_at/suspended_by)
select public.moderate_user('user-uuid', p_is_page_active := true);

-- Disable gifting only (does not touch is_page_active)
select public.moderate_user('user-uuid', p_allow_gifting := false);

-- Disable gifting and subscriptions in one call
select public.moderate_user('user-uuid', p_allow_gifting := false, p_allow_subs := false);

-- Full suspension: page off + all features disabled
select public.moderate_user(
  'user-uuid',
  p_is_page_active := false,
  p_allow_gifting  := false,
  p_allow_subs     := false
);

-- Grant the Founder 1,000 cohort perk (0% platform fees on all service types)
select public.moderate_user('user-uuid', p_is_founder_discount := true);
```

### Notes

- Updates `updated_at` automatically via the RPC (not the trigger, since the trigger fires on row changes regardless).
- Does not touch `role`, `username`, `page_slug`, or any other profile column.
- Reversible: call again with the opposite values to undo.

---

## `process_withdrawal`

Advances a withdrawal request through its lifecycle. Enforces the valid status transitions and sets the appropriate timestamps.

### Signature

```sql
public.process_withdrawal(
  p_withdrawal_id uuid,
  p_new_status    public.withdrawal_status,
  p_admin_note    text default null
)
returns jsonb
```

### Allowed transitions

```
requested → approved         (requires payouts.approve)
approved  → processing       (requires payouts.process)
processing → paid            (requires payouts.process)
any        → rejected        (requires payouts.process)
any        → failed          (requires payouts.process)
```

| `p_new_status` | Permission required |
|---|---|
| `'approved'` | `payouts.approve` |
| `'processing'`, `'paid'`, `'rejected'`, `'failed'` | `payouts.process` |
| anything else | Returns `INVALID_STATUS` |

The function does **not** enforce the sequencing of transitions (e.g. you can move from `requested` directly to `processing` if you have `payouts.process`). If strict sequencing is needed, add it at the application layer.

### Timestamps set automatically

| New status | `processed_at` | `completed_at` |
|---|---|---|
| `approved` | set to `now()` | unchanged |
| `processing` | set to `now()` | unchanged |
| `rejected` | set to `now()` | unchanged |
| `paid` | unchanged | set to `now()` |
| `failed` | unchanged | set to `now()` |

### Return values

```json
{ "success": true, "new_status": "approved" }
{ "success": false, "error": "UNAUTHORIZED" }
{ "success": false, "error": "NOT_FOUND" }
{ "success": false, "error": "INVALID_STATUS" }
```

### Examples

```sql
-- Approve a pending withdrawal
select public.process_withdrawal(
  'withdrawal-uuid',
  'approved',
  'Verified account details — approved'
);

-- Mark as processing (transfer initiated)
select public.process_withdrawal('withdrawal-uuid', 'processing');

-- Mark as paid (complete)
select public.process_withdrawal('withdrawal-uuid', 'paid');

-- Reject with reason
select public.process_withdrawal(
  'withdrawal-uuid',
  'rejected',
  'Account number mismatch — please update payout method'
);
```

### Notes

- `admin_note` is optional. When passed, it is stored on the `withdrawal_requests` row. When `null`, the existing `admin_note` is preserved (`COALESCE`).
- The wallet balance adjustment on rejection/failure is **not** handled by this RPC — that should be handled by a trigger or a separate step in your admin workflow. Wire a `AFTER UPDATE` trigger on `withdrawal_requests` if you want automatic wallet refunding on rejection.
- The companion `request_withdrawal` RPC (user-facing) handles the initial submission and locks the wallet balance.

---

## `flag_transaction_disputed`

Staff record a chargeback/dispute reported by the payment gateway against a transaction. There is no gateway webhook integration yet — this is a manual admin-panel action.

### Signature

```sql
public.flag_transaction_disputed(
  p_transaction_id uuid,
  p_is_disputed    boolean default true
)
returns jsonb
```

Requires `transactions.refund`. Granted to `service_role` only. Sets `transactions.is_disputed`, and stamps (or clears, when `p_is_disputed := false`) `dispute_noted_at`/`dispute_noted_by`.

### Return values

```json
{ "success": true, "transaction_id": "...", "is_disputed": true }
{ "success": false, "error": "UNAUTHORIZED" }
{ "success": false, "error": "NOT_FOUND" }
```

### Examples

```sql
-- Flag a chargeback reported by the gateway
select public.flag_transaction_disputed('transaction-uuid');

-- Clear a flag set in error
select public.flag_transaction_disputed('transaction-uuid', false);
```

See [Transactions → Chargebacks / Disputes](../../payments-and-memberships/backend/transactions.md#chargebacks-disputes-vs-refunds) for how this differs from `refunds`.

---

## `admin_process_refund`

Approves, rejects, or completes an on-platform refund request created via the user-facing `request_refund` RPC. Does not move wallet funds — support reverses the underlying payment gateway charge out-of-band, then records the outcome here.

### Signature

```sql
public.admin_process_refund(
  p_refund_id             uuid,
  p_new_status            public.refund_status_enum,  -- 'approved' | 'rejected' | 'completed'
  p_platform_fee_refunded numeric default 0            -- only applied when p_new_status = 'completed'
)
returns jsonb
```

Requires `transactions.refund`. Granted to `service_role` only. Rejects any transition away from an already-finalised (`rejected`/`completed`) refund.

### Return values

```json
{ "success": true, "refund_id": "...", "new_status": "approved" }
{ "success": false, "error": "UNAUTHORIZED" }
{ "success": false, "error": "INVALID_STATUS" }
{ "success": false, "error": "NOT_FOUND" }
{ "success": false, "error": "ALREADY_FINALISED" }
```

### Examples

```sql
-- Approve a pending refund request
select public.admin_process_refund('refund-uuid', 'approved');

-- Complete it once the gateway reversal is confirmed, also refunding the platform's fee
select public.admin_process_refund('refund-uuid', 'completed', 25.00);
```

See [Refunds](../../payments-and-memberships/backend/refunds.md) for the full table/RLS/lifecycle reference, including the user-facing `request_refund` RPC.

---

## Existing Approval RPCs (content_manager)

These RPCs were added before the current RBAC expansion. They follow the same pattern — `SECURITY DEFINER`, check `authorize_manager('content.approve')` internally.

| RPC | Table | Permission |
|---|---|---|
| `approve_newsletter_post(p_post_id)` | `newsletter_posts` | `content.approve` |
| `reject_newsletter_post(p_post_id, p_rejection_reason)` | `newsletter_posts` | `content.approve` |
| `approve_shop_category(p_category_id)` | `shop_categories` | `content.approve` |
| `reject_shop_category(p_category_id, p_rejection_reason)` | `shop_categories` | `content.approve` |
| `approve_shop_product(p_product_id)` | `shop_products` | `content.approve` |
| `reject_shop_product(p_product_id, p_rejection_reason)` | `shop_products` | `content.approve` |

Prefer these RPCs over direct UPDATE for status transitions — they handle side-effects (activity notifications, `published_at` auto-set, draft cleanup).
