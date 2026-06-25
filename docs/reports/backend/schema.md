# Reports — Backend Schema

## `creator_reports` Table

The `creator_reports` table stores aggregated creator earnings data for the Reports dashboard. It is updated by the `update_creator_monthly_report()` trigger function whenever a related transaction occurs.

```sql
create table public.creator_reports (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  total_earnings numeric(12,2) not null default 0,
  total_fees numeric(12,2) not null default 0,
  net_earnings numeric(12,2) not null default 0,
  gift_earnings numeric(12,2) not null default 0,
  gift_fees numeric(12,2) not null default 0,
  membership_earnings numeric(12,2) not null default 0,
  membership_fees numeric(12,2) not null default 0,
  shop_earnings numeric(12,2) not null default 0,
  shop_fees numeric(12,2) not null default 0,
  newsletter_earnings numeric(12,2) not null default 0,
  newsletter_fees numeric(12,2) not null default 0,
  supporter_count int not null default 0,
  transaction_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, year, month)
);
```

## RPCs

### `get_creator_report(p_year int, p_month int)`

Returns the current authenticated creator's report for a given year/month. Returns a `creator_reports` row or null if no data yet.

### `get_creator_report_summary(p_year int default null)`

Returns year-to-date aggregate (or full history if year is null) for the current creator:
- Total earnings, fees, net earnings
- Per-service-type breakdown (gifts, memberships, shop, newsletter)
- Supporter count, transaction count

## Triggers

### `update_creator_monthly_report()`

Called after INSERT/UPDATE on `transactions`. Accumulates earnings/fees into the correct `(profile_id, year, month)` row. Uses `ON CONFLICT (profile_id, year, month) DO UPDATE` for idempotent accumulation.

## Related Docs

- [Reports Overview](/reports/frontend/) — Frontend reporting features
- [Transactions](/payments-and-memberships/backend/transactions) — Transaction ledger
