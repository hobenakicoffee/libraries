---
outline: deep
---

# Marketing — Routes

All route files under `src/pages/`. SSR by default unless noted.

## Public Landing Pages

| Route | File | SSR | Description |
|---|---|---|---|
| `/` | `pages/index.astro` | ✅ | Landing page — redirects to `/home` if logged in |
| `/pricing` | `pages/pricing/index.astro` | ✅ | Fee table, flat-fee modules, pricing calculator |
| `/faqs` | `pages/faqs/index.astro` | ✅ | 6 categorized FAQ accordion groups |
| `/contact` | `pages/contact/index.astro` | ✅ | Contact form (Turnstile + Resend) |
| `/about-us` | `pages/about-us/index.astro` | ✅ | Scroll-reveal story animation |

## Feature Pages

| Route | File | Description |
|---|---|---|
| `/features/newsletter` | `pages/features/newsletter/index.astro` | Newsletter feature landing |
| `/features/coffee-gifts` | `pages/features/coffee-gifts/index.astro` | Coffee gifts feature landing |

## Authenticated Pages

| Route | File | Description |
|---|---|---|
| `/home` | `pages/home/index.astro` | Infinite scroll feed, content filters, sidebar panels |

## Creator Pages

| Route | File | Description |
|---|---|---|
| `/@[handle]` | `pages/@[handle]/index.astro` | Creator profile (activities, gift, shop, newsletter, follow) |
| `/@[handle]/posts` | `pages/@[handle]/posts/index.astro` | Newsletter post list with RSS link |
| `/@[handle]/posts/rss.xml` | `pages/@[handle]/posts/rss.xml.ts` | RSS feed (API route) |
| `/@[handle]/posts/[slug]` | `pages/@[handle]/posts/[slug]/index.astro` | Single post with paywall |
| `/@[handle]/shop` | `pages/@[handle]/shop/index.astro` | Shop product grid |
| `/@[handle]/shop/products/[slug]` | `pages/@[handle]/shop/products/[slug]/index.astro` | Product detail |

## Legal Pages (Prerendered)

| Route | Description |
|---|---|
| `/cookie-policy` | Cookie policy |
| `/terms-and-conditions` | Terms & conditions |
| `/privacy-policy` | Privacy policy |
| `/refund-policy` | Refund policy |
| `/creator-agreement` | Creator agreement |
| `/acceptable-use-policy` | Acceptable use policy |
| `/aml-and-kyc-notice` | AML & KYC notice |
| `/tax-and-reporting` | Tax & reporting |

## Utility

| Route | Description |
|---|---|
| `/unsubscribe` | HMAC-signed email unsubscribe preferences |
| `/api/record-view` | Beacon POST endpoint for newsletter view tracking |
| `/404` | Custom 404 with coffee-spill animation |
