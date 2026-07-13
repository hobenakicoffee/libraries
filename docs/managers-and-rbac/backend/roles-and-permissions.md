# Roles & Permissions

## Permission Enum

All 29 permissions live in `public.manager_permission`. They are grouped by domain:

| Group | Permissions |
|---|---|
| **Managers** | `managers.create` `managers.view` `managers.update` `managers.delete` |
| **Content** | `content.moderate` `content.approve` `content.feature` `content.delete` |
| **Users** | `users.view_details` `users.suspend` `users.reactivate` `users.view_analytics` `users.impersonate` |
| **Transactions** | `transactions.view` `transactions.refund` |
| **Payouts** | `payouts.approve` `payouts.process` |
| **Support Tickets** | `support.tickets.view` `support.tickets.respond` `support.tickets.escalate` `support.tickets.close` |
| **Developers** | `developers.create` `developers.view` `developers.update` `developers.delete` |
| **Service Requests** | `service_requests.view` `service_requests.approve` `service_requests.reject` `service_requests.mark_implemented` |

---

## Role → Permission Matrix

| Permission | super_admin | content_manager | support_manager | finance_manager | developer_manager |
|---|:---:|:---:|:---:|:---:|:---:|
| `managers.create` | ✓ | | | | |
| `managers.view` | ✓ | | | | ✓ |
| `managers.update` | ✓ | | | | |
| `managers.delete` | ✓ | | | | |
| `content.moderate` | ✓ | ✓ | | | |
| `content.approve` | ✓ | ✓ | | | |
| `content.feature` | ✓ | ✓ | | | |
| `content.delete` | ✓ | ✓ | | | |
| `users.view_details` | ✓ | ✓ | ✓ | ✓ | |
| `users.suspend` | ✓ | | ✓ | | |
| `users.reactivate` | ✓ | | ✓ | | |
| `users.view_analytics` | ✓ | ✓ | ✓ | ✓ | |
| `users.impersonate` | ✓ | | ✓ | | |
| `transactions.view` | ✓ | | ✓ | ✓ | |
| `transactions.refund` | ✓ | | | ✓ | |
| `payouts.approve` | ✓ | | | ✓ | |
| `payouts.process` | ✓ | | | ✓ | |
| `support.tickets.view` | ✓ | ✓ | ✓ | | |
| `support.tickets.respond` | ✓ | ✓ | ✓ | | |
| `support.tickets.escalate` | ✓ | | ✓ | | |
| `support.tickets.close` | ✓ | | ✓ | | |
| `developers.create` | ✓ | | | | ✓ |
| `developers.view` | ✓ | | | | ✓ |
| `developers.update` | ✓ | | | | ✓ |
| `developers.delete` | ✓ | | | | ✓ |
| `service_requests.view` | ✓ | ✓ | ✓ | | ✓ |
| `service_requests.approve` | ✓ | | | | ✓ |
| `service_requests.reject` | ✓ | | | | ✓ |
| `service_requests.mark_implemented` | ✓ | | | | ✓ |

---

## Role Summaries

### `super_admin`
All 29 permissions. Can manage other manager accounts, approve/reject/delete any content, handle finances, and manage service requests.

### `content_manager`
Focuses on content quality. Can view, approve, update, and delete newsletter posts, shop categories, and shop products (including drafts). Can view user details and analytics. Can read support tickets and service request queues. Can toggle a user's `allow_gifting` and `allow_subscriptions` flags via `moderate_user`.

### `support_manager`
Handles user-facing issues. Can suspend and reactivate user pages via `moderate_user` (which records `suspension_reason`/`suspended_at`/`suspended_by` for audit purposes), manage user services (view + update), view transactions for dispute context, and fully manage the support ticket queue. Can also start time-boxed "log in as this user" support sessions via `users.impersonate` (edge functions `impersonate-user` / `impersonation-exchange` / `end-impersonation-session`) — see `docs/user-impersonation-implementation.md` in the backend repo for the full design and its current implementation status.

### `finance_manager`
Restricted to financial operations. Can read all transactions, wallets, withdrawal requests, and payout methods. Approves and processes withdrawals via `process_withdrawal`. Can refund transactions via `admin_process_refund` and flag gateway chargebacks via `flag_transaction_disputed` (both gated by `transactions.refund`). No content or user moderation access beyond viewing user details.

### `developer_manager`
Platform tooling focus. Full CRUD on developer accounts, approves/rejects service requests, and marks them implemented. Can view the manager list (read-only) and service request queue.

---

## Seed Data

Permissions are stored in `manager_role_permissions` and seeded via `supabase/seeds/seed.sql`. The seed uses sequential IDs — when adding new entries, continue from the current `MAX(id)` and update the `setval` call at the end.

```sql
-- Example: adding a new permission to support_manager
INSERT INTO public.manager_role_permissions (id, role, permission)
VALUES (61, 'support_manager', 'some.new_permission');

SELECT setval('"public"."manager_role_permissions_id_seq"'::regclass,
  (SELECT MAX(id) FROM public.manager_role_permissions));
```

> **Seed gaps to fill (not yet in seed.sql):**
> - `support_manager` → `users.suspend`, `users.reactivate`
> - `developer_manager` → `service_requests.approve`, `service_requests.reject`

`users.impersonate` (`super_admin`, `support_manager`) is seeded via the root `seed.ts`
(snaplet dev-data seed, separate from `supabase/seeds/seed.sql`) and inserted directly by
migration `20260713065538_seed_users_impersonate_permission.sql` — the enum value itself was
added in a separate prior migration (`20260713065537_add_user_impersonation.sql`) via `alter
type ... add value`, since a freshly added enum value can't be used in the same transaction
that adds it.

---

## `impersonation_sessions`

Audit/TTL table for manager "log in as this user" support sessions — not itself part of the
permission system, but gated by `users.impersonate` and closely related. Columns: `manager_id`
(fk `managers`), `target_user_id` (fk `auth.users`), `reason`, `ticket_reference`,
`started_at`/`expires_at`/`ended_at`/`ended_by` (`manager` / `expiry` / `user_revoked`). RLS:
a manager sees their own rows; `users.view_details` holders see all; no direct client writes
(inserted/updated only by the `impersonate-user` / `end-impersonation-session` edge functions
and an hourly-scale `pg_cron` job that marks lapsed sessions `ended_by = 'expiry'`). See
`supabase/schemas/impersonation_sessions.sql` and `docs/user-impersonation-implementation.md`
in the backend repo for the full design, including why ending a session row does not revoke
an already-minted JWT.

**Guards.** Every impersonation-minted JWT carries an `impersonated_by` claim. Money-moving
RPCs (`request_withdrawal`, `retry_withdrawal`, `process_withdrawal`, `request_refund`,
`admin_process_refund`, `flag_transaction_disputed`, `close_account`,
`accept_creator_agreement`) and the `payout_methods` write policies check
`auth.jwt() ->> 'impersonated_by' is null` and reject the action if it's set — a support
session can view but never move money or change payout details. `profiles` updates are
deliberately left unguarded (managers may edit profile fields on the user's behalf). See §1
of `docs/user-impersonation-implementation.md` for the full guarded-path list and the guard
idiom.
