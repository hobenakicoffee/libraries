---
title: Product Features
description: All four monetization products, fee structures, and confirmed capabilities
outline: deep
---

# Product Features — Hobe Naki Coffee

**TL;DR:** The platform has four creator monetization products — Coffee Gifts, Shop, Newsletter, and Memberships — plus a shared social feed. All claims in this document marked ✅ are confirmed directly from the database schema or code. Claims marked ⚠️ require product team verification before marketing use.

---

## Feature legend

- ✅ **Confirmed** — verified in codebase/schema; safe to use in marketing
- ⚠️ **Unconfirmed** — schema exists but service layer unverified, or product team confirmation needed
- 🔜 **Coming soon** — schema ready, not yet wired in the application
- ❌ **Not available** — explicitly out of scope or not built

---

## 1. Coffee Gifts

**What it is:** A supporter visits a creator's profile and sends a monetary "coffee" tip — 1 to 100 coffees in a single transaction — with an optional personal message. It's the most emotionally direct product on the platform: a small financial thank-you attached to words.

### How it works (confirmed from `coffee_gifts` schema and `perform_coffee_gift()` RPC)

A coffee gift is a single transaction. The supporter picks a number between 1 and 100, optionally writes a message (up to 500 characters), and pays. The money lands in the creator's pending earnings instantly — there is no pending/approval state on the gift row itself; once the row exists, payment succeeded.

Supporters can be anonymous (no account required) or signed in. Anonymous supporters are tracked by an identity hash for repeat-gifting analytics, but are never identified publicly without consent.

### Key capabilities

| Capability | Status | Notes |
|---|---|---|
| 1–100 coffees per transaction | ✅ | Enforced at DB level (`coffee_count` check constraint 1–100) |
| Optional 500-char message | ✅ | Emotional core — "say thanks with words" |
| Anonymous supporter gifting | ✅ | `supporter_profile_id` nullable; no account needed |
| Signed-in supporter gifting | ✅ | Full profile attached to gift |
| Instant earnings credit | ✅ | No pending state — gift row creation = payment success |
| 0% fee with platform subscription | ✅ | `get_creator_effective_fee_rate()` returns 0% for subscribers |
| Default fee (no subscription) | ✅ | 5% |
| Creator gift stats (earnings, coffees, supporters) | ✅ | `get_creator_coffee_gifts_stats()` with % change over date ranges |
| Supporter gift stats (total spent, creators supported) | ✅ | `get_supporter_coffee_gifts_stats()` |
| Recurring / monthly coffee gifting | 🔜 | `is_monthly` column exists in schema, billing schedule not yet wired |

### What NOT to advertise

- ❌ "Monthly recurring coffee gifts" — schema is ready but not live in the product
- ❌ Gift cards or coffee credits
- ❌ Group gifting
- ❌ Scheduled or delayed gifts

---

## 2. Mini Shop

**What it is:** A full e-commerce storefront embedded in a creator's profile. Creators can sell digital products (ebooks, templates, presets, Figma files) and physical goods (merch, prints, handmade items) from the same page, with no separate Shopify or Gumroad account needed.

### How it works (confirmed from `shop_service.sql` schema)

Each creator gets one shop at `/@handle/shop` and a shop settings page in their dashboard. Digital products generate secure, expiring download tokens — the actual file URL is never exposed to the buyer. Physical products use configurable shipping rates (Dhaka vs. outside-Dhaka) and support Cash on Delivery as a payment method alongside online payment.

### Key capabilities

