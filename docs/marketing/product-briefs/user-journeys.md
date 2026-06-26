---
title: User Journeys
description: Step-by-step creator and supporter flows for funnel and ad creative mapping
outline: deep
---

# User Journeys — Hobe Naki Coffee

**TL;DR:** There are two primary users — Creators and Supporters. Creator journeys focus on setup and earning; Supporter journeys focus on discovery and giving. Both are designed to be frictionless: creators need no paperwork, and supporters can give without even creating an account.

---

## Persona A: The Creator

**Who they are:** A Bangladeshi content creator — YouTuber, writer, artist, fitness trainer, or coach — with an existing social media following who wants to earn from that audience without dealing with business registration or payment infrastructure.

**Their core motivation:** Turn followers into income without the legal and banking hassle that currently makes this impossible for most Bangladeshi creators.

---

### Journey 1: First-time signup and profile setup

**Entry points:** Landing page (`hobenakicoffee.com`), word-of-mouth link from another creator, social media ad.

**Step 1 — Discover the platform**
Creator lands on the marketing homepage. They see the earnings calculator (Beginner, Pro, Expert presets) and can estimate potential income from their follower count. This is often the moment that converts curiosity into signup intent.

**Step 2 — Join the waitlist or sign up**
Currently, the landing page collects email addresses via a waitlist form (`#waitlist` section). When the platform opens fully, signup continues as below.

**Step 3 — Authenticate**
Creator clicks "Sign Up" or "Login." A dialog opens. They enter their email address. Cloudflare Turnstile verifies they are human (no CAPTCHA puzzle — invisible verification). A 6-digit OTP code arrives in their inbox. They enter the code. Done. No password to remember, no OAuth account needed.

**Step 4 — Redirect to dashboard**
After authentication, the creator is redirected to `hobenakicoffee.com/app` — the full creator dashboard (separate React application). The marketing site has no dashboard; it handles auth and then hands off.

**Step 5 — Onboarding in the app**
The database tracks onboarding progress via `onboarding_step` (0 = not started). The app guides the creator through profile setup: choosing a username/handle, adding bio, avatar, banner, and social links. `has_first_service` becomes `true` once they enable their first monetization service.

**Step 6 — Share their link**
The creator's public profile is live at `hobenakicoffee.com/@theirhandle`. They copy this link and share it on their YouTube description, Instagram bio, or Facebook page.

**Time to first live profile:** Under 2 minutes (stated design goal, confirmed by the auth flow design).

---

### Journey 2: Creator receives their first Coffee Gift

**Step 1 — Supporter lands on `/@handle`**
The creator shared their Hobe Naki Coffee link. The supporter clicks it and arrives at the creator's public profile.

**Step 2 — Supporter sends a coffee**
The supporter sees the Coffee/Gift widget. They pick a number of coffees (1–100), optionally type a personal message (up to 500 characters), and pay. No account required.

**Step 3 — Creator is notified**
The gift appears instantly in the creator's Activities feed on their profile (visible publicly) and in their dashboard earnings. The supporter's name and message (if provided) appear.

**Step 4 — Creator earns**
The payment is credited to the creator's pending earnings. Platform fee is deducted (5% default, 0% if on a subscription plan). The creator can withdraw to their bank account or mobile wallet via the dashboard.

---

### Journey 3: Creator publishes a Newsletter post

**Step 1 — Write in the dashboard**
Creator goes to their Newsletter section in the app dashboard. They write a post — title, content, cover image, tags, reading time. The editor autosaves continuously. Up to 20 versions are stored automatically.

**Step 2 — Set access level**
Creator chooses who can read this post:
- Public (free for everyone)
- Members only (requires active subscription)
- Pay-per-post (anyone can buy this specific post, or members read it free)
- Members free + others can buy (the most flexible option)

**Step 3 — Publish**
Creator hits publish. The post goes through a moderation review step (internal quality check) before appearing live. Once approved, it appears on the creator's profile and in the feed for their followers.

**Step 4 — Earnings from paid posts**
When a non-member buys a pay-per-post article, the platform fee is deducted (10% default, 0% with subscription). The net amount is added to the creator's earnings.

---

### Journey 4: Creator sets up their Shop

> ⚠️ Shop checkout is currently in development (feature branch unmerged). This journey describes the intended flow.

