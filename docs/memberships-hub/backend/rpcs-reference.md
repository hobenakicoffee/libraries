# RPC Reference

Quick reference for all RPCs in the Memberships Hub. All RPCs require an authenticated session unless noted.

## Feed

### `get_my_feed`

Returns the current user's pre-computed ranked feed. See [Affinity & Ranking](./affinity-ranking.md#get_my_feed-rpc) for full details.

```typescript
const { data, error } = await supabase.rpc('get_my_feed', {
  p_limit: 20,           // optional, default 20, max 50
  p_cursor_score: null,  // optional, for pagination
  p_cursor_id: null      // optional, for pagination
})
```

### `record_feed_impression`

Fire-and-forget. Call when a feed card enters the viewport.

```typescript
supabase.rpc('record_feed_impression', { p_feed_item_id: id })
// no await needed
```

### `create_feed_item`

**Internal only.** Called by service publish triggers, not from the frontend.

### `delete_feed_item`

Creator removes their own feed item and all related data.

```typescript
const { error } = await supabase.rpc('delete_feed_item', {
  p_feed_item_id: id
})
```

---

## Interactions

### `toggle_feed_like`

Toggles like state. Returns `true` if now liked, `false` if unliked.

```typescript
const { data: isLiked, error } = await supabase.rpc('toggle_feed_like', {
  p_feed_item_id: id
})
```

### `add_feed_comment`

Adds a root comment or one-level reply.

```typescript
// Root comment
const { data: commentId, error } = await supabase.rpc('add_feed_comment', {
  p_feed_item_id: id,
  p_body: 'Great post!'
})

// Reply
const { data: replyId, error } = await supabase.rpc('add_feed_comment', {
  p_feed_item_id: id,
  p_body: 'Agreed!',
  p_parent_comment_id: parentCommentId
})
```

### `hide_feed_comment`

**Creator only.** Soft-hides a comment on their own feed item.

```typescript
const { error } = await supabase.rpc('hide_feed_comment', {
  p_comment_id: id
})
```

### `delete_feed_comment`

**Author only.** Hard-deletes own comment. Cascade removes replies.

```typescript
const { error } = await supabase.rpc('delete_feed_comment', {
  p_comment_id: id
})
```

---

## Boost Campaigns

### `launch_boost_campaign`

Launches a boost. Deducts day 1 from wallet immediately.

```typescript
const { data: campaignId, error } = await supabase.rpc('launch_boost_campaign', {
  p_feed_item_id: id,
  p_total_days: 7
})
```

### `pause_boost_campaign`

Manually pauses an active campaign.

```typescript
const { error } = await supabase.rpc('pause_boost_campaign', {
  p_campaign_id: id
})
```

### `resume_boost_campaign`

Resumes a paused campaign. Re-validates wallet balance.

```typescript
const { error } = await supabase.rpc('resume_boost_campaign', {
  p_campaign_id: id
})
```

---

## Page Data RPCs

### `get_my_memberships_widget`

Returns current user's active memberships for the sidebar widget.

```typescript
const { data, error } = await supabase.rpc('get_my_memberships_widget')
```

**Returns:**

```typescript
interface MembershipWidgetItem {
  membership_id: string
  plan_id: string
  plan_name: string
  service_type: string
  billing_cycle: 'monthly' | 'annual' | 'lifetime'
  price_at_purchase: number
  status: string
  period_end: string | null
  auto_renew: boolean
  creator_profile_id: string
  creator_username: string
  creator_display_name: string
  creator_avatar_url: string | null
  total_spend: number   // total BDT paid to this creator via memberships
}[]
```

### `get_recommended_creators`

Returns creators the user doesn't follow yet, ranked by affinity then popularity.

```typescript
const { data, error } = await supabase.rpc('get_recommended_creators', {
  p_limit: 10  // optional, default 10, max 50
})
```

**Returns:**

```typescript
interface RecommendedCreator {
  creator_profile_id: string
  creator_username: string
  creator_display_name: string
  creator_avatar_url: string | null
  follower_count: number
  affinity_score: number
  recommendation_reason: 'membership' | 'purchased' | 'interactions' | 'popular'
}[]
```

`recommendation_reason` can be used to show a contextual hint in the UI (e.g. "Because you're a member", "Because you purchased from them").

### `get_my_following`

Paginated list of profiles the current user follows.

```typescript
const { data, error } = await supabase.rpc('get_my_following', {
  p_limit: 20,          // optional, default 20, max 100
  p_cursor_id: null     // optional, bigint — follow.id of last item seen
})
```

**Returns:**

```typescript
interface FollowingItem {
  follow_id: number
  creator_profile_id: string
  creator_username: string
  creator_display_name: string
  creator_avatar_url: string | null
  followed_at: string
}[]
```

### `get_my_followers`

Paginated list of profiles following the current user.

```typescript
const { data, error } = await supabase.rpc('get_my_followers', {
  p_limit: 20,
  p_cursor_id: null
})
```

**Returns:**

```typescript
interface FollowerItem {
  follow_id: number
  follower_profile_id: string
  follower_username: string
  follower_display_name: string
  follower_avatar_url: string | null
  followed_at: string
}[]
```

### `get_creator_membership_stats`

**Creator only.** Returns all membership KPIs and engagement stats for the creator tab dashboard. Single call, returns a `jsonb` object.

```typescript
const { data, error } = await supabase.rpc('get_creator_membership_stats')
```

**Returns:**

```typescript
interface CreatorMembershipStats {
  // Membership KPIs
  active_members: number
  total_revenue: number         // BDT, all-time subscription transactions
  revenue_this_month: number
  churn_this_month: number      // cancelled + expired this month
  plan_breakdown: {
    plan_id: string
    plan_name: string
    billing_cycle: string
    price: number
    active_members: number
    total_revenue: number
  }[]

  // Boost stats
  active_boosts: number
  total_boost_spend: number     // all-time boost deductions

  // Feed engagement (all content types)
  total_impressions: number
  total_likes: number
  total_comments: number
  top_feed_item: {
    feed_item_id: string
    content_type: string
    metadata: Record<string, unknown>
    engagement_score: number
    like_count: number
    comment_count: number
    impression_count: number
    created_at: string
  } | null
}
```

> **Note:** All financial stats (`total_revenue`, `revenue_this_month`, `churn_this_month`, `plan_breakdown`) are scoped to **membership/subscription transactions only**. Boost spend is tracked separately. Engagement stats cover all feed item types.

---

## Reading Comments

Comments are read directly via Supabase's table API (not an RPC), since RLS allows authenticated reads of non-hidden comments:

```typescript
// Root comments for a feed item, ordered by recency
const { data: comments } = await supabase
  .from('feed_item_comments')
  .select(`
    id, body, created_at,
    user_profile_id,
    profiles!feed_item_comments_user_profile_id_fkey (
      username, display_name, avatar_url
    )
  `)
  .eq('feed_item_id', feedItemId)
  .is('parent_comment_id', null)
  .eq('is_hidden', false)
  .order('created_at', { ascending: false })
  .limit(20)

// Replies for a root comment
const { data: replies } = await supabase
  .from('feed_item_comments')
  .select(`
    id, body, created_at,
    user_profile_id,
    profiles!feed_item_comments_user_profile_id_fkey (
      username, display_name, avatar_url
    )
  `)
  .eq('parent_comment_id', rootCommentId)
  .eq('is_hidden', false)
  .order('created_at', { ascending: true })
```