| Capability | Status | Notes |
|---|---|---|
| Digital products with secure download | ✅ | Expiring token system; file path never sent to client |
| Physical products with shipping config | ✅ | Per-shop and per-product shipping fees |
| Cash on Delivery (COD) | ✅ | `payment_method` enum includes `'cod'` as a first-class option |
| Product variants (size, color, etc.) | ✅ | Up to 3 option axes; each variant has its own price, stock, SKU, image |
| Inventory / stock tracking | ✅ | `stock_count` per product and per variant; `NULL` = unlimited |
| Order lifecycle tracking | ✅ | pending → paid → processing → shipped → delivered (physical); fulfilled (digital) |
| Ratings and reviews | ✅ | `rating_count` and `rating_avg` on products — real aggregates |
| Shop categories | ✅ | Creator-defined categories with slugs and sort order |
| SEO per shop | ✅ | `seo_title`, `seo_description`, custom meta tags per shop |
| 0% fee with platform subscription (digital) | ✅ | |
| 0% fee with platform subscription (physical) | ✅ | |
| Default fee — digital | ✅ | 10% |
| Default fee — physical | ✅ | 5% |
| AI-assisted product listing | ⚠️ | Schema/landing teaser references it; service layer "in progress" per internal docs |
| Multi-vendor marketplace (/explore) | 🔜 | Planned; footer links to `/explore` marked "coming soon" |

### Current development status

The shop frontend UI is built and visible on creator profiles, but currently displays placeholder/mock product data. The real Supabase-backed services and purchase/checkout flow are in active development on a feature branch (`feature/shop-service`) and have not yet merged to the main branch. **Do not run campaigns driving traffic specifically to the shop checkout flow until this is confirmed shipped.**

### What NOT to advertise

- ❌ Shop checkout as a live, usable feature until the feature branch ships
- ❌ CSV bulk import
- ❌ Third-party carrier API integration (shipping fields exist, live carrier API unconfirmed)
- ❌ Multi-vendor marketplace browsing (planned, not live)

---

## 3. Newsletter

**What it is:** A content publishing system with flexible per-post access control. Creators write and publish posts; readers can access them for free, via a membership, or by purchasing individual posts. It is an in-app content reading feed with paywall capabilities — confirm with the product team whether posts are also delivered to subscribers' email inboxes before using "email newsletter" in copy.

### How it works (confirmed from `newsletter_service.sql` schema)

Creators write posts in a dashboard editor that auto-saves drafts and maintains a 20-version history (including AI-polish versions). Each post independently sets its access level. Once published, posts appear on the creator's profile and in the platform feed for followers.

### Access model (the key differentiator)

The newsletter has a real 2×2 access matrix — not a single "free or paid" toggle:

| `is_members_only` | `is_pay_per_post` | Who can read |
|---|---|---|
| false | false | Everyone — fully public |
| true | false | Active members only |
| false | true | Anyone who buys this specific post, or a member for free |
| true | true | Members read free; non-members can still buy this post individually |

This "members read free, non-members can still buy" combination is a genuinely distinctive capability worth featuring in copy.

### Key capabilities

| Capability | Status | Notes |
|---|---|---|
| Per-post access control (free / members-only / paid) | ✅ | 2×2 matrix described above |
| Pay-per-post (individual post purchase) | ✅ | One-time purchase per post |
| Post gifting to a friend | ✅ | `post_access_grants.grant_type` includes `'gift'` with gift message — distinct from Coffee Gifts |
| Draft autosave | ✅ | Automatic |
| 20-version history per post | ✅ | Ring buffer; includes `autosave`, `manual_save`, `ai_polish`, `pre_publish` tagged versions |
| Post analytics (views, clicks, purchases, conversion rate) | ✅ | `newsletter_post_analytics_daily` table; `get_post_analytics()` RPC |
| Cover image, tags, reading time estimate | ✅ | |
| Post likes | ✅ | `newsletter_post_likes` table; unique per reader per post |
| RSS feed per creator | ✅ | Live at `/@handle/posts/rss.xml` |
| Default starter membership plan on setup | ✅ | Auto-provisioned at ৳299/month when Newsletter is enabled |
| 0% fee with platform subscription | ✅ | Applies to per-post purchases |
| Default fee — per-post purchase | ✅ | 10% |
| Default fee — newsletter membership | ✅ | 8% |
| AI writing assistance | ⚠️ | `ai_polish` version tag confirmed in schema; maturity of the feature unconfirmed |
| Email delivery to subscribers' inboxes | ⚠️ | **Critical open question — see open questions doc** |

### What NOT to advertise

