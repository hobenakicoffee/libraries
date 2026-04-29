# Payments & Wallets — Frontend Guide

This guide covers how to integrate with the payment and wallet system from a client (browser/Next.js) perspective. All data access goes through the Supabase client using either table queries or RPC calls.

## Pages in this section

| Page | What it covers |
|---|---|
| [Wallet](./wallet) | Reading balance, real-time subscription |
| [Payout Methods](./payout-methods) | Listing, adding, updating, deleting payout accounts |
| [Transactions](./transactions) | Transaction history, pagination, analytics stats |
| [Withdrawal](./withdrawal) | Submitting and tracking withdrawal requests |
| [Activities](./activities) | Support feed, notification list, dismissing alerts |
| [Memberships](./memberships) | Checking access, purchasing plans, cancellation |

---

## Prerequisites

All examples assume you have a typed Supabase client:

```ts
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

For server-side / API route calls that need service role (e.g. triggering payment RPCs):

```ts
// lib/supabase/server-admin.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

::: warning Server-side only
`SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser. Only use `supabaseAdmin` inside API routes or server actions.
:::

---

## What clients can and cannot do

| Action | Client (anon key) | Server (service role) |
|---|---|---|
| Read own wallet balance | ✓ | ✓ |
| Read own transactions | ✓ | ✓ |
| Read own withdrawal requests | ✓ | ✓ |
| Manage own payout methods | ✓ | ✓ |
| Submit a withdrawal request | ✓ (via RPC) | ✓ |
| Trigger a payment | ✗ | ✓ |
| Read public activities | ✓ (anon) | ✓ |
| Read own private activities | ✓ (authenticated) | ✓ |
| Create/update transactions | ✗ | ✓ |

---

## TypeScript types quick reference

Key enums you will use frequently:

```ts
type Provider =
  | 'HobeNakiCoffee' | 'Bkash' | 'Nagad' | 'Rocket'
  | 'Upay' | 'SSLCommerz' | 'Aamarpay' | 'Portwallet' | 'Tap' | 'Other'

type PayoutProvider = 'bkash' | 'nagad' | 'rocket' | 'bank'

type ReferenceType =
  | 'subscription' | 'one-time' | 'payout'
  | 'withdraw_lock' | 'withdraw_release' | 'withdraw_complete'
  | 'manual_adjustment'

type TransactionDirection = 'debit' | 'credit'

type PaymentStatus =
  | 'pending' | 'processing' | 'completed' | 'failed'
  | 'reversed' | 'cancelled' | 'refunded' | 'reviewing'

type WithdrawalStatus =
  | 'requested' | 'approved' | 'processing' | 'paid' | 'rejected' | 'failed'

type MembershipStatus =
  | 'active' | 'cancelled' | 'expired' | 'paused' | 'past_due'

type MembershipBillingCycle = 'monthly' | 'annual' | 'lifetime'

type Visibility = 'public' | 'private'
```
