# Feed Population

Feed items are created automatically — creators never interact with `feed_items` directly. Four sources populate the table.

## Newsletter Posts

**Trigger:** `on_newsletter_post_feed` (AFTER INSERT OR UPDATE on `newsletter_posts`)
**Function:** `handle_newsletter_post_feed()`

A feed item is created or updated when a post is **published and public**:

```sql
-- condition for creating/updating
NEW.status = 'published' AND NEW.visibility = 'public'

-- metadata populated from
{ title, excerpt (falls back to left(content, 200)), cover_image_url, is_members_only OR is_pay_per_post }
```

When a post transitions from published/public to any other state (draft, private), the corresponding feed item is **soft-hidden** (`visibility = 'private'`) — not deleted. Interaction history is preserved.

The upsert uses `ON CONFLICT (reference_id, content_type) WHERE reference_id IS NOT NULL DO UPDATE`, so re-publishing a post updates the existing feed item rather than creating a duplicate.

---

## Shop Products

**Trigger:** `on_shop_product_feed` (AFTER INSERT OR UPDATE on `shop_products`)
**Function:** `handle_shop_product_feed()`

A product emits a feed item when `is_active = true AND is_deleted = false`.

### 2-Hour Batching

To prevent bulk-listing creators from flooding the feed, consecutive product activations from the same creator within a 2-hour window are merged:

```
First product in window  →  creates shop_product feed item
Second product in window →  upgrades existing item to shop_batch,
                            wraps original metadata into items[0],
                            appends new product as items[1]
Third+ products          →  continues appending to shop_batch
```

Once an item is upgraded to `shop_batch`, its `reference_id` is set to `null` (a batch has no single source record).

When a product is deactivated (`is_active = false`) or deleted (`is_deleted = true`), the single-product `shop_product` feed item is soft-hidden. Batches are not affected — they become independent historical snapshots once formed.

---

## System Milestones

Milestones are auto-generated when a creator crosses a threshold in a tracked metric.

### Threshold Configuration

Thresholds live in `platform_settings` under the key `feed_milestones` (JSONB, super-admin managed):

```json
{
  "followers":    { "thresholds": [100, 500, 1000, 5000, 10000] },
  "subscribers":  { "thresholds": [10, 50, 100, 500] },
  "posts":        { "thresholds": [10, 50, 100] }
}
```

### `check_and_emit_milestone()`

This SECURITY DEFINER function is the single point of milestone creation:

1. Reads the threshold config for the given metric type
2. Finds the highest threshold the current count has crossed
3. Checks for an existing milestone feed item at that threshold (idempotent — never creates duplicates)
4. Inserts a `system_milestone` feed item with `rank_score = 1000` to surface it immediately

It is revoked from `public`, `anon`, and `authenticated` — only callable by other SECURITY DEFINER functions or service role.

### Milestone Triggers

| Trigger | Table | Metric | Value read from |
|---|---|---|---|
| `on_follow_milestone_check` | `follows` (AFTER INSERT) | `followers` | `profiles.follower_count` |
| `on_membership_milestone_check` | `profile_memberships` (AFTER INSERT OR UPDATE) | `subscribers` | COUNT of active memberships |

The follower count is read from `profiles.follower_count` (a denormalized column maintained by the existing `handle_follow` trigger) — not recounted.

The subscriber milestone only fires when `NEW.status = 'active'` to avoid triggering on cancellations or pauses.

### Adding New Milestones

To add a new threshold to an existing metric, update the `feed_milestones` value in `platform_settings` via the super-admin dashboard. No code change required.

To add a **new metric type** (e.g., sales count), add a trigger on the relevant table that calls `check_and_emit_milestone(creator_id, 'sales', current_count)` and add the metric key to the `feed_milestones` config.

---

## Manager Posts (Announcements)

**RPC:** `create_manager_feed_post()`

The only way to create a `system_announcement` feed item is through this RPC. It requires the `manager_role` JWT claim.

```typescript
// Only works for users with manager_role in their JWT
const { data: itemId } = await supabase.rpc('create_manager_feed_post', {
  p_title:     'New feature launched!',
  p_body:      'We just shipped the discovery feed.',
  p_image_url: 'https://cdn.example.com/banner.jpg',
  p_cta_label: 'Learn More',
  p_cta_url:   'https://hobenakicoffee.com/blog/feed',
  p_is_pinned: true,
})
```

Announcements have `creator_profile_id = null`. Pinned announcements bypass ranking and always appear first in the feed.

---

## Canonical URLs

Each feed item's canonical URL is constructed on the frontend:

```
/@{username}/{service-type}/feed/{feed_item_id}
```

Examples:
- `/@dhaka-roasters/newsletter/feed/123`
- `/@dhaka-roasters/shop/feed/456`
- `/feed/{id}` — for `system_announcement` (no creator username)

The `metadata` JSONB should carry `og:title`, `og:description`, and `og:image` values for SSR Open Graph injection.
