# Manager RLS Policies Reference

All manager-facing RLS policies are **permissive** and run alongside the existing user-scoped policies. Postgres evaluates permissive policies with OR — so a manager who satisfies a manager policy gets access even if they fail the user-ownership check.

Every policy uses the subselect form to avoid per-row function calls:

```sql
using ((select public.authorize_manager('permission.name')));
```

---

## Financial Tables

### `transactions`

| Policy | Operation | Permission required |
|---|---|---|
| `Managers can view all transactions` | SELECT | `transactions.view` |

Managers with `transactions.view` read the full ledger (all users, all directions). No write access — the transactions table is an immutable ledger.

---

### `wallets`

| Policy | Operation | Permission required |
|---|---|---|
| `Managers can view all wallets` | SELECT | `transactions.view` |

Read-only. Wallet balance can only be modified through service-definer RPCs (`request_withdrawal`, payment triggers). Managers monitor balances; they never write directly.

---

### `withdrawal_requests`

| Policy | Operation | Permission required |
|---|---|---|
| `Managers can view all withdrawal requests` | SELECT | `payouts.approve` OR `payouts.process` |
| `Managers can update withdrawal requests` | UPDATE | `payouts.approve` OR `payouts.process` |

Direct UPDATE is allowed by RLS, but always use the `process_withdrawal` RPC in practice — it enforces the valid state machine and sets `processed_at`/`completed_at` correctly. See [Manager RPCs](./rpcs.md#process_withdrawal).

---

### `payout_methods`

| Policy | Operation | Permission required |
|---|---|---|
| `Managers can view all payout methods` | SELECT | `payouts.approve` |

Read-only. Finance managers inspect payout methods when reviewing a withdrawal request. Users manage their own methods; managers never create or delete them.

---

### `shop_orders`

| Policy | Operation | Permission required |
|---|---|---|
| `Managers can view all shop orders` | SELECT | `transactions.view` |

Read-only for managers. Order writes go through checkout RPCs. Direct insert/update/delete is blocked for everyone (`with check (false)` policies remain in place).

---

### `shop_order_items`

| Policy | Operation | Permission required |
|---|---|---|
| `Managers can view all shop order items` | SELECT | `transactions.view` |

Read-only. Same pattern as `shop_orders`.

---

## Content Tables

### `newsletter_posts`

| Policy | Operation | Permission required |
|---|---|---|
| `Managers can view all newsletter posts` | SELECT | `content.approve` |
| `Managers can update all newsletter posts` | UPDATE | `content.moderate` |
| `Managers can delete all newsletter posts` | DELETE | `content.delete` |

For status transitions (review → published / draft), use the `approve_newsletter_post` / `reject_newsletter_post` RPCs — they handle activity notifications and trigger `published_at` auto-set. Direct UPDATE is available for metadata overrides, re-classification, or flagging.

---

### `newsletter_post_versions`

| Policy | Operation | Permission required |
|---|---|---|
| `Managers can view all newsletter post versions` | SELECT | `content.approve` |

Read-only. Gives content managers full revision history when reviewing a post.

---

### `shop_categories`

| Policy | Operation | Permission required |
|---|---|---|
| `Managers can view all shop categories` | SELECT | `content.approve` |
| `Managers can update all shop categories` | UPDATE | `content.moderate` |
| `Managers can delete all shop categories` | DELETE | `content.delete` |

---

### `shop_products`

| Policy | Operation | Permission required |
|---|---|---|
| `Managers can view all shop products` | SELECT | `content.approve` |
| `Managers can update all shop products` | UPDATE | `content.moderate` |
| `Managers can delete all shop products` | DELETE | `content.delete` |

Note: The existing `"Block direct product deletes"` policy (`using (false)`) blocks regular users. The manager DELETE policy runs alongside it as a separate permissive policy — a manager with `content.delete` can delete products even though regular users cannot.

---

### `shop_category_drafts`

| Policy | Operation | Permission required |
|---|---|---|
| `Managers can view all category drafts` | SELECT | `content.approve` |
| `Managers can update all category drafts` | UPDATE | `content.moderate` |
| `Managers can delete all category drafts` | DELETE | `content.delete` |

For the approval workflow (pending → approved / rejected), use `approve_shop_category` / `reject_shop_category` RPCs.

---

### `shop_product_drafts`

| Policy | Operation | Permission required |
|---|---|---|
| `Managers can view all product drafts` | SELECT | `content.approve` |
| `Managers can update all product drafts` | UPDATE | `content.moderate` |
| `Managers can delete all product drafts` | DELETE | `content.delete` |

For the approval workflow, use `approve_shop_product` / `reject_shop_product` RPCs.

---

### `messages`

RLS policies are defined on the parent `public.messages` table **and** manually on each existing partition. New partitions get these policies automatically via the updated `create_next_month_partition()` function.

| Policy | Operation | Permission required |
|---|---|---|
| `Managers can view all messages` | SELECT | `content.moderate` |
| `Managers can delete messages` | DELETE | `content.delete` |

Existing partitions with manager policies: `messages_2026_02`, `messages_2026_03`, `messages_2026_04`, `messages_default`.

> When a new partition is created manually (outside the cron job), add these two policies to it by hand or call `create_next_month_partition()`.

---

## User Management Tables

### `profiles`

The two previously-separate SELECT policies (`TO anon` and `TO authenticated`) were merged into one policy without a role target:

| Policy | Operation | Rule |
|---|---|---|
| `Anyone can view all profiles` | SELECT | `true` (all roles) |

Profile moderation (suspend page, disable gifting/subscriptions) is performed exclusively through the `moderate_user` RPC — no direct UPDATE policy exists for managers on this table. See [Manager RPCs](./rpcs.md#moderate_user).

---

### `user_services`

| Policy | Operation | Permission required |
|---|---|---|
| `Support managers can view all user services` | SELECT | `users.view_details` |
| `Support managers can update all user services` | UPDATE | `users.suspend` |

Support managers use this to enable or disable specific services (e.g., newsletter, gifting) for a user as part of account management.

---

### `impersonation_sessions`

| Policy | Operation | Permission required |
|---|---|---|
| `Managers can view own sessions, viewers can view all` | SELECT | Self (`manager_id = auth.uid()`) OR `users.view_details` |

No INSERT/UPDATE/DELETE policies for `authenticated`/`anon` — rows are written only by the
`impersonate-user` / `end-impersonation-session` edge functions (service role) and a
`pg_cron` job that marks lapsed sessions expired. See
`docs/user-impersonation-implementation.md` in the backend repo.

---

## Managers Tables

### `managers`

| Policy | Operation | Permission required |
|---|---|---|
| `Managers: Self view or authorized managers` | SELECT | Self OR `managers.view` |
| `Managers: authorized managers insert only` | INSERT | `managers.create` |
| `Managers: Self or authorized update` | UPDATE | Self OR `managers.update` |
| `Managers: Authorized delete only` | DELETE | `managers.delete` |

### `manager_user_roles`

| Policy | Operation | Rule |
|---|---|---|
| `Manager Roles: Individual read access` | SELECT | `user_id = auth.uid()` |
| `Allow auth admin to read manager roles` | SELECT (`supabase_auth_admin`) | `true` — required by the auth hook |

---

## Service Requests

### `service_requests`

| Policy | Operation | Permission required |
|---|---|---|
| `Users and managers can view service requests` | SELECT | Owner OR `service_requests.view` |
| `Managers can update service requests` | UPDATE | `service_requests.view` OR `service_requests.approve` OR `service_requests.reject` OR `service_requests.mark_implemented` |
