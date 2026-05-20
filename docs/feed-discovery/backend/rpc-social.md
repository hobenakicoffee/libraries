# RPC: Social Interactions

All social interaction RPCs require authentication. They return immediately with the updated state.

---

## `toggle_feed_item_like`

Like or unlike a feed item.

```sql
toggle_feed_item_like(p_feed_item_id bigint)
returns jsonb  -- { liked: bool, total_likes: int }
```

```typescript
const { data } = await supabase.rpc('toggle_feed_item_like', {
  p_feed_item_id: 42,
})
// { liked: true, total_likes: 15 }
```

Call again to unlike. Returns the new state and the updated total. Updates `interaction_counts.likes` on the feed item via trigger.

---

## `toggle_feed_item_bookmark`

Save or unsave a feed item for later.

```sql
toggle_feed_item_bookmark(p_feed_item_id bigint)
returns jsonb  -- { bookmarked: bool }
```

```typescript
const { data } = await supabase.rpc('toggle_feed_item_bookmark', {
  p_feed_item_id: 42,
})
// { bookmarked: true }
```

Bookmarks are private — only visible to the bookmarking user via `get_recommended_items` filtering and the user's own bookmark list.

---

## `add_feed_comment`

Add a comment or a reply to a comment.

```sql
add_feed_comment(
  p_feed_item_id      bigint,
  p_body              text,
  p_parent_comment_id bigint default null
)
returns public.feed_item_comments
```

```typescript
// Root comment
const { data: comment } = await supabase.rpc('add_feed_comment', {
  p_feed_item_id: 42,
  p_body: 'Love this blend!',
})

// Reply (one level deep only)
const { data: reply } = await supabase.rpc('add_feed_comment', {
  p_feed_item_id: 42,
  p_body: 'Agreed!',
  p_parent_comment_id: comment.id,
})
```

**One-level depth only.** Attempting to reply to a reply raises `P0001: Cannot reply to a reply`.

Returns the full `feed_item_comments` row.

---

## `delete_feed_comment`

Soft-delete a comment. The row is kept; `is_deleted` is set to `true` and `body` is nulled.

```sql
delete_feed_comment(p_comment_id bigint)
returns void
```

```typescript
await supabase.rpc('delete_feed_comment', { p_comment_id: 99 })
```

- Comment **owner** can delete their own comments.
- **Managers** (any `manager_role` JWT claim) can delete any comment.
- Others receive `42501: Not authorised`.

Replies to a soft-deleted comment are not automatically deleted — they remain visible but their parent will render as "[deleted]".

---

## `record_feed_item_share`

Record a share event. Call this when the user copies the link or uses a native share sheet.

```sql
record_feed_item_share(p_feed_item_id bigint)
returns void
```

```typescript
await supabase.rpc('record_feed_item_share', { p_feed_item_id: 42 })
```

Increments `interaction_counts.shares`. There is no un-share — each call records a new event.

---

## Error Codes

| Code | Meaning |
|---|---|
| `P0001` | Not authenticated, empty body, or depth violation |
| `P0002` | Comment not found |
| `42501` | Not authorised (wrong owner, non-manager) |

---

## Security

All five RPCs:
- `SECURITY DEFINER`, `SET search_path = ''`
- Raise `P0001` if `auth.uid()` is `null`
- Granted to `authenticated` only
