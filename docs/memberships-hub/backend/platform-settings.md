# Platform Settings

`platform_settings` is a key-value store for platform-wide configuration. Values are managed by admins via service role only — no client writes are permitted.

## Table Schema

```sql
create table public.platform_settings (
  key         varchar(100) primary key,
  value       jsonb        not null,
  description text,
  updated_at  timestamptz  not null default now()
);
```

Values are `jsonb` to support scalars (`"50"`), arrays, and objects. All current values are numeric scalars stored as `jsonb` strings.

## All Settings

### Financial

| Key | Default Value | Description |
|---|---|---|
| `platform_fee_percentage` | `10` | Platform fee (%) deducted from all creator payouts. Applied to gifts, subscriptions, and one-time purchases. |
| `default_coffee_price` | `20` | Default price per coffee unit in BDT. Used as the fallback when a creator has not set a custom coffee price. |
| `max_gift_amount` | `1000000` | Maximum single gift amount in BDT (1 million). Enforced at transaction validation time. |

### Feed & Boost

| Key | Default Value | Description |
|---|---|---|
| `feed_boost_price_per_day` | `50` | Daily cost in BDT for boosting a feed item. Deducted from creator wallet each day a campaign is active. |
| `feed_item_max_age_days` | `90` | Maximum lifetime of a feed item in days. Items older than this are expired and deleted. |
| `feed_cache_active_user_window_days` | `7` | Days of inactivity after which a user is excluded from feed cache rebuilds. |
| `feed_boost_min_days` | `1` | Minimum number of days a creator can configure for a boost campaign. |
| `feed_boost_max_days` | `90` | Maximum number of days a creator can configure for a boost campaign. |

## Reading a Setting in an RPC

Use the `get_platform_setting()` helper, or query directly:

```sql
-- Via helper (returns jsonb)
select public.get_platform_setting('feed_boost_price_per_day');
-- Returns: "50"  (jsonb)

-- Cast to the correct type
select public.get_platform_setting('feed_boost_price_per_day')::numeric;
-- Returns: 50

-- Or query directly with a default fallback
select coalesce(
  (select value::numeric from public.platform_settings where key = 'feed_boost_price_per_day'),
  50
) as price;
```

**Always include a fallback.** If a key is missing (e.g. after a fresh migration before seeding), the fallback prevents the RPC from failing.

## Reading a Setting from the Frontend

Settings are readable by authenticated and anonymous users (RLS allows SELECT for both roles). You can read them directly from the client when needed — for example, to display the boost price before a creator confirms:

```typescript
const { data } = await supabase
  .from('platform_settings')
  .select('value')
  .eq('key', 'feed_boost_price_per_day')
  .single()

const pricePerDay = Number(data?.value) // 50
```

Or fetch multiple settings at once:

```typescript
const { data: settings } = await supabase
  .from('platform_settings')
  .select('key, value')
  .in('key', ['feed_boost_price_per_day', 'feed_boost_min_days', 'feed_boost_max_days'])

const settingsMap = Object.fromEntries(settings.map(s => [s.key, Number(s.value)]))
// { feed_boost_price_per_day: 50, feed_boost_min_days: 1, feed_boost_max_days: 90 }
```

## Updating a Setting

Settings can only be updated via service role (admin operations). Never expose this to clients.

```typescript
// Server-side / admin panel only (uses service role key)
const { error } = await supabaseAdmin
  .from('platform_settings')
  .update({ value: '75' })
  .eq('key', 'feed_boost_price_per_day')
```

Changes take effect immediately for new operations. In-progress boost campaigns use the `daily_budget` value that was locked in at launch time — changing `feed_boost_price_per_day` does not retroactively affect running campaigns.

## Adding a New Setting

Add to the seed block in `platform_settings.sql`:

```sql
insert into public.platform_settings (key, value, description) values
(
  'my_new_setting',
  '"some_value"'::jsonb,
  'Description of what this controls and where it is used.'
)
on conflict (key) do nothing;  -- safe to re-run
```

Then read it in your RPC with a fallback:

```sql
select coalesce(
  (select value::text from public.platform_settings where key = 'my_new_setting'),
  'default_value'
);
```
