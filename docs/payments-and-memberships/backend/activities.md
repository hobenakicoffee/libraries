# Activities

The `activities` table is the unified notification and feed system. Every financial event (gift, subscription, withdrawal) results in activity rows that drive both the **public creator feed** and the **private supporter notifications**.

---

## Table Definition

```sql
create table public.activities (
  id                      uuid                    primary key default gen_random_uuid(),
  transaction_id          uuid                    references public.transactions(id) on delete cascade,
  reference_id            uuid                    not null,
  user_profile_id         uuid                    not null references public.profiles(id) on delete cascade,
  counterparty_profile_id uuid                    references public.profiles(id) on delete set null,
  role                    varchar(20)             not null check (role in ('creator', 'supporter', 'system')),
  service_type            varchar(20)             not null default 'gift',
  metadata                jsonb                   not null default '{}'::jsonb,
  visibility              public.visibility_enum  not null default 'public',
  is_dismissed            boolean                 not null default false,
  created_at              timestamptz             not null default now(),
  updated_at              timestamptz             not null default now()
);
```

### Column Reference

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` | Primary key |
| `transaction_id` | `uuid` | FK → `transactions.id`; null for system notifications (e.g. membership expiry) |
| `reference_id` | `uuid` | Logical group reference — same value as `transactions.reference_id` for payment activities |
| `user_profile_id` | `uuid` | Activity owner — who sees this in their feed |
| `counterparty_profile_id` | `uuid` | The other party; null for anonymous or system activities |
| `role` | `varchar(20)` | Perspective: `'creator'`, `'supporter'`, or `'system'` |
| `service_type` | `varchar(20)` | `'gift'`, `'newsletter'`, `'subscription'`, etc. |
| `metadata` | `jsonb` | Display data — amounts, messages, notification context |
| `visibility` | `visibility_enum` | `'public'` or `'private'` |
| `is_dismissed` | `boolean` | User-controlled dismiss for notifications |
| `created_at` | `timestamptz` | When the activity occurred |
| `updated_at` | `timestamptz` | Auto-updated by trigger |

---

## Activity Roles

Each payment generates **two** activity rows:

```mermaid
flowchart LR
    TXN[Payment Event]
    TXN --> SA["Activity\nuser = supporter\nrole = 'supporter'\nvisibility = 'private'"]
    TXN --> CA["Activity\nuser = creator\nrole = 'creator'\nvisibility = 'public'"]
