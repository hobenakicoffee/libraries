---
title: Trust Signals
description: Security, payments, compliance, and KYC signals for marketing campaigns
outline: deep
---

# Technical Trust Signals — Hobe Naki Coffee

**TL;DR:** This document covers every security, compliance, and payment-infrastructure detail that marketing can reference as a trust signal. These are real technical properties of the platform — not aspirational claims. Each one is confirmed in the codebase.

---

## Payment infrastructure

### Supported payment methods (✅ confirmed in schema and codebase)

| Method | Type | Status |
|---|---|---|
| SSLCommerz | Online payment gateway | ✅ Live |
| bKash | Mobile financial service | ✅ Live |
| Nagad | Mobile financial service | ✅ Live |
| Cash on Delivery (COD) | Physical shop orders only | ✅ Live |

These payment methods appear in the backend payment schema's `payment_method` enum and are referenced in footer trust badges in the marketing site. COD is a first-class payment method — not an afterthought — meaning creators can offer physical goods to buyers who prefer cash.

### BDT as primary currency (✅ confirmed)

All transactions are processed and displayed in Bangladeshi Taka (BDT). No USD conversion is required of the creator or supporter. Earnings are credited to the creator's wallet in BDT.

### Instant payment confirmation (✅ confirmed)

For Coffee Gifts, the database design confirms there is no intermediate "pending" state on the gift itself — once the gift row exists, payment has succeeded. This is not a technical oddity; it is intentional product design, and "instant earnings credit" is an accurate claim.

---

## Identity and compliance

### KYC verification (✅ confirmed in `profiles` schema)

The database distinguishes between two verification states:

**Public verification badge (`is_verified`):** Issued by the platform to creators who meet credibility criteria. Shows as a blue badge on the creator's public profile. Used for public trust and discovery ranking.

**KYC verification (`is_kyc_verified`, `kyc_verified_at`):** Internal gate that determines whether a creator can withdraw earnings. This is the compliance layer — creators must complete identity verification before accessing their wallet balance. This is the platform's legal/regulatory safeguard.

Marketing note: The existence of KYC is a trust signal for supporters (it means the creators they send money to have passed an identity check) and for creators (it means the platform takes compliance seriously, which matters for long-term earnings stability).

### NBR compliance

The footer trust badge list in the marketing site's codebase references NBR (National Board of Revenue, Bangladesh). This signals that the platform is operating within Bangladesh's tax compliance framework. Confirm with the legal/compliance team for the exact nature of this compliance before making specific claims.

---

## Security

### Bot protection (✅ confirmed)

Every authentication action (sending OTP, verifying OTP) and the contact form are protected by Cloudflare Turnstile CAPTCHA. Turnstile is an invisible verification — users do not see a puzzle or image challenge; it verifies silently. This is a higher-quality UX than traditional CAPTCHA while maintaining bot protection.

### Rate limiting (✅ confirmed)

Five separate rate limiters are deployed via Upstash Redis, each calibrated for its action type:

| Limiter | Rate | Applies to |
|---|---|---|
| `authLimit` | 5 requests / 60s | Login OTP sending and verification |
| `paymentLimit` | 10 requests / 60s | Payment-related actions |
| `writeLimit` | 20 requests / 60s | General write actions |
| `readLimit` | 30 requests / 10s | Read operations |
| `contactLimit` | 3 requests / 60s | Contact form submissions |

This prevents brute-force attacks on the auth system and abuse of payment or contact endpoints.

### Row-Level Security (RLS) (✅ confirmed)

The database uses PostgreSQL Row-Level Security enforced by Supabase. This means database queries automatically filter data to what the requesting user is allowed to see — a user cannot accidentally (or maliciously) read another creator's private earnings data, draft posts, or order details, even if they craft a direct API request. RLS is not a middleware layer that can be bypassed; it is enforced at the database level.

### Secure file delivery for digital products (✅ confirmed)

Digital product files are stored in a private storage bucket. When a buyer purchases a digital product, they do not receive a direct link to the file. Instead, they receive a **secure, expiring download token** — a 64-character unique token with a configurable expiry time and maximum download count. The underlying file path is never exposed to the client. This prevents indefinite link sharing and protects creators' intellectual property.

### Environment variable encryption (✅ confirmed)

All environment variables (API keys, database credentials, payment gateway credentials) are encrypted with `@dotenvx/dotenvx`. The encrypted `.env` files are what live in version control — not raw secrets. This means even if the code repository were accessed, credentials would not be exposed.

### HTTPS / TLS (✅ confirmed)

The platform runs on Cloudflare Pages, which enforces HTTPS on all requests. All data in transit is encrypted.

---

## Infrastructure and performance

### Edge deployment on Cloudflare (✅ confirmed)

The marketing site and creator profile pages are server-side rendered at Cloudflare's edge — meaning pages are generated at data centers close to the visitor, not on a single server in one country. For Bangladeshi users, this means low-latency page loads.

**Cache strategy for creator profiles:** Each creator's profile page has a 1-hour Cloudflare CDN cache with cache tags keyed to the creator's profile ID. When a creator updates their profile, the specific cache tag is purged — so profile changes go live immediately, but unchanged profiles load from cache (fast, no DB hit).

### Cloudflare Workers for routing (✅ confirmed)

The `router` sub-project is a dedicated Cloudflare Worker that handles request routing between the marketing site, the app, and the API. This separation means the public marketing site and creator profile pages can be optimized independently from the application dashboard.

---

## Trust signals for marketing use

The following trust signals are confirmed and can be used in copy, footer badges, or ad creative:

| Signal | Claim | Notes |
|---|---|---|
| SSLCommerz | "Powered by SSLCommerz" | Live payment gateway |
| bKash | "Pay with bKash" | Live payment method |
| Nagad | "Pay with Nagad" | Live payment method |
| Cloudflare Turnstile | "Bot-protected sign-in" | Invisible CAPTCHA on all auth actions |
| Rate limiting | "Abuse-protected" | 5 separate Upstash rate limiters |
| KYC verification | "Creators are identity-verified before withdrawals" | `is_kyc_verified` gate on withdrawals |
| Secure download tokens | "Your files are never directly exposed" | Expiring, limited-use tokens for digital products |
| Edge delivery | "Fast pages, everywhere in Bangladesh" | Cloudflare edge network |
| HTTPS | "All data encrypted in transit" | Cloudflare enforced |
| RLS | Internal only — do not use in consumer-facing copy | Too technical; implies it without saying it |

---

## What NOT to claim about security

- ❌ Do not claim PCI DSS compliance on behalf of the platform specifically — PCI compliance lives at the payment gateway (SSLCommerz) level. The platform itself passes payment handling to the gateway rather than storing card numbers.
- ❌ Do not specify exact NBR compliance details without legal team confirmation.
- ❌ Do not claim "end-to-end encrypted messaging" — the platform does not have in-app messaging between creators and supporters.
