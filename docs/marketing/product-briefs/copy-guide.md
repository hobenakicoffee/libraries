---
title: Copy Guide
description: Messaging pillars, validated claims, taglines (English + Bengali), and tone guidance
outline: deep
---

# Messaging & Copy Guide — Hobe Naki Coffee

**TL;DR:** This document tells you what to say, what to avoid, and gives you ready-to-use headlines and taglines in both English and Bengali. Every "safe to use" claim is confirmed directly from the codebase or schema. Claims marked ⚠️ require product team confirmation before use.

---

## Core messaging pillars

These are the four ideas that should anchor all campaign creative. They are not aspirational — each is verified in the product.

### Pillar 1: Zero barriers to start

**The idea:** A Bangladeshi creator can go from "I want to earn from my audience" to "I have a live page that can receive payments" in under two minutes, with no paperwork, no trade license, no bank merchant account, and no upfront cost.

**What makes this credible:** The auth flow is email OTP only. No documents are required of the creator at signup. The platform absorbs the legal and payment infrastructure that would otherwise require the creator to register a business.

**The contrast to drive home:** Setting up the traditional alternative costs ৳70,000+ and takes weeks. Hobe Naki Coffee takes two minutes and ৳0.

### Pillar 2: BDT, bKash, Nagad — it just works

**The idea:** Global platforms fail Bangladeshi creators because they don't support how Bangladesh pays. Hobe Naki Coffee is built from the ground up for BDT, bKash, Nagad, and SSLCommerz.

**What makes this credible:** The payment stack is confirmed in the backend — SSLCommerz, bKash, and Nagad are live payment methods. Cash on Delivery is a first-class payment method for the shop's physical products.

### Pillar 3: One link, every income stream

**The idea:** One URL in a bio replaces four separate tools. From `hobenakicoffee.com/@handle`, a supporter can send a tip, buy a digital product, subscribe to a newsletter, or join a membership — without the creator managing multiple platforms.

**What makes this credible:** The profile page architecture is confirmed — all four products surface from a single creator profile.

### Pillar 4: Creators keep more of what they earn

**The idea:** Platform fees are reduced to 0% for creators on a paid subscription plan. No other creator monetization platform — local or global — offers this.

**What makes this credible:** The `get_creator_effective_fee_rate()` function in the database explicitly returns 0% for creators on an active subscription across all service types.

---

## Validated claims (✅ safe to use in campaigns)

These claims are confirmed by the schema, code, or internal product documentation. Use freely.

- "Sign up with just your email — no documents, no paperwork"
- "Live profile in under 2 minutes"
- "Receive tips, sell products, and publish content from one link"
- "Supporters can send a coffee gift without creating an account"
- "Payments in BDT via bKash, Nagad, and SSLCommerz"
- "Cash on Delivery available for physical products"
- "Sell digital products with secure, expiring download links — your files are never directly exposed"
- "Publish content free, members-only, or pay-per-post — your choice, per post"
- "Members keep their price even if you raise rates later"
- "Subscribers get notified 5, 3, and 1 day before their access expires — automatically"
- "Platform fee drops to 0% with a subscription plan"
- "Your followers can gift an article to a friend — not just buy it for themselves"
- "One-time lifetime membership option — supporters pay once, access forever"
- "Your activity shows up instantly — no pending approval on gifts"
- "Bengali and English support throughout"

---

## Claims to avoid (❌ do not use until confirmed)

These are either not yet live, not yet verified, or could be misleading based on the current product state.

| Claim | Why to avoid |
|---|---|
| "Monthly recurring coffee gifts" | Schema is ready, service layer not yet wired |
| "Email newsletter delivered to inboxes" | May be an in-app reading feed only — critical open question |
| "AI-powered product listings" | Referenced in schema/landing teaser but service layer "in progress" per internal docs |
| "Browse and discover creators at /explore" | Planned; not yet live |
| "Shop checkout is live" | Feature branch unmerged — cannot complete a purchase yet |
| "Thousands of creators already earning" | Platform is pre-launch; avoid implying an established creator base without real numbers |
| "10% platform fee" | The pricing page references 10% but the backend shows per-service rates (5% gifts, 8% newsletter memberships, 10% digital shop). Confirm which figure is correct to show publicly |
| "AI bio generator" | Referenced as a future feature; not built |

---

## Headlines and taglines

### Primary taglines (short, shareable)

**English**
- "Your audience. Your income. No paperwork."
- "One link. Every way to earn."
- "The creator platform Bangladesh has been waiting for."
- "Earn in BDT. Start in 2 minutes."
- "From follower to supporter — with bKash."

**Bengali (বাংলা)**
- "তোমার দর্শক। তোমার আয়। কোনো কাগজপত্র নেই।"
- "এক লিংক। আয়ের সব পথ।"
- "বাংলাদেশের ক্রিয়েটরদের জন্য, বাংলাদেশের পেমেন্টে।"
- "বিকাশে আয় করো। ২ মিনিটে শুরু করো।"
- "ফলোয়ার থেকে সাপোর্টার — শুধু একটি লিংকে।"

---

### Hero headlines (for landing page, ads, video intros)