```

| Role | Owner | Visibility | Purpose |
|---|---|---|---|
| `supporter` | The supporter | `private` | Private receipt / confirmation for the supporter |
| `creator` | The creator | `public` | Public entry on the creator's support feed |
| `system` | The member | `private` | System-generated notifications (e.g. membership expiry reminders) |

---

## Visibility

| `visibility` | Who can read it |
|---|---|
| `public` | Via the `get_creator_public_activities` RPC (accessible to anon + authenticated) |
| `private` | Only `user_profile_id` — the activity owner |

`anon` is **revoked from the `activities` table entirely** — there is no direct anon `SELECT` policy. Public activities reach anonymous visitors through the `get_creator_public_activities` security-definer RPC, which queries the table with elevated privileges and returns only `visibility = 'public'` rows for the requested creator.

---

## `metadata` Shapes

### Supporter activity (private)

```json
{
  "type": "gift",
  "amount": 500,
  "supporter_id": "uuid",
  "coffee_count": 3,
  "message": "Keep it up!"
}
```

### Creator activity (public)

```json
{
  "type": "gift",
  "amount": 475,
  "supporter_id": "uuid",
  "supporter_anonymous": false,
  "coffee_count": 3,
  "message": "Keep it up!"
}
```

Note: `amount` in the creator activity is the **net amount** (after platform fee). In the supporter activity it's the **gross amount**.

### Membership expiry notification (system)

```json
{
  "notification_type": "3_days",
  "plan_name": "Premium Monthly",
  "service_type": "newsletter",
  "period_end": "2026-05-03T22:00:00Z",
  "creator_name": "Rahim Uddin",
  "creator_username": "rahimuddin",
  "membership_id": "uuid"
}
```

### Shop: Category Approved

```json
{
  "activity_type": "category_approved",
  "service_type": "shop",
  "category_id": "uuid",
  "category_name": "Coffee Beans",
  "requester_name": "Rahim Uddin",
  "message": "Your category has been approved!"
}
```

### Shop: Category Rejected

```json
{
  "activity_type": "category_rejected",
  "service_type": "shop",
  "category_id": "uuid",
  "category_name": "Coffee Beans",
  "requester_name": "Rahim Uddin",
  "rejection_reason": "Category name violates naming guidelines",
  "message": "Your category submission was not approved."
}
```

### Shop: Product Approved

```json
{
  "activity_type": "product_approved",
  "service_type": "shop",
  "product_id": "uuid",
  "product_title": "Ethiopian Yirgacheffe",
  "price_at_purchase": 450,
  "requester_name": "Rahim Uddin",
  "message": "Your product has been published!"
}
```

### Shop: Product Rejected

```json
{
  "activity_type": "product_rejected",
  "service_type": "shop",
  "product_id": "uuid",
  "product_title": "Ethiopian Yirgacheffe",
  "price_at_purchase": 450,
  "requester_name": "Rahim Uddin",
  "rejection_reason": "Product images do not meet quality standards",
  "message": "Your product submission was not approved."
}
```

### Coffee Gifts: Post Gifted

```json
{
  "activity_type": "post_gifted",
  "service_type": "gift",
  "type": "gift",
  "amount": 500,
  "net_amount": 475,
  "platform_fee": 25,
  "supporter_id": "uuid",
  "supporter_name": "John Doe",
  "supporter_platform": "twitter",
  "supporter_anonymous": false,
  "coffee_count": 3,
  "post_id": "uuid",
  "post_slug": "my-blog-post",
  "post_title": "My Blog Post",
  "gift_message": "Great article!"
}
```

### Coffee Gifts: Post Gift Sent

```json
{
  "activity_type": "post_gift_sent",
  "service_type": "gift",
  "type": "gift",
  "amount": 500,
  "net_amount": 475,
  "platform_fee": 25,
  "supporter_id": "uuid",
  "supporter_name": "John Doe",
  "supporter_platform": "twitter",
  "supporter_anonymous": false,
  "coffee_count": 3,
  "buyer_name": "John Doe",
  "buyer_platform": "twitter",
  "post_id": "uuid",
  "post_slug": "my-blog-post",
  "post_title": "My Blog Post",
  "gift_message": "Great article!"
}
```

### Newsletter: Post Approved

```json
{
  "activity_type": "post_approved",
  "service_type": "newsletter",
  "post_id": "uuid",
  "post_slug": "weekly-update-42",
  "post_title": "Weekly Update #42",
  "requester_name": "Rahim Uddin",
  "message": "Your post has been published!"
}
```

### Newsletter: Post Rejected

```json
{
  "activity_type": "post_rejected",
  "service_type": "newsletter",
  "post_id": "uuid",
  "post_slug": "weekly-update-42",
  "post_title": "Weekly Update #42",
  "requester_name": "Rahim Uddin",
  "rejection_reason": "Content violates community guidelines",
  "message": "Your post was not approved for publication."
}
```

### Newsletter: Post Status Updated

Written by `update_newsletter_post_status` to the author's own feed
(`role: "system"`, `visibility: "private"`) on every self-service
draft↔review / archive transition.

```json
{
  "activity_type": "post_status_updated",
  "service_type": "newsletter",
  "post_id": "uuid",
  "post_slug": "weekly-update-42",
  "post_title": "Weekly Update #42",
  "old_status": "draft",
  "new_status": "review"
}
```

### Shop: Order Item Shipped

Written by `update_order_tracking` to the buyer's feed
(`role: "supporter"`, `visibility: "private"`).

```json
{
  "activity_type": "order_item_shipped",
  "service_type": "shop",
  "order_id": "uuid",
  "order_number": "SHOP-20260616-0001",
  "product_id": "uuid",
  "product_title": "Ceramic Mug",
  "carrier": "Pathao",
  "tracking_number": "PTH123456",
  "tracking_url": "https://pathao.com/track/PTH123456"
}
```

### Shop: Order Item Delivered

Written by `mark_order_item_delivered` to the buyer's feed
(`role: "supporter"`, `visibility: "private"`).

```json
{
  "activity_type": "order_item_delivered",
  "service_type": "shop",
  "order_id": "uuid",
  "order_number": "SHOP-20260616-0001",
  "product_id": "uuid",
  "product_title": "Ceramic Mug"
}
```

### Shop: Order Item Cancelled

Written by `cancel_cod_order_item` to the buyer's feed
(`role: "supporter"`, `visibility: "private"`).

```json
{
  "activity_type": "order_item_cancelled",
  "service_type": "shop",
  "order_id": "uuid",
  "order_number": "SHOP-20260616-0001",
  "product_id": "uuid",
  "product_title": "Ceramic Mug",
  "cancellation_reason": "Out of stock"
}
```

---

## Row Level Security

| Operation | Role | Policy |
|---|---|---|
| `SELECT` | `anon` | **Blocked** — `revoke all from anon` |
| `SELECT` | `authenticated` | `visibility = 'public'` OR `user_profile_id = auth.uid()` |
| `INSERT` | `authenticated` | **Blocked** (`with check (false)`) — backend only |
| `UPDATE` | `authenticated` | Only `is_dismissed` on own rows, and only to `true` |
| `DELETE` | `authenticated` | **Blocked** |

::: warning Immutable by design
Activities are never deleted or modified by clients. Once created, the only user action is dismissing a notification via `is_dismissed = true`. This preserves the audit trail.
:::

---

## Dismissing a Notification

A user can mark an activity as dismissed (read):

```sql
update public.activities
set is_dismissed = true
where id = $1
  and user_profile_id = auth.uid();
