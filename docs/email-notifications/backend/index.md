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

## Direct-enqueue path — emailing recipients with no account

The flow above (activity-triggered) is entirely profile-bound: it requires a
`user_profile_id` and goes through `is_email_notification_enabled()`
preference checks derived from an `activities` row. There is no path there
for emailing an address that isn't a platform user — e.g. a shop gift
recipient.

`email_notification_queue` supports a second, direct-enqueue path in the same
table for exactly that case (previously a separate `external_email_queue`
table; the two were merged into one outbox). Any service can enqueue into it
(not just shop) — `service_type` namespaces `reference_id` (not a DB FK;
polymorphic across whatever services use it), and `notification_type_key`/
`template_data` reuse the same `notification_types` template registry, but
with the placeholder values supplied directly by the enqueuing caller instead
of being derived from an activity row. A check constraint enforces that a row
is either activity-triggered (`activity_id` + `user_profile_id` set, the rest
null) or direct-enqueue (`service_type` + `reference_id` + `recipient_email`
set, `activity_id`/`user_profile_id` null) — never a mix.

| Column | Type | Description |
|---|---|---|
| `id` | bigint PK | Auto-incrementing ID |
| `activity_id` / `user_profile_id` | uuid | Set on the activity-triggered path, null on direct-enqueue |
| `service_type` | text | Set on the direct-enqueue path, e.g. `'shop_gift'` |
| `reference_id` | uuid | The originating row's id, e.g. `shop_orders.id` |
| `recipient_email` | varchar | Destination address (direct-enqueue path) |
| `recipient_name` | varchar | Optional display name (direct-enqueue path) |
| `notification_type_key` | text | FK to `notification_types.key` |
| `template_data` | jsonb | Direct-enqueue path only — exact placeholder values for the template, no activity/profile lookup. Stays `{}` on the activity-triggered path |
| `status` | text | `pending` / `processing` / `sent` / `failed` |
| `attempts` | int | Retry count |
| `last_error` | text | Failure reason if any |
| `created_at` / `sent_at` | timestamptz | |

Both paths are drained by the same `dispatch_pending_email_notifications()`
and posted to the same `send-notification-emails` edge function, which
branches on whether `user_profile_id` is set: the activity-triggered branch
does the profile/activity join and attaches an unsubscribe link; the
direct-enqueue branch renders `template_data` straight through
`renderTemplate()`/`renderLayout()` with no join (there's nothing to join
to) and points the footer link at the general contact page instead.
`cleanup_old_email_notification_queue()` purges `sent` rows of either kind
older than 6 months.

Current direct-enqueue producer: shop gift checkout and guest order-status
emails. See
[`initiate_shop_checkout`](../../shop-service/backend/rpc-checkout#gift-checkout)
— `service_type = 'shop_gift'`, template `shop.gift_received`. COD gift orders
enqueue immediately at checkout; online gift orders enqueue from
`handle_shop_payment_success` once payment is confirmed (and only then are
digital download links known).

## Related

- `notification_types` registry — defines available notification types, including `shop.gift_received`
- `notification_preference_overrides` — per-user opt-in/opt-out (applies to the activity-triggered path only, not direct-enqueue rows)
- `is_email_notification_enabled()` — checks if user has notifications enabled
- Edge function `send-notification-emails` — handles both the activity-triggered and direct-enqueue paths
