# Supabase Backend — Complete Reference

This page is the entry point for the entire Supabase backend: schema, edge functions, infrastructure, and design decisions. Every table, RPC, trigger, cron job, storage bucket, and edge function is documented here or linked to a dedicated page.

---

## Schemas (30 files)

Every `.sql` file in `supabase/schemas/` is loaded declaratively in the order specified by `config.toml` → `[db.migrations].schema_paths`. The order respects foreign-key dependencies.

| Order | File | Domain | Docs |
|---|---|---|---|
| 1 | `common.sql` | Enums (8 types), `handle_updated_at()` helper | [Common Types & Helpers](./common/backend/index) |
| 2 | `managers.sql` | Manager profiles, roles, permissions, RBAC | [Managers & RBAC](./managers-and-rbac/backend/index) |
| 3 | `bd-geo-locations.sql` | Bangladesh divisions/districts/upazillas/unions | [BD Geo Data](./infrastructure/backend/geo-data) |
| 4 | `profiles.sql` | User profiles, `public_profiles` view, RLS, storage policies | [Profiles Reference](./profiles/backend/index) |
| 5 | `notifications.sql` | `notification_types` registry, preference overrides, unsubscribe | [Notifications](./notifications/index) |
| 6 | `platform_settings.sql` | Key-value JSONB config store | [Platform Settings](./platform-settings/backend/index) |
| 7 | `messaging.sql` | Conversations + partitioned messages, monthly partitioning | [Messaging](./messaging/backend/index) |
| 8 | `supporters.sql` | Unique supporter relationships, `total_supporter_count` trigger | [Supporters](./supporters/backend/index) |
| 9 | `wallets.sql` | Creator wallet (balance, cod_debt) | [Wallets](./payments-and-memberships/backend/wallets) |
| 10 | `transactions.sql` | Financial transaction ledger, RPCs | [Transactions](./payments-and-memberships/backend/transactions) |
| 11 | `activities.sql` | Activity feed (transaction + engagement events) | [Activities](./payments-and-memberships/backend/activities) |
| 12 | `payments.sql` | Payment records, order payments | [Payment Functions](./payments-and-memberships/backend/payment-functions) |
| 13 | `refunds.sql` | Refund processing with triggers | [Refunds](./payments-and-memberships/backend/refunds) |
| 14 | `payout_methods.sql` | Creator payout method storage (bKash, Nagad, Rocket, Bank) | [Payout Methods](./payments-and-memberships/backend/payout-methods) |
| 15 | `withdrawal_requests.sql` | Withdrawal workflow (request → approve → pay) | [Withdrawal Requests](./payments-and-memberships/backend/withdrawal-requests) |
| 16 | `kyc.sql` | KYC sessions, documents, verifications | [KYC Backend](./kyc/backend/index) |
| 17 | `platform_subscriptions.sql` | Subscription plans + creator subscriptions | [Platform Subscriptions](./platform-subscriptions/backend/index) |
| 18 | `service_requests.sql` | Feature request/suggestion system | [User Services & Service Requests](./user-services/backend/index) |
| 19 | `memberships.sql` | Creator membership plans + profile memberships | [Memberships](./payments-and-memberships/backend/memberships) |
| 20 | `follows.sql` | Follow/unfollow, counts, milestone triggers | [Feed Population](./feed-discovery/backend/feed-population) (milestones) |
| 21 | `user_services.sql` | Per-creator service toggles | [User Services](./user-services/backend/index) |
| 22 | `creators.sql` | Creator discovery RPCs (`get_explore_creators`) | [Explore Backend](./explore/backend/index) |
| 23 | `creator_reports.sql` | Creator earnings/analytics reports | [Reports Schema](./reports/backend/schema) |
| 24 | `coffee_gifts.sql` | Coffee gifting system | [Coffee Gifts](./coffee-gifts/backend/index) |
| 25 | `newsletter_service.sql` | Newsletter CMS (posts, subscriptions, access) | [Newsletter Backend](./newsletter-service/backend/index) |
| 26 | `shop_service.sql` | E-commerce (products, categories, orders, cart, COD, dashboard) | [Shop Backend](./shop-service/backend/index) |
| 27 | `email_notifications.sql` | Email notification queue + dispatcher | [Email Notifications](./email-notifications/backend/index) |
| 28 | `feed.sql` | Public discovery feed, interactions, ranking, search | [Feed Discovery](./feed-discovery/backend/index) |
| 29 | `reviews.sql` | Shop product reviews | [Reviews](./reviews/backend/index) |
| 30 | `wishlist.sql` | Product wishlist | [Wishlist](./wishlist/index) |

---

## Edge Functions (6 functions)

All functions live in `supabase/functions/`. Each receives `verify_jwt = false` in config — auth is handled by custom middleware instead.

