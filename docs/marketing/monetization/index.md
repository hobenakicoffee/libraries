---
outline: deep
---

# Marketing — Monetization

## Coffee Gifts

Flow on creator profile page:

1. Supporter selects coffee count (default 20 BDT, max 1,000,000)
2. Chooses social platform for display
3. Optional message
4. Content moderation via `moderate-content` Edge Function (profanity + OpenAI)
5. `gift.send` action → `perform_coffee_gift` RPC (service-role)
6. Gift appears on profile's activity feed

Constants: `DEFAULT_COFFEE_PRICE = 20`, `MAX_GIFT_AMOUNT = 1_000_000`

## Newsletter Memberships

- Plan selection via `membership.getPlans` action
- Purchase via `newsletterPost.joinMembership` → `purchase_newsletter_membership` RPC
- Access gating on `/@[handle]/posts/[slug]` page
- Membership period extension logic handled server-side

## Newsletter Post Purchase

- Single post pay-per-view via `newsletterPost.purchase` → `purchase_newsletter_post` RPC
- Platform fee computed server-side (never accepted from client)
- Post unlocked immediately after purchase

## Shop Checkout

- Cart: `shop.checkout` action
- Address selection via `shop.getAddresses`
- Payment methods: online + Cash on Delivery (COD)
- Shipping fee estimation from `platform_settings`
- Order confirmation page

## Platform Subscriptions

- Flat-fee plans for gift, newsletter, shop modules
- Fetched via `get-active-platform-subscription-plans.service.ts`
- Displayed on `/pricing` page
- On activation, per-transaction fees drop to 0% for that service type

## Key Rule

The marketing site **never calls purchase RPCs directly from the client**. All payment-related flows go through Astro Actions, which use the service-role Supabase client. Frontend only initiates the flow; the action handles the server-side payment processing.
