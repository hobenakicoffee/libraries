---
outline: deep
---

# Marketing — Social Features

## Follow / Unfollow

- Actions: `follow.checkStatus`, `follow.toggle`
- Optimistic UI with rollback on failure
- Follow button on creator profile pages
- RPCs: `is_following(profile_id, follower_id)`, `toggle_follow(profile_id, follower_id)`

## Activity Feeds

- Public supporter activities on creator profile pages
- Action: `activities.getWithPagination` (cursor-based)
- Action: `activities.getCount` for badge display
- RPC: `get_creator_public_activities`

## Post Likes

- Action: `newsletterPost.toggleLike`
- Optimistic UI — heart animates immediately, rollback on error
- Like state persists across page visits
- Animated like button component

## Comments

- Comment section on newsletter posts
- One-level reply supported
- Soft-delete pattern for comment removal
- Loaded lazily from `feed_item_comments` table

## Social Sharing

- Share buttons on blog posts (Facebook, X, LinkedIn, Instagram)
- Platform social links on creator profile
- Open Graph + Twitter Card meta tags on every page
- Canonical URLs

## RSS Feeds

- Per-creator RSS at `/@[handle]/posts/rss.xml`
- Auto-discovery `<link>` tag in page `<head>`
- Full-text content in feed items
