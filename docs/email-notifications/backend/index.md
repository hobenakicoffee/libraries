# Email Notifications Queue — Backend Reference

## `email_notifications` table

Queue for outbound emails.

| Column | Type | Description |
|---|---|---|
| `id` | bigint PK | Auto-incrementing ID |
| `user_id` | uuid | Target user |
| `notification_type_key` | varchar | References `notification_types` registry |
| `to_email` | varchar | Recipient email address |
| `subject` | text | Email subject line |
| `body_html` | text | Rendered HTML body |
| `status` | enum | `pending`, `sent`, `failed` |
| `priority` | integer | Queue priority |
| `created_at` | timestamptz | When enqueued |
| `sent_at` | timestamptz | When dispatched |
| `error_message` | text | Failure reason if any |
| `retry_count` | integer | Number of retry attempts |

## RPCs

| RPC | Schedule | Description |
|---|---|---|
| `dispatch_pending_email_notifications()` | Every 5 minutes via cron | Sends queued emails |
| `cleanup_old_email_notification_queue()` | Daily at 21:00 | Purges old notification records |

## Flow

1. Services insert into `email_notifications`
2. Cron triggers `dispatch_pending_email_notifications()`
3. Emails sent via Resend SMTP
4. Status updated to `sent` or `failed`

## Template placeholders

Placeholders are built per notification type by `buildPlaceholders()` in
`supabase/functions/_shared/email-templates/placeholders.ts`. It receives only
the source **activity's `metadata` jsonb** — `activities.reference_id` and
`activities.transaction_id` are not selected and are therefore unavailable to a
template unless copied into that jsonb by the writing RPC. `buildPlaceholders()`
also takes both `appBaseUrl` (the app domain) and `marketingBaseUrl` (the
marketing site domain, which hosts the invoice/receipt page below) — the
call site passes `APP_URL` and `MARKETING_URL` respectively.

### Invoice/receipt deep links

Three notification types deep-link to `${marketingBaseUrl}/invoices/<transaction_id>`
— a cookie-authenticated page on the marketing site (`src/pages/invoices/[transactionId]/`)
that shows a payment summary with Download Invoice/Receipt buttons. A plain
`<a href>` to it works from an email because it relies on the browser's
existing session cookie, not a Bearer token — unlike
`generate-transaction-document` itself, which requires an `Authorization`
header and therefore can never be linked to directly from an email.

#### `platform_subscription.activated`

| Placeholder | Source |
|---|---|
| `recipient_name` | recipient profile |
| `plan_name` | `metadata.plan_name` |
| `period_start` / `period_end` | `metadata.period_start` / `period_end` |
| `cta_url` | `${marketingBaseUrl}/invoices/<metadata.transaction_id>`, falling back to `${appBaseUrl}/settings/billing` if `transaction_id` is absent (pre-invoice-numbering rows) |

#### `gift.sent` (payer confirmation)

Fires for the **debit** (supporter) side of a coffee gift — i.e. the person
who paid, not `gift.received` (the creator who was paid).

| Placeholder | Source |
|---|---|
| `recipient_name` | recipient profile |
| `creator_name` | counterparty (creator) profile |
| `coffee_count` | `metadata.coffee_count`, default 1 |
| `amount` | `metadata.amount` |
| `cta_url` | `${marketingBaseUrl}/invoices/<metadata.transaction_id>`, falling back to `${appBaseUrl}/activities` if `transaction_id` is absent |

Anonymous (guest) gifts never reach this path at all: `handle_successful_payment()`
only writes a debit transaction/activity row when the supporter is
authenticated, so there is nothing to queue an email from and no address to
send it to.

#### `membership.subscribed` (payer confirmation)

Fires for the **debit** (supporter) side of a membership (newsletter plan)
purchase — the payer, not `membership.new_member` (the creator being
subscribed to).

| Placeholder | Source |
|---|---|
| `recipient_name` | recipient profile |
| `creator_name` | counterparty (creator) profile |
| `plan_name` | `metadata.plan_name` |
| `amount` | `metadata.price_at_purchase` (falls back to `metadata.amount`) |
| `cta_url` | `${marketingBaseUrl}/invoices/<metadata.transaction_id>`, falling back to `${appBaseUrl}/@<metadata.creator_username>` if `transaction_id` is absent |

`resolve_activity_notification_key()` distinguishes a membership purchase from
a one-time newsletter post purchase (both use `service_type='newsletter'`) via
`metadata.plan_id` — only membership purchases carry it.

`membership.new_member` (the pre-existing creator-side type) previously had
**no resolver branch at all** and therefore never fired; this was fixed
alongside the two new types above.

> The email body HTML itself lives in the admin-editable `notification_types`
> table, not in the repo. Wording changes to these templates are a content-ops
> change, not a code change.

## Related

- `notification_types` registry — defines available notification types
- `notification_preference_overrides` — per-user opt-in/opt-out
- `is_email_notification_enabled()` — checks if user has notifications enabled
- Edge function `send-notification-emails` (config referenced; actual implementation at function level)
