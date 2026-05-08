# Roles & Permissions

## Permission Enum

All 28 permissions live in `public.manager_permission`. They are grouped by domain:

| Group | Permissions |
|---|---|
| **Managers** | `managers.create` `managers.view` `managers.update` `managers.delete` |
| **Content** | `content.moderate` `content.approve` `content.feature` `content.delete` |
| **Users** | `users.view_details` `users.suspend` `users.reactivate` `users.view_analytics` |
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
All 28 permissions. Can manage other manager accounts, approve/reject/delete any content, handle finances, and manage service requests.

### `content_manager`
Focuses on content quality. Can view, approve, update, and delete newsletter posts, shop categories, and shop products (including drafts). Can view user details and analytics. Can read support tickets and service request queues. Can toggle a user's `allow_gifting` and `allow_subscriptions` flags via `moderate_user`.

### `support_manager`
Handles user-facing issues. Can suspend and reactivate user pages, manage user services (view + update), view transactions for dispute context, and fully manage the support ticket queue.

### `finance_manager`
Restricted to financial operations. Can read all transactions, wallets, withdrawal requests, and payout methods. Approves and processes withdrawals via `process_withdrawal`. Can refund transactions. No content or user moderation access beyond viewing user details.

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
