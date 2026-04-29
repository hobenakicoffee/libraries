# Helpers & Eligibility RPCs

These two functions are used internally by almost every other RPC. You'll rarely call them directly, but understanding them is essential before reading the checkout and COD pages.

## `get_platform_setting`

```sql
public.get_platform_setting(p_key varchar) → numeric
```

Reads a single row from `platform_settings` and casts the JSONB value to `numeric`. Used internally by checkout (to read `platform_fee_rate`) and eligibility checks (to read `cod_wallet_floor` and `cod_settlement_max_days`).

```sql
-- Internal usage examples:
v_rate     := public.get_platform_setting('platform_fee_rate');    -- → 0.10
v_floor    := public.get_platform_setting('cod_wallet_floor');     -- → -500
v_max_days := public.get_platform_setting('cod_settlement_max_days')::integer; -- → 30
```

::: warning Not for client use
Never call this from the frontend. Platform config values are snapshotted onto order rows at checkout (`platform_fee_rate`) or returned inside `get_shop_overview().eligibility`. The client should display but never trust values it sends to the server.
:::

---

## `check_shop_active_eligibility`

```sql
public.check_shop_active_eligibility(p_profile_id uuid) → jsonb
```

The single source of truth for whether a seller can keep their shop active and accept COD orders. Called by:

- `initiate_shop_checkout` (COD path) — blocks checkout if ineligible
- `upsert_shop_settings` (reactivation path) — blocks `is_active = true` if ineligible
- `auto_deactivate_ineligible_shops` (cron) — iterates all active shops nightly

### Response shape

```json
{
  "eligible": true,
  "reasons": [],
  "wallet_balance": 1200.00,
  "cod_debt": 0.00,
  "wallet_floor": -500,
  "aged_cod_orders": 0,
  "settlement_max_days": 30
}
```

When ineligible, `eligible` is `false` and `reasons` contains one or both of:

| Reason | Condition |
|---|---|
| `"wallet_below_floor"` | `(wallet.balance − wallet.cod_debt) < cod_wallet_floor` |
| `"cod_aging"` | Any COD order has unsettled `shipped`/`delivered` items older than `cod_settlement_max_days` |

### Example — ineligible response

```json
{
  "eligible": false,
  "reasons": ["wallet_below_floor", "cod_aging"],
  "wallet_balance": 200.00,
  "cod_debt": 800.00,
  "wallet_floor": -500,
  "aged_cod_orders": 3,
  "settlement_max_days": 30
}
```

In this example:
- `200 − 800 = −600`, which is below the −500 floor → `wallet_below_floor`
- 3 COD orders have aged past 30 days without cash confirmation → `cod_aging`

### Implementation detail

```sql
-- Wallet check
if (v_balance - v_cod_debt) < v_floor then
  v_reasons := array_append(v_reasons, 'wallet_below_floor');
end if;

-- COD aging check
select count(*) into v_aged_count
from public.shop_orders so
join public.shop_order_items soi on soi.order_id = so.id
where so.seller_profile_id = p_profile_id
  and so.payment_method    = 'cod'
  and so.cod_settled_at    is null
  and soi.status           in ('shipped', 'delivered')
  and soi.cod_settled_at   is null
  and so.created_at        < now() - (v_max_days || ' days')::interval;
```

If the seller has no wallet row yet (brand-new seller), they are treated as `balance = 0, cod_debt = 0` — eligible by default.
