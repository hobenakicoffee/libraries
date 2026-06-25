# Common Types & Helpers

All custom types live in the `public` schema and are defined in
`supabase/schemas/common.sql`.

---

## Enums

### `supporter_platform_enum`

18 social platforms used for supporter attribution analytics.

| Value | Description |
|---|---|
| `facebook` | Facebook |
| `x` | X (formerly Twitter) |
| `instagram` | Instagram |
| `youtube` | YouTube |
| `github` | GitHub |
| `linkedin` | LinkedIn |
| `twitch` | Twitch |
| `tiktok` | TikTok |
| `threads` | Threads |
| `whatsapp` | WhatsApp |
| `telegram` | Telegram |
| `discord` | Discord |
| `reddit` | Reddit |
| `pinterest` | Pinterest |
| `medium` | Medium |
| `devto` | Dev.to |
| `behance` | Behance |
| `dribbble` | Dribbble |

### `payment_status_enum`

Lifecycle status for a transaction row.

| Value | Meaning |
|---|---|
| `pending` | Created but not yet processed |
| `processing` | Being processed by the payment provider |
| `completed` | Fully settled and final |
| `failed` | Processing failed |
| `reversed` | Completed but subsequently reversed |
| `cancelled` | Cancelled before processing |
| `refunded` | Payment was refunded to supporter |
| `reviewing` | Flagged for manual admin review |

### `reference_type_enum`

Classifies what a transaction represents in the system lifecycle.

| Value | Used when |
|---|---|
| `subscription` | Recurring membership/subscription payment |
| `one-time` | Single coffee gift or one-off payment |
| `payout` | Funds paid out to creator (withdrawal complete) |
| `withdraw_lock` | Funds locked pending admin approval of withdrawal |
| `withdraw_release` | Locked funds released back (rejected/failed withdrawal) |
| `withdraw_complete` | Withdrawal successfully paid out |
| `manual_adjustment` | Admin-initiated balance correction |

### `payout_provider`

The provider used when a creator withdraws funds to their bank or mobile wallet.

| Value | Description |
|---|---|
| `bkash` | bKash personal/merchant account |
| `nagad` | Nagad account |
| `rocket` | Rocket account |
| `bank` | Bank transfer (any bank) |

Note: `payout_provider` is **lowercase** by convention, unlike `provider_enum`.

### `withdrawal_status`

Lifecycle status for a withdrawal request.

| Value | Meaning |
|---|---|
| `requested` | User submitted the request; funds locked in wallet |
| `approved` | Admin approved; ready to process |
| `processing` | Transfer initiated to bank/mobile banking |
| `paid` | Successfully transferred |
| `rejected` | Admin rejected; funds returned to wallet balance |
| `failed` | Transfer attempt failed; funds returned to wallet balance |

### `transaction_direction_enum`

| Value | Meaning |
|---|---|
| `debit` | Money leaving the user's wallet (supporter paying, or creator withdrawing) |
| `credit` | Money entering the user's wallet (creator receiving payment) |

### `provider_enum`

Represents the payment gateway or internal wallet used to process a payment.

| Value | Description |
|---|---|
| `HobeNakiCoffee` | Internal platform wallet (wallet-to-wallet transfer) |
| `Bkash` | bKash mobile banking |
| `Nagad` | Nagad mobile banking |
| `Rocket` | Rocket mobile banking |
| `Upay` | Upay mobile banking |
| `SSLCommerz` | SSLCommerz payment gateway |
| `Aamarpay` | AamarPay payment gateway |
| `Portwallet` | PortWallet payment gateway |
| `Tap` | Tap Payments |
| `Other` | Any other provider |

When `provider = 'HobeNakiCoffee'`, the platform deducts from the **supporter's wallet** directly. All other providers represent external charges where no wallet deduction happens on the supporter side.

### `visibility_enum`

| Value | Meaning |
|---|---|
| `public` | Visible to anyone (anonymous + authenticated) |
| `private` | Visible only to the owning user |

---

## Helper Function: `handle_updated_at()`

A shared trigger function defined in `common.sql`. It automatically sets
`updated_at = now()` before any `UPDATE` on tables that attach the
`on_<table>_updated` trigger.

```sql
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.handle_updated_at() from public, anon, authenticated;
```

Execute is revoked from client-facing roles — this function is only invoked
internally by triggers. Every schema file that has an `updated_at` column
attaches this trigger; you do not need to set `updated_at` manually in
application code.

---

## Note

`notification_types` and `notification_preference_overrides` are defined in
`supabase/schemas/notifications.sql`, which loads after `profiles.sql`
(`notification_types.email_updated_by` references `profiles`).