```

The `WITH CHECK` constraint on the update policy prevents setting `is_dismissed` back to `false` — a notification can only be dismissed, not un-dismissed.

---

## Email Notifications

Every insert into `activities` fires the `on_activity_insert_queue_email`
trigger (`queue_activity_email_notification()`), which maps the activity to a
`notification_types` key and — if email notifications are enabled for that
user/type — queues a row in `email_notification_queue` for async delivery.
This never blocks or affects the in-app activity row, which is always
inserted regardless. See
[Email Sending Pipeline](../../notifications/index.md#email-sending-pipeline-email_notificationssql)
for the full flow.

---

## Indexes

| Index | Columns | Purpose |
|---|---|---|
| `idx_activities_user_profile_id` | `user_profile_id` | Own feed queries |
| `idx_activities_visibility` | `visibility` | Public feed queries |
| `idx_activities_created_at` | `created_at DESC` | Timeline ordering |
| `idx_activities_user_service_created` | `(user_profile_id, service_type, created_at DESC)` | Filtered feed pagination |
| `idx_activities_user_dismissed_created` | `(user_profile_id, is_dismissed, created_at DESC)` | Unread notification count / list |
| `idx_activities_reference_id` | `reference_id` | Join to transactions |
| `idx_activities_transaction_id` | `transaction_id` | Cascade delete tracking |
| `idx_activities_counterparty_profile_id` | `counterparty_profile_id` | Reverse-lookup queries |

---

## RPC: `get_creator_public_activities`

Paginated public activity feed for a creator's profile page. Accessible by `anon`, `authenticated`, and `service_role` via `SECURITY DEFINER` — the underlying `activities` table is fully revoked from `anon`.

```sql
get_creator_public_activities(
  p_creator_profile_id  uuid,
  p_limit               int           default 10,
  p_cursor_created_at   timestamptz   default null,
  p_cursor_id           uuid          default null
)
returns table (
  id                       uuid,
  counterparty_profile_id  uuid,
  service_type             varchar,
  visibility               public.visibility_enum,
  metadata                 jsonb,
  created_at               timestamptz,
  cp_id                    uuid,
  cp_display_name          text,
  cp_avatar_url            text,
  cp_username              text
)
```

### Behaviour

- Returns only `visibility = 'public'` rows owned by `p_creator_profile_id`.
- Joins `profiles` on `counterparty_profile_id` — `cp_*` columns are `NULL` when the counterparty is anonymous or system-generated.
- Results are ordered `created_at DESC, id DESC`.
- Uses **keyset (cursor) pagination** for stable traversal — pass the `created_at` and `id` of the last row received to get the next page.

### Pagination

**First page** — omit cursor params (or pass `null`):

```typescript
const { data } = await supabase.rpc('get_creator_public_activities', {
  p_creator_profile_id: creatorId,
  p_limit: 10,
})
```

**Subsequent pages** — pass the last row's `created_at` and `id` as the cursor:

```typescript
const last = data.at(-1)

const { data: nextPage } = await supabase.rpc('get_creator_public_activities', {
  p_creator_profile_id: creatorId,
  p_limit: 10,
  p_cursor_created_at: last.created_at,
  p_cursor_id: last.id,
})
```

### Security

```sql
security definer
set search_path = public
grant execute on function get_creator_public_activities(uuid, int, timestamptz, uuid)
  to anon, authenticated, service_role;
```

Anon callers cannot query `activities` directly — this function is the only public entry point for the creator feed.

---

## Common Queries

### Unread notification count

```sql
select count(*)
from public.activities
where user_profile_id = auth.uid()
  and visibility = 'private'
  and is_dismissed = false;
```

### All notifications for a user (latest first)

```sql
select *
from public.activities
where user_profile_id = auth.uid()
  and visibility = 'private'
order by created_at desc
limit 20;
```