**English**
- "Bangladesh's creators deserve to earn. Now they can."
- "Stop losing your audience to platforms that don't support BDT."
- "You've built the audience. We've built the platform."
- "What if earning from your followers was as easy as sharing a link?"
- "No trade license. No merchant account. Just a live page and BDT payments."

**Bengali (বাংলা)**
- "বাংলাদেশের ক্রিয়েটররা আয় করার যোগ্য। এখন পারবে।"
- "তোমার দর্শক আছে। এখন আয়ের পথও আছে।"
- "ট্রেড লাইসেন্স নেই। মার্চেন্ট একাউন্ট নেই। শুধু একটা লিংক।"
- "তোমার ফলোয়াররা তোমাকে সাপোর্ট করতে চায়। এখন তারা পারবে — বিকাশে।"
- "হাজার টাকার সেটআপ ছাড়াই শুরু করো।"

---

### Problem-framing headlines (for middle-of-funnel ads, landing sections)

**English**
- "Patreon doesn't support BDT. Ko-fi doesn't support bKash. We do both."
- "Setting up a merchant account takes weeks and ৳70,000+. Setting up Hobe Naki Coffee takes 2 minutes."
- "Your YouTube audience is ready to support you. The only thing missing was the payment link."

**Bengali (বাংলা)**
- "Patreon বাংলাদেশে কাজ করে না। Ko-fi বিকাশ সাপোর্ট করে না। আমরা দুটোই করি।"
- "মার্চেন্ট একাউন্ট খুলতে সপ্তাহ লাগে, ৭০ হাজার টাকা লাগে। আমাদের প্ল্যাটফর্মে ২ মিনিট।"
- "তোমার দর্শকরা সাপোর্ট দিতে প্রস্তুত — শুধু পেমেন্ট লিংকটাই ছিল না।"

---

### Product-specific headlines

**Coffee Gifts**
- English: "A coffee says thank you better than a like."
- Bengali: "একটা কফি একটা 'লাইক'-এর চেয়ে অনেক বেশি কিছু বলে।"
- English: "Your supporters can send love — with BDT, no account needed."
- Bengali: "তোমার ফ্যানরা ভালোবাসা পাঠাতে পারে — বিকাশে, একাউন্ট ছাড়াই।"

**Newsletter**
- English: "Write once. Choose who pays. Know exactly what converts."
- Bengali: "একবার লেখো। ঠিক করো কে পড়বে। জানো কতজন কিনলো।"
- English: "Free. Members-only. Pay-per-post. Your call, every post."
- Bengali: "ফ্রি। শুধু সাবস্ক্রাইবারদের জন্য। প্রতিটা পোস্টে আলাদা মূল্য। সিদ্ধান্ত তোমার।"

**Shop**
- English: "One storefront for every digital product and physical good you sell."
- Bengali: "ডিজিটাল প্রোডাক্ট থেকে ফিজিক্যাল পণ্য — সব একটাই শপে।"

**Memberships**
- English: "Recurring income from the work you already do."
- Bengali: "যা এখনই করো তা থেকেই মাসে মাসে আয়।"

---

### CTA copy

**English**
- "Start earning — free to join"
- "Get your creator link"
- "Join the waitlist"
- "See how much you could earn" (links to pricing calculator)
- "Send a coffee" (on supporter-facing creative)

**Bengali (বাংলা)**
- "আয় শুরু করো — যোগ দেওয়া ফ্রি"
- "তোমার ক্রিয়েটর লিংক নাও"
- "ওয়েটলিস্টে যোগ দাও"
- "দেখো কত আয় করতে পারবে"
- "একটা কফি পাঠাও"

---

## Tone guidance

**Voice:** Warm, direct, and specific. Hobe Naki Coffee talks like a knowledgeable friend who understands both the creator world and the Bangladeshi market — not like a generic tech startup.

**What to avoid in tone:**
- Overly formal or corporate language
- Generic SaaS terminology that doesn't resonate in Bangladeshi creator culture
- Implying the platform is a global product (it's proudly local — lean into that)
- Comparing to global competitors by name in paid ads (mention the gap; let the reader fill in the competitor name)

**Bengali copy guidance:** Bengali copy should feel native, not translated from English. The warmth in "হবে নাকি Coffee?" — conversational, a little playful, inviting — should carry through all Bengali copy. Avoid stilted formal Bengali (চলিত ভাষা preferred over সাধু ভাষা). Use the same informal register a creator would use talking to their audience on Facebook or YouTube.

---

## Audience segmentation messaging

### For creators with a large following (10k+ followers)

Lead with the fee waiver: "You're already earning. With a subscription plan, you keep 100% of what your audience pays." The earnings at scale make the subscription plan fee feel negligible.

### For new/small creators (< 1,000 followers)

Lead with the zero-barrier setup: "You don't need a big audience to start. Your 500 real followers are more valuable than 50,000 passive ones." Emphasize that there's no upfront cost and no minimum follower count.

### For supporters

Lead with simplicity: "Support your favorite creator in BDT, with bKash — no account needed." The ease of anonymous gifting is the main hook.

### For educators and coaches

Lead with the newsletter + 1-on-1 session angle: "Publish your knowledge. Set your own price per lesson. Earn from students who already trust you." Emphasize the recurring income from memberships.
