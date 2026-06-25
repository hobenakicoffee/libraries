---
outline: deep
---

# Marketing — Infrastructure

## Cloudflare Deployment

- Adapter: `@astrojs/cloudflare` with passthrough image service
- Wrangler config: `wrangler.jsonc`
- CI/CD: `.github/workflows/ci.yaml` (lint + format + type-check), `.github/workflows/production.yaml` (deploy)
- Build: `paraglide-js compile && astro build`
- Environment secrets via Cloudflare dashboard + `dotenvx` encryption

## i18n (Inlang/Paraglide)

- Two locales: `bn` (Bengali, base) and `en`
- Translations in `messages/bn.json` and `messages/en.json`
- All user-facing strings use `m.some_key()` from `@/paraglide/messages`
- Middleware wraps every request for locale detection
- Build step: `paraglide-js compile` generates runtime

## SEO & Metadata

- `astro-seo` — OG/Twitter tags per page
- JSON-LD structured data: Organization, WebSite, Product, BlogPosting
- `astro-robots-txt` — disallows `/app/`
- `astro-sitemap` with canonical URLs
- `astro-webmanifest` — PWA manifest
- Per-post: `article:published_time`, `article:tag`, canonical URL

## Rate Limiting (Upstash Redis)

Six tiers in `src/lib/upstash.ts`:

| Name | Requests | Window | Applied To |
|------|----------|--------|------------|
| `authLimit` | 5 | 60s | Auth OTP send/verify |
| `paymentLimit` | 3 | 60s | Purchases, gift sending |
| `writeLimit` | 10 | 10s | Follows, likes, comments |
| `readLimit` | 30 | 10s | General data fetching |
| `contactLimit` | 1 | 60s | Contact form |
| `wishlistLimit` | 2 | 60s | Wishlist signups |

## Turnstile Protection

- Server-side: `verifyTurnstileToken()` in `src/lib/turnstile.ts`
- Client: `turnstile-captcha.tsx` React component wrapping Cloudflare Turnstile
- Key: `PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` (public) + `CLOUDFLARE_TURNSTILE_SECRET_KEY` (secret)
- Applied on: auth, contact, wishlist forms

## Analytics

- Google Tag Manager (`GTM_ID`)
- Microsoft Clarity (`CLARITY_ID`)
- View tracking: Beacon POST to `/api/record-view` (cookie-deduped for unique views)
- Click tracking via newsletter post actions

## Integration Points

| Service | Purpose | Key |
|---|---|---|
| Supabase (SSR) | Auth, database queries | `PUBLIC_SUPABASE_URL` + cookies |
| Supabase (service-role) | Admin DB operations | `SUPABASE_SECRET_KEY` |
| Resend | Transactional email | `RESEND_API_KEY` |
| OpenAI | Content moderation | `OPENAI_API_KEY` |
| Upstash | Rate limiting | `UPSTASH_REDIS_REST_URL` + token |
| Turnstile | Bot protection | `CLOUDFLARE_TURNSTILE_*_KEY` |
| `@hobenakicoffee/libraries` | Types, constants, utils | npm package |
| App project | Creator dashboard redirects | `PUBLIC_APP_PAGE_URL` |

## Environment Variables

All secrets encrypted via `dotenvx` in `.env` and `.env.production`. Full list in `.env.example`.
