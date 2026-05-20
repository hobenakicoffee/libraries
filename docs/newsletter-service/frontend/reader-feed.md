# Reader Feed

The reader feed is the public-facing post list. It is powered by the `get_reader_feed()` RPC and supports filtering, search, and cursor-based pagination.

## Basic Usage — First Page

```ts
const { data, error } = await supabase.rpc('get_reader_feed', {
	p_profile_id: 'some-id',
  p_filter: 'all',
  p_limit: 20,
})
```

Each row in `data` contains everything needed to render a post card, including author info and access state.

## Full Parameter Reference

| Parameter | Type | Default | Description |
|---|---|---|---|
| `p_filter` | `'all' \| 'liked' \| 'owned'` | `'all'` | Feed tab filter |
| `p_limit` | `integer` | `20` | Max rows per page |
| `p_cursor` | `timestamptz \| null` | `null` | Last `published_at` from previous page |
| `p_from` | `timestamptz \| null` | `null` | Only show posts published on or after |
| `p_to` | `timestamptz \| null` | `null` | Only show posts published on or before |
| `p_search` | `string \| null` | `null` | ILIKE search on title and subtitle |

## Response Shape

```ts
type FeedPost = {
  post_id: string
  profile_id: string
  author_display_name: string
  author_username: string
  author_avatar_url: string
  title: string
  slug: string
  subtitle: string | null
  cover_image_url: string | null
  excerpt: string | null
  is_members_only: boolean
  is_pay_per_post: boolean
  price: number | null
  tags: string[]
  reading_time_minutes: number | null
  view_count: number
  like_count: number
  published_at: string  // ISO 8601
  is_liked: boolean
  has_access: boolean
  access_badge: 'free' | 'members_only' | 'paid' | 'members_only_and_paid'
}
```

## Cursor-Based Pagination

The feed is sorted by `published_at DESC`. To load the next page, pass the `published_at` of the last item as `p_cursor`:

```ts
let cursor: string | null = null

async function loadNextPage() {
  const { data } = await supabase.rpc('get_reader_feed', {
  	p_profile_id: 'id-here',
    p_filter: 'all',
    p_limit: 20,
    p_cursor: cursor,
  })

  if (data && data.length > 0) {
    posts.push(...data)
    // Set cursor to the last post's published_at for the next call
    cursor = data[data.length - 1].published_at
  }
}
```

When `data.length < p_limit`, you've reached the last page.

## Feed Filters

The three filter tabs map directly to `p_filter`:

```ts
// All posts
supabase.rpc('get_reader_feed', { p_profile_id: 'id', p_filter: 'all' })

// Posts the current user has liked
supabase.rpc('get_reader_feed', { p_profile_id: 'id', p_filter: 'liked' })

// Posts the current user has purchased or received as gifts
supabase.rpc('get_reader_feed', { p_profile_id: 'id', p_filter: 'owned' })
```

> `'liked'` and `'owned'` silently return empty results if the user is not authenticated. Handle this case by prompting login instead of showing "no posts found".

## Search

Pass `p_search` to filter by title or subtitle:

```ts
const { data } = await supabase.rpc('get_reader_feed', {
  p_profile_id: 'id',
  p_filter: 'all',
  p_search: 'typescript tips',
})
```

The search is case-insensitive and uses `ILIKE '%…%'`. It is powered by trigram GIN indexes for good performance on most queries. You do not need to add `%` wildcards yourself — the RPC adds them internally.

> Search and cursor pagination are compatible. Always reset `cursor = null` when the search term changes.

## Date Range Filter

Useful for showing posts from a specific period (e.g. "This month"):

```ts
const { data } = await supabase.rpc('get_reader_feed', {
  p_profile_id: 'id',
  p_filter: 'all',
  p_from: '2026-04-01T00:00:00Z',
  p_to:   '2026-04-30T23:59:59Z',
})
```

## Rendering the Access Badge

```ts
function getAccessBadge(post: FeedPost) {
  switch (post.access_badge) {
    case 'free':
      return { label: 'Public', color: 'grey' }
    case 'members_only':
      return { label: 'Members Only', color: 'purple' }
    case 'paid':
      return { label: `Paid (৳${post.price})`, color: 'green' }
    case 'members_only_and_paid':
      return { label: 'Members Only', color: 'purple' }
  }
}
```

## Behind-the-Paywall Card

For `has_access = false`, render the `excerpt` instead of linking to the full post. Overlay a paywall CTA (e.g. "Buy for ৳NNN" or "Become a Member"):

```ts
if (!post.has_access) {
  // Show excerpt + paywall CTA, do not link to full content
}
```

## Complete Example (SvelteKit)

```svelte
<script lang="ts">
  import { supabase } from '$lib/supabase'

  let posts = []
  let cursor: string | null = null
  let filter: 'all' | 'liked' | 'owned' = 'all'
  let search = ''
  let loading = false
  let hasMore = true

  async function loadPosts(reset = false) {
    if (loading) return
    loading = true

    if (reset) {
      posts = []
      cursor = null
      hasMore = true
    }

    const { data } = await supabase.rpc('get_reader_feed', {
      p_profile_id: 'id',
      p_filter: filter,
      p_limit: 20,
      p_cursor: cursor,
      p_search: search || null,
    })

    if (data) {
      posts = [...posts, ...data]
      cursor = data.length > 0 ? data[data.length - 1].published_at : cursor
      hasMore = data.length === 20
    }

    loading = false
  }

  // Reset on filter or search change
  $: filter, search, loadPosts(true)
</script>

{#each posts as post}
  <PostCard {post} />
{/each}

{#if hasMore}
  <button on:click={() => loadPosts()}>Load more</button>
{/if}
```

---

**Next:** [Post Access & Paywalls](./post-access.md)
