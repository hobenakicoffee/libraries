# Explore Page — Backend Overview

The **Explore** feature lets any visitor browse, search, and filter the creator directory. This section covers the schema additions and RPC that power it.

## What Was Added

Three new columns on `public.profiles`, one trigger on `public.supporters`, and one public RPC:

| Addition | Purpose |
|---|---|
| `profiles.categories text[]` | Creator-selected topic tags (e.g. "Tech", "Comedy") |
| `profiles.total_supporter_count bigint` | Denormalized count of unique supporters |
| `profiles.popularity_score bigint GENERATED` | `follower_count + (total_supporter_count * 5)` — sort key |
| `handle_supporter_count_change()` trigger | Keeps `total_supporter_count` in sync on `supporters` insert/delete |
| `get_explore_creators(...)` RPC | Paginated, filtered, sorted creator list |

## Who Counts as a Creator?

There is no explicit `is_creator` boolean. The explore query filters on two existing flags:

```sql
WHERE has_first_service = true
  AND is_page_active = true
```

A user becomes a creator the moment they enable their first service (gift, newsletter, shop, etc.). `is_page_active = false` hides a creator from the explore page (used by moderation).

## Popularity Score

```
popularity_score = follower_count + (total_supporter_count × 5)
```

Supporters are weighted 5× because they represent a money-backed intent — a much stronger signal than a free follow. The column is a `GENERATED ALWAYS AS ... STORED` expression, so it is always current and can be indexed with no extra maintenance.

A partial index covers only active creators:

```sql
create index idx_profiles_popularity on public.profiles(popularity_score desc, id desc)
  where has_first_service = true and is_page_active = true;
```

## Categories

`categories` is a `text[]` column. Values are free-form strings set by the creator during onboarding or profile editing (e.g. `'Tech'`, `'Comedy'`, `'Business'`, `'Podcast'`). There is no server-enforced enum — validation is the frontend's responsibility.

A GIN index makes single-category filtering fast:

```sql
create index idx_profiles_categories on public.profiles using gin(categories);
```

Filter usage in the RPC:

```sql
p_category = any(p.categories)
```

## Supporter Count Trigger

`total_supporter_count` is maintained by a trigger on `public.supporters`:

- **INSERT** → increments the creator's count by 1
- **DELETE** → decrements by 1 (floors at 0 via `greatest(... , 0)`)
- **UPDATE** — not fired; supporter rows are upserted, not re-created

The trigger function lives in `profiles.sql`; the `CREATE TRIGGER` statement lives in `supporters.sql` (where the firing table is defined).

## Table of Contents

| Page | What you'll learn |
|---|---|
| [RPC: get_explore_creators](./rpc-get-explore-creators) | Parameters, return shape, pagination, search, filtering |
