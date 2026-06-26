---
title: Product Overview
description: Platform summary, market positioning, target audience, and key differentiators
outline: deep
---

# Product Overview — Hobe Naki Coffee

**TL;DR:** Hobe Naki Coffee is Bangladesh's first dedicated creator monetization platform. It removes every legal, banking, and technical barrier that stops Bangladeshi creators from earning online — no trade license, no merchant account, no paperwork. Just an email and two minutes to a live, shareable creator page.

---

## The problem this solves

Monetizing a creative audience in Bangladesh is harder than it should be. The existing global platforms — Patreon, Ko-fi, Buy Me a Coffee, Gumroad — do not support BDT payments, do not integrate with bKash or Nagad (Bangladesh's dominant mobile payment rails), and offer no Bengali-language experience. The alternative is setting up a local business: trade license registration, bank merchant account, tax registration (TIN), legal paperwork — an upfront cost often exceeding ৳70,000 and weeks of bureaucracy, all before earning the first taka.

Hobe Naki Coffee removes every one of those barriers. A creator signs up with an email address and an OTP code — no documents, no business registration, no upfront cost. Within two minutes they have a live profile at `hobenakicoffee.com/@theirhandle` that their audience can visit to send tips, buy products, subscribe to their newsletter, or join a membership plan.

The platform handles BDT payments, local payment gateway integration (SSLCommerz, bKash, Nagad), tax compliance logistics, and all backend infrastructure. The creator earns; the platform handles everything else.

---

## Platform identity

| Attribute | Detail |
|---|---|
| Full name | হবে নাকি Coffee? (English: Hobe Naki Coffee) |
| Meaning | "Shall we have coffee?" in Bengali — intentional, warm, inviting |
| Domain | hobenakicoffee.com |
| App URL | hobenakicoffee.com/app |
| Primary language | Bengali (bn-BD), with full English (en) support |
| Primary currency | BDT (Bangladeshi Taka) |
| Target geography | Bangladesh (creators and supporters) |
| Business model | Platform takes a percentage fee per transaction; fee is waived to 0% for creators on a paid subscription plan |

---

## Target audience

### Primary: Bangladeshi creators and freelancers

The platform is built for anyone who creates content or provides a skill and wants to earn from an existing audience. Specifically:

- **Content creators** — YouTubers, TikTokers, Facebook Page owners, Instagram creators
- **Writers and journalists** — newsletter authors, bloggers, opinion writers
- **Artists and illustrators** — digital artists, photographers, graphic designers
- **Educators and coaches** — fitness trainers, tutors, language coaches, life coaches
- **Musicians** — independent artists, session musicians, producers
- **Freelancers** — designers, developers, consultants who want a "support me" or "buy my products" page

The persona is someone who has an existing social media audience on Facebook, YouTube, or Instagram; wants to convert followers into paying supporters; speaks Bengali as their primary language; and does not have (or want to deal with) formal business registration.

### Secondary: Supporters (fans, students, clients)

People who already follow a creator and want to support them financially. They can send Coffee Gifts and make one-time purchases without creating an account — anonymous support is explicitly designed in. Supporters who do create accounts can track their gift history, manage subscriptions, and interact with content on the feed.

---

## Competitive positioning

### Direct competitors (global, not available in Bangladesh)

| Platform | Why it doesn't work for Bangladesh |
|---|---|
| Patreon | No BDT payments, no bKash/Nagad, no Bengali language, US-centric payout |
| Ko-fi | No BDT, no local payment rails |
| Buy Me a Coffee | No BDT, no local payment rails |
| Gumroad | No BDT, complex for non-tech creators |
| Substack | Newsletter only, no BDT, subscription-only model |

### Indirect competitors (local, different category)

| Platform | Why Hobe Naki Coffee is different |
|---|---|
| Facebook Shops | Physical goods only, no tips/subscriptions, no creator-fan relationship |
| Shohoz / Pathao (service marketplaces) | Gig work only, not creator monetization |
| Traditional freelance platforms (Fiverr, Upwork) | Skill-service transactional, not "support a creator" model |

### Hobe Naki Coffee's defensible advantages

**1. BDT + local payment rails (✅ Schema-confirmed)**
Payments process in Bangladeshi Taka via SSLCommerz, bKash, and Nagad. Cash on Delivery is available for physical shop products. No USD conversion friction, no international transfer delays.

**2. Zero paperwork to start (✅ Confirmed)**
Email OTP authentication only — no documents, no business registration, no merchant account required of the creator. The platform's legal and payment infrastructure is shared across all creators.

**3. Zero platform fee with a subscription plan (✅ Schema-confirmed)**
The database's `get_creator_effective_fee_rate()` function explicitly returns 0% for creators on an active platform subscription, across all service types (gifts, shop, newsletter). No global competitor offers this. Creators who pay the platform monthly essentially operate fee-free.

**4. Bengali-first experience (✅ Confirmed)**
The full platform — marketing site, creator profile, newsletter, shop — supports Bengali (bn-BD) and English. Translation is not an afterthought; it is built into the codebase at the component level via Paraglide/Intlayer.

**5. All income streams in one profile link (✅ Confirmed)**
One URL (`/@handle`) hosts all of a creator's monetization: tips, digital shop, physical shop, newsletter, membership. Supporters never navigate away to a third-party tool. No juggling Patreon + Gumroad + Mailchimp.

**6. Two-minute setup (✅ Confirmed)**
The auth flow is email OTP — no password, no OAuth, no ID verification at signup. The platform's design goal (stated in internal docs) is "sign up and get your shareable profile link in under 2 minutes."

---

## Business model (fee structure)

Hobe Naki Coffee earns a percentage of each creator's transactions. The exact rates, confirmed from the backend schema and internal docs:

| Service | Default fee | Fee with active platform subscription |
|---|---|---|
| Coffee Gifts | 5% | 0% |
| Newsletter (per-post purchase) | 10% | 0% |
| Newsletter (membership/subscription) | 8% | 0% |
| Shop — digital products | 10% | 0% |
| Shop — physical products | 5% | 0% |

Creators can also choose from tiered platform subscription plans (Pro, Max, Ultra at monthly pricing — exact amounts to be confirmed with product team) that provide the fee waiver and additional platform benefits (content boost tier on the feed, etc.).

---

## Platform maturity (as of June 2026)

The platform is in active development, pre-launch / early-access phase. The landing page collects waitlist signups.

**What is built and live:**
- Creator profile pages (`/@handle`) with gift, newsletter, and activities sections
- Email OTP authentication
- Feed page (`/home`) with algorithmic ranking and infinite scroll
- Newsletter post publishing and reading
- Contact, Pricing, FAQ, and Policy pages
- Waitlist signup collection

**What is in progress:**
- Shop backend and checkout flow (feature branch, not yet merged)
- Shop product display on creator profiles (currently shows placeholder data)

**What is planned but not started:**
- AI-powered bio and product description generation
- Search/Explore page for discovering creators
- Recurring Coffee Gifts (schema is ready, service layer not yet wired)
- Marketplace (multi-creator browse)
- Blog
