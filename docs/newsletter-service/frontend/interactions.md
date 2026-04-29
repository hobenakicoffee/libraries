# Post Interactions — Likes, Views & Clicks

This page covers the three engagement actions a reader can take on a post: liking it, viewing it, and clicking the CTA. All three are fire-and-forget calls from the frontend perspective.

## Liking a Post

### Toggle Like

Call `toggle_newsletter_post_like()` when the user taps the heart button. It atomically inserts or deletes the like row and returns the new state:

```ts
const { data, error } = await supabase.rpc('toggle_newsletter_post_like', {
  p_post_id: postId,
})

const { liked, like_count } = data
```

| Field | Type | Description |
|---|---|---|
| `liked` | `boolean` | Whether the post is now liked (`true`) or unliked (`false`) |
| `like_count` | `integer` | The updated count on the post |

### Optimistic UI

For a responsive UI, update the local state immediately and roll back on error:

```ts
async function toggleLike(post) {
  // Optimistic update
  const wasLiked = post.is_liked
  post.is_liked = !wasLiked
  post.like_count += wasLiked ? -1 : 1

  const { data, error } = await supabase.rpc('toggle_newsletter_post_like', {
    p_post_id: post.post_id,
  })

  if (error) {
    // Roll back on failure
    post.is_liked = wasLiked
    post.like_count += wasLiked ? 1 : -1
    console.error('Like failed:', error.message)
    return
  }

  // Sync with server state (in case of race conditions)
  post.is_liked = data.liked
  post.like_count = data.like_count
}
```

### Require Authentication

`toggle_newsletter_post_like()` raises an exception if the user is not authenticated. Check auth status before calling, and show a login prompt if needed:

```ts
async function handleLikeClick(post) {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    showLoginModal()
    return
  }

  await toggleLike(post)
}
```

### Unlike with Confirmation

The schema comment notes that "unlike with confirmation is handled client-side before calling the RPC." This means if you want to show a confirmation dialog before unliking, do it in the UI — then call `toggle_newsletter_post_like()` only after confirmation:

```ts
async function handleLikeClick(post) {
  if (post.is_liked) {
    const confirmed = await showConfirmDialog('Remove like?')
    if (!confirmed) return
  }
  await toggleLike(post)
}
```

---

## Recording a View

Call `record_newsletter_post_view()` once when the post detail page loads. This increments the denormalised `view_count` on `newsletter_posts` and upserts today's row in `newsletter_post_analytics_daily`.

```ts
// On post detail page mount
await supabase.rpc('record_newsletter_post_view', {
  p_post_id: postId,
})
```

### When to Call

- Call it on **post detail page load**, not on feed card hover/preview.
- It is safe to call for unauthenticated users — no auth check is performed.
- Do not debounce or deduplicate client-side; the server does not deduplicate either, so each page load counts as one view.

> If you need to exclude author self-views from the count, add a client-side guard: `if (session?.user.id !== post.profile_id)`.

---

## Recording a Click

Call `record_newsletter_post_click()` when a reader clicks a conversion action — typically a "Buy Now" button or a "Become a Member" CTA on a paywalled post.

```ts
// When the reader clicks the purchase/subscribe CTA
await supabase.rpc('record_newsletter_post_click', {
  p_post_id: postId,
})
```

The click count powers the **conversion rate** metric in the Creator Studio Analytics dialog:

```
Conv. Rate = purchase_count / click_count × 100
```

### When to Call

- Call it on **CTA click**, not on page load.
- Call it **before** redirecting to the payment flow so the click is recorded even if the user abandons the payment.
- It is idempotent in effect — multiple clicks are counted separately, which is correct.

---

## Summary of Engagement Calls

| Action | RPC | When to Call | Auth Required |
|---|---|---|---|
| Like / Unlike | `toggle_newsletter_post_like` | User taps heart button | Yes |
| View | `record_newsletter_post_view` | Post detail page loads | No |
| Click | `record_newsletter_post_click` | User clicks purchase/subscribe CTA | No |

---

## Reading Like State Without Fetching the Full Feed

If you're on a post detail page and need to know whether the current user has liked the post (without going through `get_reader_feed`), query `newsletter_post_likes` directly:

```ts
const { data } = await supabase
  .from('newsletter_post_likes')
  .select('id')
  .eq('post_id', postId)
  .eq('profile_id', userId)
  .maybeSingle()

const isLiked = data !== null
```

---

**Next:** [Creator Studio](./creator-studio.md)
