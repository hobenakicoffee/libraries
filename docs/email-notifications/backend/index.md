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

## Related

- `notification_types` registry — defines available notification types
- `notification_preference_overrides` — per-user opt-in/opt-out
- `is_email_notification_enabled()` — checks if user has notifications enabled
- Edge function `send-notification-emails` (config referenced; actual implementation at function level)