- ❌ "Email newsletter" language until inbox delivery is confirmed — the platform may be an in-app reading feed only
- ❌ Max 50 drafts per profile (real constraint, but not marketing copy)

---

## 4. Memberships

**What it is:** A recurring subscription engine that powers gated access to a creator's other services — today confirmed for Newsletter (members-only posts), with the architecture built to extend to other services. Memberships are not a standalone product; they are the access control layer that makes "members-only content" possible.

### How it works (confirmed from `memberships.sql` schema)

Creators set up membership plans with a price and billing cycle. When a supporter subscribes, they gain immediate access to whatever the plan gates (e.g. all members-only newsletter posts). Access is checked in real time by the `has_active_membership()` database function — no manual sync needed.

### Key capabilities

| Capability | Status | Notes |
|---|---|---|
| Monthly billing cycle | ✅ | |
| Annual billing cycle | ✅ | |
| Lifetime / one-time payment | ✅ | `billing_cycle` = `lifetime` — permanent access for one payment |
| Price-at-purchase locking | ✅ | `price_at_purchase` column — member keeps the price they signed up at, even if creator raises rates |
| Pause instead of cancel | ✅ | `status` = `paused` — member can pause rather than fully cancel |
| Auto-renew flag | ✅ | `auto_renew` column |
| Failed payment handling | ✅ | `status` = `past_due` — access handling logic to be confirmed |
| Proactive expiry notifications | ✅ | Automated cron at 04:00 BDT; reminders at 5, 3, 1 day before and 3, 7 days after expiry |
| Duplicate notification prevention | ✅ | `membership_notifications` dedup log |
| Plan deletion protection | ✅ | `ON DELETE RESTRICT` — can't delete a plan with active subscribers |
| Customizable plan access config | ✅ | `access_config` JSONB per plan |
| Newsletter integration (confirmed live) | ✅ | `newsletter_settings.monthly_plan_id` / `annual_plan_id` |
| Multi-service bundling (one plan → multiple services) | ⚠️ | Architecture allows it; not confirmed as a live feature |
| Platform fee on membership revenue | ⚠️ | Rate not confirmed — see open questions doc |

### What NOT to advertise

- ❌ "Memberships" as a standalone product with no attached service — frame it as "the engine behind members-only content"
- ❌ Multi-service bundling until confirmed

---

## 5. Social Feed

**What it is:** A platform-wide algorithmically ranked feed at `/home` showing content from creators a user follows, plus recommended content. This is the network-effect layer of the platform — it turns individual creator tools into a community.

### Key capabilities (✅ all confirmed from code)

The feed uses a rank score system with a boost tier (0–3) that maps to a creator's platform subscription level — higher-tier subscribers get more feed visibility. Content types surfaced in the feed include newsletter posts, shop products, shop batches (product collections), one-on-one session listings, hire listings, system milestones, and system announcements. Interactions include likes, comments (threaded), bookmarks, and shares.

The feed is seeded server-side (Cloudflare edge, fast initial load) then continues with cursor-based infinite scroll client-side. Unauthenticated visitors can see the feed but are prompted to sign in before interacting.

---

## 6. Creator Profile Page

**What it is:** The creator's public-facing page at `hobenakicoffee.com/@handle`. This is the single URL a creator shares on their Instagram bio, YouTube about section, or Facebook page — everything lives here.

### Confirmed sections on a live profile

- **Profile header** — avatar, display name, username, bio, social links, verification badge, follower count
- **Coffee/Gift widget** — live, functional
- **Newsletter** — subscribe widget (live); post reading for public posts (live)
- **Activities** — recent activity feed (purchases received, milestones, new posts)
- **Mini Shop widget** — UI present on profile; currently shows placeholder products pending shop service completion

### Profile features (✅ confirmed from schema)

Profiles have a `popularity_score` that is generated as `follower_count + (total_supporter_count × 5)` — used for algorithmic ranking. Creators can add social links (Facebook, YouTube, Instagram, and others via JSONB), choose categories for their content, and configure a custom thank-you message shown to supporters. Verification badges are issued for public credibility (`is_verified`) and separately for withdrawal eligibility (`is_kyc_verified`).
