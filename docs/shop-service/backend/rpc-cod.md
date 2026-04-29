# COD & Wallet Debt RPCs

These RPCs handle the cash-on-delivery settlement flow. Read [Design Decisions #5, #6, and #14](./) first if you haven't already — this page assumes you understand the COD lifecycle and `cod_debt` model.

## COD lifecycle recap

```
Checkout     → items in 'processing' (stock already decremented)
Seller ships → update_order_tracking() → 'shipped'
Delivery     → mark_order_item_delivered() → 'delivered'
Cash in hand → confirm_cod_cash_received() → platform fee debited, transaction row created
                                              → item.cod_settled_at set
                                              → (if last item) order.cod_settled_at set
```

Cancellation is possible from `processing`, `shipped`, or `delivered` — as long as `cod_settled_at` is still null.

---

## `confirm_cod_cash_received`

```sql
public.confirm_cod_cash_received(p_order_item_id uuid) → jsonb
```

The seller confirms they've collected the buyer's cash for one order item. Debits the platform fee from the seller's wallet.

### Pre-conditions

- Order must be `payment_method = 'cod'` → else `NOT_COD_ORDER`
- Item must be `status = 'delivered'` → else `INVALID_STATUS_TRANSITION`
- Item must not already have `cod_settled_at` set → else returns `{ idempotent: true }`

### Fee calculation

```sql
item_total := (unit_price + shipping_cost) * quantity
fee        := round(item_total * order.platform_fee_rate, 2)
```

The `platform_fee_rate` was snapshotted on the order at checkout — it doesn't re-read from `platform_settings`. Historical orders always reflect the rate in effect when they were placed.

### Wallet debit logic

```sql
if balance >= fee then
  -- Debit entirely from balance
  balance  -= fee
  cod_debt += 0
else
  -- Balance is too low; take what's available and accumulate the rest as debt
  balance  -= balance          -- may go to 0
  cod_debt += (fee - balance)
end if
```

This preserves the `CHECK (balance >= 0)` constraint on `wallets` at all times.

### What a settled item looks like

```sql
-- shop_order_items
status         = 'delivered'
cod_settled_at = '2024-01-15 14:30:00+06'

-- shop_orders (set when the last item in the order is settled)
cod_settled_at = '2024-01-15 14:30:00+06'
```

### Transaction row created

```sql
insert into public.transactions (
  service_type = 'shop',
  direction    = 'debit',
  amount       = fee,
  platform_fee = fee,
  net_amount   = 0,
  status       = 'completed',
  provider     = 'HobeNakiCoffee',
  metadata     = {
    "kind":           "shop_cod_platform_fee",
    "order_item_id":  "...",
    "order_number":   "SHOP-20240115-A3F2",
    "fee_rate":       0.10,
    "item_total":     1820.00,
    "balance_debit":  182.00,
    "cod_debt_added": 0.00
  }
)
```

### Response

```json
{
  "success": true,
  "transaction_id": "uuid",
  "fee_amount": 182.00,
  "balance_debit": 182.00,
  "cod_debt_added": 0.00,
  "order_settled": true
}
```

When `cod_debt_added > 0`, the frontend should show a warning telling the seller to top up their wallet.

**Errors:** `NOT_FOUND`, `NOT_COD_ORDER`, `INVALID_STATUS_TRANSITION`

---

## `cancel_cod_order_item`

```sql
public.cancel_cod_order_item(
  p_order_item_id uuid,
  p_reason        text
) → jsonb
```

Seller cancels a COD item with a mandatory reason. The reason is visible to the buyer on the order detail page.

### Pre-conditions

- `p_reason` must be non-empty → else `CANCELLATION_REASON_REQUIRED`
- Order must be `payment_method = 'cod'` → else `NOT_COD_ORDER`
- Item status must be `processing`, `shipped`, or `delivered` → else `INVALID_STATUS_TRANSITION`
- Item must not be settled (`cod_settled_at IS NULL`) → else `ALREADY_SETTLED`

### What it does

1. Sets `status = 'cancelled'`, `cancellation_reason = p_reason`
2. **Restocks** the product/variant: `stock_count += item.quantity`
3. No platform fee is charged on cancelled COD items

::: warning Restocking only works when stock_count IS NOT NULL
If `stock_count` is `null` (unlimited), restocking is skipped silently. This is intentional — unlimited-stock products don't need restock tracking.
:::

### Cancellation reason guidance

The reason is shown verbatim to the buyer. Encourage sellers to be specific:

| Good | Avoid |
|---|---|
| "Out of stock — restocking in 2 weeks" | "Cancelled" |
| "Unable to ship to your location" | "Sorry" |
| "Order placed by mistake — please reorder" | — |

**Errors:** `CANCELLATION_REASON_REQUIRED`, `NOT_FOUND`, `NOT_COD_ORDER`, `INVALID_STATUS_TRANSITION`, `ALREADY_SETTLED`

---

## `topup_seller_cod_debt`

```sql
public.topup_seller_cod_debt(
  p_profile_id uuid,
  p_amount     numeric
) → jsonb
```

Applies a topup amount to the seller's `cod_debt` before crediting their wallet `balance`. **Must be called first** in the wallet topup flow before any balance credit.

### Why this matters

If a seller has `cod_debt = 700` and tops up `৳1000`:

```
topup_seller_cod_debt(profile_id, 1000)
  → { debt_paid: 700, remaining: 300 }

-- Then credit balance:
UPDATE wallets SET balance = balance + 300 ...
```

Without this step, the seller would get `৳1000` added to their balance while still owing `৳700` — effectively letting them defer platform fees indefinitely.

### Response

```json
{
  "success": true,
  "debt_paid": 700.00,
  "remaining": 300.00
}
```

When `cod_debt = 0`, `debt_paid = 0` and `remaining = p_amount` — the entire amount goes to balance as usual.

**Errors:** `INVALID_AMOUNT` (when `p_amount ≤ 0`)

---

## Eligibility effects

After `confirm_cod_cash_received` settles an aged COD order, the seller may immediately become eligible again. The Studio should:

1. Invalidate the `eligibility` query after every cash confirmation
2. Show the reactivation button if the shop is currently inactive but eligibility is now `true`

The `check_shop_active_eligibility` helper computes this fresh on every call — no need to track state client-side.

---

## Wallet floor diagram

```
                 wallet.balance     wallet.cod_debt
                 ─────────────      ───────────────
New seller:          0                    0
After COD order placed:
  (no change yet — fee debited on cash confirmation)
After cash confirmed (balance enough):
  balance ≥ fee:    -fee                  (unchanged)
After cash confirmed (balance too low):
  balance < fee:    → 0              +(fee - balance)
After wallet topup ৳1000, cod_debt = 700:
  call topup_seller_cod_debt()       -700
  credit balance += 300:            +300

Eligibility check:
  eligible when (balance - cod_debt) >= cod_wallet_floor (-500)
```
