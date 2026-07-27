# Platform Settings — Backend Reference

## `platform_settings` table

Key-value JSONB store for platform configuration.

| Column | Type | Description |
|---|---|---|
| `key` | text PK | Setting key |
| `value` | jsonb | Setting value |
| `description` | text | Human-readable description |
| `updated_at` | timestamptz | Last modified |

## Existing Settings

| Key | Value | Description |
|---|---|---|
| `platform_fee_rate_gift` | `0.05` | 5% platform fee on gifts |
| `platform_fee_rate_newsletter_onetime` | `0.1` | 10% platform fee on one-time newsletter purchases |
| `platform_fee_rate_newsletter_subscription` | `0.8` | 8% platform fee on newsletter subscriptions (value is 0.8 = 8%, not 80%) |
| `platform_fee_rate_shop_digital` | `0.1` | 10% platform fee on digital shop items |
| `platform_fee_rate_shop_physical` | `0.05` | 5% platform fee on physical shop items |
| `founder_discount_fee_rate` | `0.035` | Platform fee rate applied to founder-discount creators (`is_founder_discount = true`) on all service types. Flat 3.5% across all services. Editable at runtime. |
| `cod_wallet_floor` | `-500` | Min wallet balance before auto-deactivation |
| `cod_settlement_max_days` | `30` | Max days for COD settlement |
| `default_shipping_fee_inside_dhaka` | `85` | Default shipping fee inside Dhaka |
| `default_shipping_fee_outside_dhaka` | `170` | Default shipping fee outside Dhaka |
| `default_processing_min_days` | `1` | Min processing days |
| `default_processing_max_days` | `15` | Max processing days |
| `withdrawal_daily_limit` | `0` | Max total BDT withdrawable per calendar day; `0` = unlimited |
| `withdrawal_monthly_limit` | `0` | Max total BDT withdrawable per calendar month; `0` = unlimited |
| `feed_milestones` | `{...}` | Feed milestone thresholds per creator metric |
| `company_legal_name` | `"HobeNakiCoffee"` | Legal entity name printed in the **From** block of generated invoices and receipts |
| `company_vat_bin` | `""` | VAT/BIN registration number printed on invoices. Empty = not VAT registered, and the invoice prints an explicit "VAT not applicable" note instead |
| `company_address` | `""` | Registered business address printed in the **From** block |

## API

| Function | Returns | Description |
|---|---|---|
| `get_platform_setting(key)` | `text` | Returns setting value as text. **Internal only** |
| `get_platform_setting_jsonb(key)` | `jsonb` | Returns setting value as JSONB (for milestone thresholds, etc.). **Internal only** |
| `get_company_identity()` | `jsonb` | Returns the three `company_*` keys as one object. Callable by `authenticated` |
| `upsert_platform_setting(key, value, description)` | `void` | Creates or updates a setting (manager only) |

### Client access

The `platform_settings` table is `revoke all ... from anon, authenticated`, and
both key-taking readers above are revoked from every client role — a reader that
accepts an arbitrary key would expose the fee and limit settings.

`get_company_identity()` is the single exception, and the only settings reader
granted to `authenticated`. It takes no argument and hard-codes
`company_legal_name` / `company_vat_bin` / `company_address`, so it cannot be
steered at anything else. The
[generate-transaction-document](../../edge-functions/backend/generate-transaction-document)
Edge Function calls it on its caller-scoped client to fill the seller block on
transactions that carry no frozen `metadata->'invoice'` snapshot — which is every
gift, shop and newsletter row. Without it those receipts print no business
address and no VAT/BIN, and never reflect an admin edit to these settings.

`supabase/tests/019_platform_settings_test.sql` asserts the grant, the exact key
set, and that `anon` still cannot execute it.