| Function | Route | Method | Auth | Rate Limit | Purpose |
|---|---|---|---|---|---|
| `ai-editor-chat` | `POST /ai-editor-chat` | POST | Required | ai (3 req/60s) | OpenAI GPT-5-nano SSE streaming chat |
| `moderate-content` | `POST /moderate-content` | POST | Required | ai (3 req/60s) | Two-stage content moderation (profanity + OpenAI Omni) |
| `create-kyc-session` | `POST /create-kyc-session` | POST | Required | strict (2 req/60s) | KYC mobile session with magic-link auth |
| `delete-user` | `POST /delete-user` | POST | Required | strict (2 req/60s) | Permanent account deletion + win-back email |
| `download-shop-file` | `GET /download-shop-file` | GET | Token-based | — | Signed-URL redirect for digital product downloads |
| `export-shop-products` | `POST /export-shop-products` | POST | Required | strict (2 req/60s) | Filtered CSV export of shop products |

**Full docs**: [Edge Functions Overview](./edge-functions/backend/index) → [Middleware](./edge-functions/backend/middleware) → Individual function pages

---

## Shared Infrastructure

### Middleware (`supabase/functions/_shared/middelware/`)
- `withMiddleware(handler, opts)` — wraps every edge function with auth + rate limiting + CORS
- Auth: `verifyAuth()` reads `Authorization: Bearer <token>`, calls `supabase.auth.getClaims()`, returns `JwtClaims | null`
- Rate limiting: **Upstash Redis** sliding window (primary). Arcjet token bucket (fallback file exists but commented).
  - Tiers: public (10/10s), auth (5/60s), ai (3/60s), strict (2/60s)
- CORS: OPTIONS preflight + per-response `corsHeaders`

### Utilities (`_shared/utils/`)
- `response.ts` — `successResponse()`, `errorResponse()`, `rateLimitError()`, `unauthorizedError()`, `forbiddenError()`, `badRequestError()`, `methodNotAllowedError()`, `internalError()`, `csvResponse()`
- `csv.ts` — `toCSV<T>(rows, columnMap)` — type-safe CSV generation
- `moderation.ts` — `containsProfanity(input)` — English (obscenity) + Bengali (500+ word list with regex) profanity detection
- `index.ts` — `getUserId(claims)`, `getClientIp(req)`

### Types (`_shared/types/index.ts`)
- `JwtClaims` — `{ iss, sub, aud, exp, iat, role, session_id }`
- `RateLimitTier` — `'public' | 'auth' | 'ai' | 'strict'`
- `MiddlewareOptions` — `{ requireAuth?, rateLimit?: { tier?, provider?, customKey? } }`

### Email Templates (`_shared/email-templates/`)
- `account-deleted.ts` — win-back email rendered by `renderAccountDeletedEmail(name, appUrl)`
- Email sending via `sendEmail({ to, subject, html })` using Resend SDK

---

## Infrastructure

### Storage

