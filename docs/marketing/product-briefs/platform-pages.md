---
title: Platform Pages
description: Complete map of every public-facing URL with status and purpose
outline: deep
---

# Platform Pages — Hobe Naki Coffee

**TL;DR:** A complete map of every public-facing URL, what it does, what's currently live, and what's still in development. Marketing should only direct campaign traffic to pages marked ✅ Live.

---

## Status legend

- ✅ **Live** — built and deployed
- ⚠️ **Partial** — page exists but some sections use placeholder content
- 🔧 **In progress** — actively being built; not yet suitable for campaign traffic
- 🔜 **Planned** — not yet started

---

## Marketing Site Pages (`hobenakicoffee.com`)

### Core pages

| URL | Title | Status | Purpose |
|---|---|---|---|
| `/` | Landing page | ✅ Live | Primary conversion page; waitlist signup, earnings calculator, features, problem framing, FAQ |
| `/home` | Creator feed | ✅ Live | Algorithmic feed of creator content for logged-in users; also visible to guests |
| `/about-us` | About | ✅ Live | Brand story and company narrative |
| `/pricing` | Pricing | ✅ Live | Interactive earnings calculator + traditional-vs-HobeNaki cost comparison + feature grid |
| `/faqs` | FAQ | ✅ Live | Accordion-style frequently asked questions |
| `/contact` | Contact | ✅ Live | Support channels + contact form with CAPTCHA and email delivery |
| `/404` | 404 | ✅ Live | Animated spilled coffee cup; navigation options back to key pages |

### Policy pages (✅ all live)

| URL | Title |
|---|---|
| `/cookie-policy` | Cookie Policy |
| `/privacy-policy` | Privacy Policy |
| `/refund-policy` | Refund Policy |
| `/terms-and-conditions` | Terms & Conditions |

### Creator profile pages

| URL | Status | Purpose |
|---|---|---|
| `/@[handle]` | ✅ Live | Creator's full public profile — gift widget, newsletter, activities, about |
| `/@[handle]/posts/[slug]` | ✅ Live | Individual newsletter post page |
| `/@[handle]/shop` | ⚠️ Partial | Shop page UI is built; currently displays placeholder product data; real checkout not yet live |
| `/@[handle]/posts/rss.xml` | ✅ Live | Per-creator RSS feed for newsletter posts |

### Feature pages (planned — not yet built)

| URL | Status | Notes |
|---|---|---|
| `/features/coffee-gifts` | 🔜 Planned | Dedicated landing page for Coffee Gifts product |
| `/features/shop` | 🔜 Planned | Dedicated landing page for Shop product |
| `/features/newsletter` | 🔜 Planned | Dedicated landing page for Newsletter product |
| `/features/memberships` | 🔜 Planned | Dedicated landing page for Memberships product |
| `/explore` | 🔜 Planned | Multi-creator discovery/browse page; marked "coming soon" in footer |

---

## App (hobenakicoffee.com/app)

This is the creator and supporter dashboard — a separate React application. Marketing does not own these pages, but campaigns that convert creators need to set expectations about what happens after signup.

| Section | Purpose |
|---|---|
| Dashboard | Creator overview — earnings, stats, notifications |
| Profile settings | Edit avatar, bio, handle, social links, theme |
| Onboarding | Guided setup for new creators (tracked in DB by `onboarding_step`) |
| Services | Enable/disable/configure Coffee Gifts, Shop, Newsletter, Memberships, 1-on-1 sessions |
| Newsletter editor | Write, save drafts, manage posts, view analytics |
| Shop management | Add/edit products, manage orders, configure shipping |
| Earnings / Wallet | View earnings, pending balance, withdrawal history |
| Feed | Social feed (also accessible at marketing site `/home`) |

---

## Page-by-page notes for marketing

### Landing page (`/`)

The page is built to the "Landing Page v3" design. Its structure is: Hero (animated skeleton profile mockup, CTA to `#waitlist`) → Problem (creator pain points + cost comparison) → Guide (day-1 checklist) → Plan (3 steps) → Distribution (platform cards) → Stakes (old-vs-new checklist) → Pricing teaser → FAQ → Final CTA with waitlist form.

The waitlist signup form lives only at `#waitlist` (the final CTA section). Do not drive paid ads to `/` and assume visitors will immediately find a signup CTA — the primary scroll path must be maintained.

The earnings calculator is experimental scaffolding (per internal docs). The calculator is useful for demonstrating earning potential but is not a finalized, production-ready element — it may be redesigned. Do not reference specific calculator numbers in campaign creative without confirming with the product team that those numbers are final.

### Pricing page (`/pricing`)

Contains an interactive earnings calculator with Beginner/Pro/Expert presets, and a "Traditional business setup vs. Hobe Naki Coffee" cost comparison card (traditional cost shown as ~৳70,000+ in setup fees). Platform fee is described as 10% on the pricing page — note that this figure predates the per-service fee structure confirmed in the backend (gifts: 5%, newsletter membership: 8%, etc.). Confirm with the product team which figure appears on the pricing page before quoting it in copy.

### Creator profile pages (`/@handle`)

These are the pages a creator shares publicly. They are server-side rendered on Cloudflare's edge (fast load, good SEO). They have per-profile Open Graph tags (avatar, name) for social preview. Cache headers are set for 1-hour Cloudflare CDN caching with per-profile cache tags for instant invalidation on changes.

### Shop page (`/@handle/shop`)

This page exists and has a full UI (shop navbar, product grid layout) but currently renders mock/placeholder product data. The real backend integration (actual Supabase product queries, purchase button, checkout flow) is on a feature branch that has not yet merged. Avoid running ads specifically promising "buy from creator shops" until the merge is confirmed.

### Feed (`/home`)

Available to everyone — logged-in users get personalized content; guests see general feed content. Unauthenticated users can browse but are prompted to log in before liking, commenting, bookmarking, or sharing. This page is a good entry point for supporter-side campaigns (showing people that their favorite creators are on the platform).
