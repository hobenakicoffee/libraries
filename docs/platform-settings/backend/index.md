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
| `cod_wallet_floor` | `-500` | Min wallet balance before auto-deactivation |
| `cod_settlement_max_days` | `30` | Max days for COD settlement |
| `default_shipping_fee_inside_dhaka` | `85` | Default shipping fee inside Dhaka |
| `default_shipping_fee_outside_dhaka` | `170` | Default shipping fee outside Dhaka |
| `default_processing_min_days` | `1` | Min processing days |
| `default_processing_max_days` | `15` | Max processing days |

## API

| Function | Returns | Description |
|---|---|---|
| `get_platform_setting(key)` | `text` | Returns setting value as text |
| `get_platform_setting_jsonb(key)` | `jsonb` | Returns setting value as JSONB (for milestone thresholds, etc.) |
| `upsert_platform_setting(key, value, description)` | `void` | Creates or updates a setting (manager only) |
