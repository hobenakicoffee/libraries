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
template unless copied into that jsonb by the writing RPC.

### `platform_subscription.activated`

| Placeholder | Source |
|---|---|
| `recipient_name` | recipient profile |
| `plan_name` | `metadata.plan_name` |
| `period_start` / `period_end` | `metadata.period_start` / `period_end` |
| `cta_url` | `/settings/billing?transaction=<metadata.transaction_id>` |

`cta_url` deep-links to the paid row so the billing page can highlight it and
offer the invoice PDF download. It cannot point at the
`generate-transaction-document` endpoint directly, because an email link
carries no `Authorization` header. Activities written before invoice numbering
have no `transaction_id`, and fall back to a plain `/settings/billing` link.

> The email body HTML itself lives in the admin-editable `notification_types`
> table, not in the repo. Surfacing an "Invoice" button using `{{cta_url}}` is a
> content-ops change, not a code change.

## Related

- `notification_types` registry — defines available notification types
- `notification_preference_overrides` — per-user opt-in/opt-out
- `is_email_notification_enabled()` — checks if user has notifications enabled
- Edge function `send-notification-emails` (config referenced; actual implementation at function level)
