---
title: Open Questions
description: Unresolved product questions that block marketing copy decisions
outline: deep
---

# Open Questions — Hobe Naki Coffee

**TL;DR:** These are unresolved product questions that directly affect what marketing can and cannot say. Do not publish campaigns, write feature copy, or run ads touching these topics until each question is answered and confirmed by the product team.

Each question notes which documents and which copy it blocks.

---

## Critical (blocks major copy decisions)

### Q1. Is "Newsletter" an email newsletter or an in-app reading feed?

**Why it matters:** This is the single most important fact-check for Newsletter marketing. If the platform emails posts to subscribers' inboxes, it competes directly with Substack and Mailchimp — "publish your newsletter, email it to subscribers" is a powerful and recognizable pitch. If it is an in-app reading feed with a paywall (no email delivery), it is a completely different product with a completely different pitch — closer to a "members-only content wall" than a newsletter.

**What the schema shows:** The `newsletter_posts` table and related schema look like a content publishing system with per-post access control. There is no evidence in the schema of an email delivery system (SMTP integration, mailing list management, send jobs). However, absence of evidence in the schema is not proof of absence — there may be an external email delivery system (e.g. Resend) used for newsletter sends that isn't in the Supabase schema.

**What to confirm:** Ask the product/engineering team directly: "When a creator publishes a newsletter post, does anything get sent to subscribers' email inboxes? Or do subscribers only access the post by visiting the platform?"

**What's blocked until this is answered:**
- All Newsletter hero headlines and feature descriptions in the Copy Guide
- The Newsletter feature page plan
- Any ad creative describing the Newsletter product
- FAQ answers on the `/faqs` page that reference how newsletter delivery works

---

### Q2. What is the platform fee on membership/subscription revenue?

**Why it matters:** The pricing page and copy needs a single, accurate number (or a table of numbers) for each service type. Internal docs confirm the fee for Coffee Gifts (5%), Newsletter per-post purchases (10%), Newsletter memberships (8%), digital shop (10%), and physical shop (5%). The fee on **platform subscription-based membership revenue** (when a creator sells a monthly/annual/lifetime plan) is not confirmed in the research.

**What to confirm:** Ask the product team: "What percentage does the platform take from a creator's membership/subscription revenue? Is it the same 8% as Newsletter memberships, or different?"

**What's blocked until this is answered:**
- The Memberships feature page FAQ answer on fees
- Any copy that quotes a specific fee for memberships
- The pricing calculator if it includes membership revenue as an income stream

---

### Q3. Does the pricing page show the correct fee? (10% vs. per-service rates)

**Why it matters:** The live `/pricing` page currently references "10% platform fee" as a single number. The backend schema confirms different rates per service type (5% for gifts, 8% for newsletter memberships, 10% for digital products). This creates a potential inconsistency between what the pricing page says and what a creator actually pays.

**What to confirm:** Ask the product team: "Is the 10% figure on the pricing page intentionally simplified (averaged), or does the pricing page need to be updated to reflect the per-service rates? Which is the correct public-facing number?"

**What's blocked until this is answered:**
- Any copy that quotes platform fees
- The pricing page itself (if it needs a correction)
- The Copy Guide claim about fee structure

---

## Important (blocks specific feature copy)

### Q4. Is the Shop checkout flow live for users?

**Why it matters:** The shop UI is visible and the feature branch (`feature/shop-service`) is in active development. But as of the research date, the branch has not merged to main. Running campaigns that drive traffic to a shop or advertise "sell products on Hobe Naki Coffee" before checkout is functional would result in users clicking "Buy Now" and hitting a broken or placeholder experience.

**What to confirm:** Ask engineering: "Has the `feature/shop-service` branch merged to main? Is the purchase/checkout flow live for real users?"

**What's blocked until this is answered:**
- Any campaign specifically driving traffic to shop pages
- Copy that says "start selling products today" or implies shop is ready to use
- The Shop feature page plan build approval

---

### Q5. What is the failed-payment (`past_due`) behavior for memberships?

**Why it matters:** The schema has a `past_due` membership status, which implies the platform handles failed subscription payments. But the product behavior — "does a member lose access immediately when a payment fails, or is there a grace period?" — affects both the FAQ copy on the memberships feature page and the trust messaging around the subscription lifecycle.

**What to confirm:** Ask product/engineering: "When a membership payment fails and the status becomes `past_due`, does the member lose immediate access to gated content? Is there a grace period? How long?"

**What's blocked until this is answered:**
- Memberships FAQ answer on failed payment behavior
- Any trust copy claiming "seamless, no-disruption membership management"

---

### Q6. Is recurring Coffee Gift billing live?

**Why it matters:** The `coffee_gifts` table has an `is_monthly` column, suggesting the schema is designed to support recurring (monthly) coffee gifts. However, internal docs explicitly note that "nothing in the service layer activates a billing schedule yet." If recurring gifts are now live, it is a significant feature worth advertising. If not, any mention of it must be flagged as "coming soon."

**What to confirm:** Ask engineering: "Is monthly/recurring Coffee Gift billing live? Can a supporter set up an automatic monthly coffee for a creator?"

**What's blocked until this is answered:**
- Coffee Gifts feature page FAQ answers
- Any copy mentioning recurring or monthly support

---

### Q7. Are AI listing/writing features mature enough to advertise?

**Why it matters:** The `newsletter_post_versions` schema includes an `ai_polish` version source tag, and the shop/landing page references AI-assisted listing features. Internal docs describe the shop's AI features as "in progress" and the newsletter AI as an `ai_polish` tag (scope unclear). If these features are polished and live, they're genuinely differentiating. If they're half-built, advertising them as a feature creates a credibility risk.

**What to confirm:** Ask product: "What exactly can a creator do with AI on the platform today? Can they generate a product description? Polish a newsletter post? Is any of this live enough to feature prominently?"

**What's blocked until this is answered:**
- Newsletter feature page's "AI writing assistance" section
- Shop feature page's "AI-assisted listing" feature card
- Any ad creative featuring AI capabilities

---

### Q8. Do we have a real, canonical demo creator handle?

**Why it matters:** The Coffee Gifts feature page plan references linking to a "real demo creator profile" so visitors can see the gift widget live. Without a canonical demo handle, the page either links to a real creator (which has brand implications) or has no "see it live" CTA.

**What to confirm:** Does the platform have a designated demo or showcase creator account (e.g. `@hobenakicoffee` or a well-known creator who has agreed to be featured)?

**What's blocked until this is answered:**
- Secondary CTA on the Coffee Gifts feature page
- Any "see it in action" links in campaign creative

---

## Lower priority (for future campaigns)

### Q9. What are the exact platform subscription plan names and prices?

Internal docs reference Pro, Max, and Ultra plans at monthly pricing, but exact prices are not confirmed in the research. Needed for any copy that references the subscription plan as a named tier rather than a generic "paid plan."

### Q10. Does the platform have a Knowledge Base / Help Center?

The Contact page references a "Knowledge Base" as a support channel. If this doesn't exist yet, the Contact page may be displaying a broken or placeholder link. Confirm with the team whether the Knowledge Base is live and the correct URL.

### Q11. What are the waitlist numbers?

Marketing campaigns positioning the platform as "growing fast" or "join X other creators" need real waitlist signup numbers from the product team. Do not invent or estimate this number.

---

## How to use this document

1. Pick the questions most relevant to your next campaign or content piece.
2. Bring them to the product or engineering team with the exact question text above.
3. Update the Copy Guide with confirmed answers — move validated claims from ⚠️ to ✅.
4. Brief your copywriter or agency only after the relevant questions are answered.
