---
outline: deep
---

# Marketing — Creator Pages

All creator pages are under the `@[handle]` dynamic route in `src/pages/@[handle]/`.

## Profile Page (`/@[handle]`)

Server-rendered via `get-profile-data-by-username.service.ts` (service-role).

Sections:
- **Profile Header**: avatar, banner, display_name, username, bio, verification badge
- **Activities**: public supporter activities via `activities.getWithPagination`
- **Gift Widget**: coffee gifting amount selection + send form
- **Shop Embed**: featured products grid from `shop.getFeaturedProducts`
- **Newsletter Embed**: recent post list from `newsletter.getWithPagination`
- **Follow Button**: `follow.checkStatus` + `follow.toggle` actions (optimistic UI)

## Posts List (`/@[handle]/posts`)

- Fetched via `newsletter.getWithPagination` action
- RSS feed at `/@[handle]/posts/rss.xml`
- Premium call-to-action for members-only content
- Member-only badge indicators

## Single Post (`/@[handle]/posts/[slug]`)

- Fetched via `newsletterPost.getBySlug` action
- Markdown rendering with Shiki code highlighting
- Paywall gate via `newsletterPost.checkAccess`
- Interactions: `toggleLike` (optimistic), comment section, share buttons
- View tracking: beacon POST to `/api/record-view` (cookie-deduped)
- Reading progress bar via `scroll-progress.tsx`

### Post Access

`checkAccess` returns: `owner`, `free`, `membership`, `purchase`, `gift`, `none`, `not_found`

Paywall renders based on access level: members-only, pay-per-post, or both.

### Gifting

- `gift_newsletter_post()` RPC
- Unredeemed gifts listing
- Redemption flow

## Shop Page (`/@[handle]/shop`)

- Product grid with category tabs
- Shop hero from `shop_settings`
- Product cards with image, title, price, quick action

## Product Detail (`/@[handle]/shop/products/[slug]`)

- Gallery/images
- Description (Markdown rendered)
- CTA button (add to cart / purchase)
- Reviews section
- Share button
- Flag as inappropriate
