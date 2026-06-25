---
outline: deep
---

# Marketing — Astro Actions

All actions are registered in `src/actions/index.ts` and exported as the `server` object.

## Action Namespaces

| Namespace | File | Actions | Rate Limit | Purpose |
|---|---|---|---|---|
| `auth` | `actions/auth.ts` | `sendOtp`, `verifyOtp` | auth (5/60s) | Email OTP authentication |
| `profile` | `actions/profile.ts` | `getById`, `getByUsername` | read | Profile data via service-role |
| `membership` | `actions/membership.ts` | `getPlans`, `checkMembership` | read | Membership plan queries |
| `follow` | `_follow/actions/follow.ts` | `checkStatus`, `toggle` | write | Follow/unfollow creators |
| `gift` | `_gift/actions/gift.ts` | `send` | payment | Coffee gift (with moderation) |
| `activities` | `_activities/actions/activities.ts` | `getWithPagination`, `getCount` | read | Public activity feed |
| `newsletter` | `_newsletter/actions/newsletter.ts` | `getWithPagination` | read | Newsletter post listing |
| `newsletterPost` | `posts/_actions/post.ts` | `getBySlug`, `getLikeState`, `checkAccess`, `toggleLike`, `recordClick`, `purchase`, `joinMembership` | mixed | Full post + purchase |
| `shop` | `_shop/actions/shop.ts` | `getFeaturedProducts`, `getAddresses`, `checkout` | mixed | Shop operations |
| `contactUs` | `contact/_action/contact.ts` | `sendEmail` | contact (1/60s) | Contact form |
| `unsubscribe` | `actions/unsubscribe.ts` | `savePreferences` | write | Unsubscribe preferences |
| `wishlist` | `actions/wishlist.ts` | `join` | wishlist (2/60s) | Pre-launch signup |

## Key Patterns

- **Never call Supabase RPCs for writes from the client.** All mutations go through Astro Actions, which use the service-role client.
- **For reads**, direct Supabase queries are acceptable where efficient, but actions are preferred for complex joins or RPCs.
- **Input validation** via Zod schemas inside each action.
- **Rate limiting** via Upstash Redis (6 tiers defined in `src/lib/upstash.ts`).
- **Bot protection** via Cloudflare Turnstile on auth, contact, and wishlist actions.