7 buckets with RLS policies — see [Infrastructure docs](./infrastructure/backend/index#storage-buckets)

| Bucket | Public | Max Size | Purpose |
|---|---|---|---|
| `hobenakicoffee` | Yes | — | Marketing/branding assets |
| `avatars` | Yes | 2 MB | User avatars (jpeg/png/gif/webp/svg) |
| `banners` | Yes | 5 MB | Profile banners |
| `post-images` | Yes | 5 MB | Newsletter post images |
| `shop-images` | Yes | 5 MB | Product images |
| `shop-product-files` | **No** | 1 GB | Digital product files |
| `kyc-documents` | **No** | 10 MB | KYC identity documents |

### Auth

- OAuth: Google + GitHub (both enabled)
- Email auth: OTP (8-digit, 1h expiry), confirmation required, magic-link support
- Captcha: Turnstile
- Custom Access Token Hook: `custom_access_token_hook` (adds manager_role/permissions to JWT claims)
- Password: min 10 chars
- Rate limits: 30 sign-ins/5min, 150 token refreshes/5min, 2 emails/h
- Templates: Bangla-language confirmation + magic_link emails

### Cron Jobs (12 total)

See [Infrastructure docs](./infrastructure/backend/index#cron-jobs) for full schedule table.

Key jobs: feed ranking (every 30 min), email dispatch (every 5 min), message partition management (monthly), KYC session expiry (hourly), shop auto-deactivation (daily 22:00), cleanup tasks (daily).

### Seeds (10 files)

| File | Purpose |
|---|---|
| `seed.sql` | Static seed: permissions, platform settings, subscription plans |
| `1.init.ts` | Storage buckets, RLS policies, cron jobs, super admin |
| `2.follows.ts` | 12 test users with follow relationships |
| `3.messaging.ts` | Direct conversations + messages |
| `4.gifting.ts` | Coffee gifts |
| `5.newsletter.ts` | Newsletter posts + subscriptions |
| `6.my-shop.ts` | Shop products, categories, orders |
| `7.managers.ts` | Manager profiles |
| `8.bd-geo-data.ts` | Bangladesh geography |
| `9.creator-reports.ts` | Creator earnings reports |

See [Infrastructure docs](./infrastructure/backend/index#seed-data) for details.

---

## Table of Contents (all backend docs)

### Payments & Memberships
- [Backend Overview](./payments-and-memberships/backend/index)
- [Enums](./payments-and-memberships/backend/enums)
- [Memberships](./payments-and-memberships/backend/memberships)
- [Wallets](./payments-and-memberships/backend/wallets)
- [Transactions](./payments-and-memberships/backend/transactions)
- [Payment Functions](./payments-and-memberships/backend/payment-functions)
- [Payout Methods](./payments-and-memberships/backend/payout-methods)
- [Refunds](./payments-and-memberships/backend/refunds)
- [Withdrawal Requests](./payments-and-memberships/backend/withdrawal-requests)
- [Activities](./payments-and-memberships/backend/activities)

### Shop Service
- [Backend Overview](./shop-service/backend/index)
- [Schema](./shop-service/backend/schema)
- [Shop Settings](./shop-service/backend/shop-settings)
- [Products RPCs](./shop-service/backend/rpc-products)
- [Categories RPCs](./shop-service/backend/rpc-categories)
- [Orders RPCs](./shop-service/backend/rpc-orders)
- [Checkout RPCs](./shop-service/backend/rpc-checkout)
- [COD RPCs](./shop-service/backend/rpc-cod)
- [Dashboard RPCs](./shop-service/backend/rpc-dashboard)
- [Helpers RPCs](./shop-service/backend/rpc-helpers)
- [RPC Reference](./shop-service/backend/rpc-reference)

### Newsletter Service
- [Backend Overview](./newsletter-service/backend/index)
- [Tables](./newsletter-service/backend/tables)
- [Newsletter Posts](./newsletter-service/backend/newsletter-posts)
- [Engagement & Access](./newsletter-service/backend/engagement-and-access)
- [Analytics](./newsletter-service/backend/analytics)
- [RPCs](./newsletter-service/backend/rpcs)
- [Triggers & RLS](./newsletter-service/backend/triggers-and-rls)

### Feed Discovery
- [Backend Overview](./feed-discovery/backend/index)
- [Data Model](./feed-discovery/backend/data-model)
- [Feed Population](./feed-discovery/backend/feed-population)
- [Ranking](./feed-discovery/backend/ranking)
- [RPC: get_feed](./feed-discovery/backend/rpc-get-feed)
- [RPC: search_feed](./feed-discovery/backend/rpc-search-feed)
- [RPC: Social Interactions](./feed-discovery/backend/rpc-social)
- [RPC: Aside Panels](./feed-discovery/backend/rpc-aside)

### Platform Subscriptions
- [Backend Overview](./platform-subscriptions/backend/index)
- [Schema](./platform-subscriptions/backend/schema)
- [RPCs](./platform-subscriptions/backend/rpcs)

### Coffee Gifts
- [Backend Overview](./coffee-gifts/backend/index)
- [Database Schema](./coffee-gifts/backend/database-schema)
- [Payment Pipeline](./coffee-gifts/backend/payment-pipeline)
- [RPC: Perform Coffee Gift](./coffee-gifts/backend/rpc-perform-coffee-gift)
- [RPC: Stats](./coffee-gifts/backend/rpc-stats)
- [Security & RLS](./coffee-gifts/backend/security-and-rls)

### Explore
- [Backend Overview](./explore/backend/index)
- [RPC: get_explore_creators](./explore/backend/rpc-get-explore-creators)

### Memberships Hub
- [Backend Overview](./memberships-hub/backend/index)
- [Interactions](./memberships-hub/backend/interactions)
- [Affinity Ranking](./memberships-hub/backend/affinity-ranking)
- [Boost Campaigns](./memberships-hub/backend/boost-campaigns)
- [Feed Items](./memberships-hub/backend/feed-items)
- [Platform Settings](./memberships-hub/backend/platform-settings)
- [RPCs Reference](./memberships-hub/backend/rpcs-reference)

### Newly Documented Backend Areas

- [Edge Functions Overview](./edge-functions/backend/index) — 6 functions + middleware
- [Middleware Infrastructure](./edge-functions/backend/middleware) — Auth, rate limiting, CORS
- [Managers & RBAC](./managers-and-rbac/backend/index) — Roles, permissions, RLS, RPCs
- [Messaging](./messaging/backend/index) — Conversations, partitioned messages, realtime
- [Profiles Reference](./profiles/backend/index) — Full profiles table, RLS, storage policies
- [Common Types & Helpers](./common/backend/index) — All PostgreSQL enums
- [Infrastructure](./infrastructure/backend/index) — Storage, Auth, Cron, Seeds
- [Supporters](./supporters/backend/index) — Supporter tracking
- [KYC Backend](./kyc/backend/index) — KYC sessions, documents, verifications
- [Email Notifications](./email-notifications/backend/index) — Queue, dispatcher, cron
- [User Services & Service Requests](./user-services/backend/index)
- [Platform Settings](./platform-settings/backend/index) — Config KV store
- [Reports Backend](./reports/backend/index) — Creator earnings reports
- [Reviews Backend](./reviews/backend/index) — Shop product reviews
- [Notifications](./notifications/index) — Notification types, preferences, unsubscribe
- [Wishlist](./wishlist/index) — Product wishlist system
