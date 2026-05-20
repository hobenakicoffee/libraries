# RPC: Aside Panels

Three authenticated-only RPCs populate the sidebar panels shown to logged-in users. All three raise `P0001` for unauthenticated callers and are revoked from `anon`.

---

## `get_recommended_creators`

Creators the current user doesn't follow yet, ranked by a composite popularity score.

```sql
get_recommended_creators(p_limit int default 5)
returns table (
  profile_id     uuid,
  username       text,
  display_name   text,
  avatar_url     text,
  follower_count bigint,
  boost_tier     smallint,
  recent_posts   bigint
)
```

### Ranking

```
score = (follower_count × 0.4)
      + (posts_in_last_30_days × 0.3)
      + (boost_tier × 10 × 0.3)
```

### Filters

- Excludes the current user's own profile
- Excludes creators the current user already follows
- Only includes profiles with at least one enabled `user_service` (i.e., active creators)

### Example

```typescript
const { data: creators } = await supabase.rpc('get_recommended_creators', {
  p_limit: 5,
})
```

---

## `get_recommended_items`

Public feed items the current user hasn't liked or bookmarked — fresh content they haven't seen yet.

```sql
get_recommended_items(p_limit int default 5)
returns table (
  id                   bigint,
  creator_profile_id   uuid,
  content_type         varchar,
  reference_id         uuid,
  metadata             jsonb,
  rank_score           numeric,
  boost_tier           smallint,
  interaction_counts   jsonb,
  created_at           timestamptz,
  creator_username     text,
  creator_display_name text,
  creator_avatar_url   text
)
```

Items are sorted by `rank_score DESC, created_at DESC`. This is a "fresh discoveries" panel — it excludes content the user has already engaged with.

### Example

```typescript
const { data: items } = await supabase.rpc('get_recommended_items', {
  p_limit: 5,
})
```

---

## `get_my_active_memberships`

The current user's active paid memberships, joined with plan and creator details.

```sql
get_my_active_memberships()
returns table (
  membership_id        uuid,
  service_type         varchar,
  plan_name            varchar,
  plan_price           numeric,
  billing_cycle        membership_billing_cycle_enum,
  status               membership_status_enum,
  period_end           timestamptz,
  creator_profile_id   uuid,
  creator_username     text,
  creator_display_name text,
  creator_avatar_url   text
)
```

Returns only `status = 'active'` memberships, ordered by `created_at DESC`.

### Example

```typescript
const { data: memberships } = await supabase.rpc('get_my_active_memberships')

// memberships[0].plan_name      → "Newsletter Pro"
// memberships[0].billing_cycle  → "monthly"
// memberships[0].period_end     → "2026-06-20T00:00:00Z"
// memberships[0].creator_username → "dhaka-roasters"
```

---

## Security

All three RPCs:
- `SECURITY DEFINER`, `SET search_path = ''`
- `revoke execute from public, anon`
- `grant execute to authenticated`
- Raise `P0001` if `auth.uid()` is `null`