**Step 1 — Enable Shop in dashboard**
Creator enables the "My Shop" service. They configure their shop name, description, logo, and banner.

**Step 2 — Add products**
Creator adds products — digital (ebook, template, preset) or physical (merch, art prints). For digital, they upload the file to a private storage bucket. For physical, they configure shipping rates (Dhaka vs. outside-Dhaka) and whether Cash on Delivery is available.

**Step 3 — Shop goes live**
After manager review/approval, the shop and its products are visible at `/@handle/shop` and the "Shop" widget appears on the creator's main profile.

**Step 4 — Buyer purchases**
Buyer chooses a product (and variant if applicable), pays online or selects COD. For digital: a secure, expiring download link is sent. For physical: the creator sees the order in their dashboard and marks it through the fulfillment stages.

---

## Persona B: The Supporter

**Who they are:** A fan, student, or client of a creator. They found the creator's Hobe Naki Coffee link on social media or received it directly. They want to support the creator financially.

**Their core motivation:** Say "thank you" or "I value your work" with money — simply, without hassle.

---

### Journey 1: Anonymous Coffee Gift (no account needed)

This is the most frictionless path on the platform. A supporter can complete it without ever creating an account.

**Step 1 — Click the creator's link**
Supporter arrives at `hobenakicoffee.com/@creatorhandle`. They see the creator's profile — avatar, bio, follower count, and the Coffee/Gift widget.

**Step 2 — Choose number of coffees**
The widget shows a coffee picker (1–100 range). Supporter selects how many to send.

**Step 3 — Write an optional message**
A text box allows up to 500 characters. This is entirely optional — the gift goes through even if left blank.

**Step 4 — Pay**
Standard payment flow via SSLCommerz, bKash, or Nagad. No account creation required.

**Step 5 — Done**
The gift is sent. The creator sees the supporter's message (if provided) in their activity feed. The supporter sees a confirmation. If the supporter has an account, the gift appears in their gift history.

---

### Journey 2: Supporter creates an account to subscribe to a creator

**Step 1 — Find a creator**
Supporter may discover creators through the platform feed (`/home`) or directly via a shared link.

**Step 2 — Sign up (same OTP flow as creators)**
Supporter clicks Login or Sign Up. Email → OTP → authenticated. The same flow serves both creators and supporters — there is no separate signup for each role.

**Step 3 — Follow the creator**
Supporter can follow a creator. This adds the creator's content to the supporter's `/home` feed and increments the creator's follower count.

**Step 4 — Subscribe to a membership**
If the creator has Newsletter or another service gated behind a membership plan, the supporter can subscribe. They choose Monthly, Annual, or Lifetime, pay once (or recurring), and immediately gain access to members-only content.

**Step 5 — Interact with content**
Logged-in supporters can like, comment, bookmark, and share content in the feed. Unauthenticated visitors see the feed but are prompted to log in before interacting.

---

### Journey 3: Supporter buys a pay-per-post newsletter article

**Step 1 — See a locked post**
Supporter lands on `/@handle` or sees a post in the feed. The post shows a preview/excerpt but the full content is locked — either members-only or pay-per-post.

**Step 2 — Buy the post**
For a pay-per-post article, the supporter can purchase access to that one article without subscribing to a full membership. They pay the creator-set price.

**Step 3 — Read**
Instant access to the full post content after payment.

**Gift a post to someone else (✅ confirmed feature)**
A supporter can also buy access to a specific post as a gift for another person — a distinct mechanic from Coffee Gifts, attached to an article rather than a tip.

---

## Key experience design principles (for ad creative and copy)

These principles are stated in internal product docs and confirmed by the authentication and payment architecture:

**"No account, no problem" for supporters.** Coffee Gifts work without creating an account. This reduces the biggest friction point in fan-to-creator payments. Copy should emphasize: "Your followers can support you right now — no signup needed on their end."

**"Two minutes from email to live profile" for creators.** Email OTP, no documents, no waiting period. Copy should contrast this with the traditional alternative (trade license, merchant account, weeks of delay).

**"One link, all income streams."** A creator puts one URL in their bio. From that URL, a supporter can tip, subscribe, buy a product, or read a newsletter. Copy should emphasize the simplicity of a single link replacing what would otherwise require four separate tools.

**"Your price, locked in."** Membership subscribers keep the price they signed up at — even if the creator later raises rates. This is a trust signal for supporters hesitant to subscribe.
