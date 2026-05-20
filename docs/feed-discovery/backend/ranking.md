# Ranking

Feed items are ranked by a `rank_score` column recomputed every 30 minutes by a `pg_cron` job. Pinned items bypass ranking and always appear first.

## Rank Score Formula

```
rank_score = recency_decay × boost_multiplier + engagement_score

recency_decay    = 1 / (1 + hours_since_published ^ 1.5)
engagement_score = likes × 1.0 + comments × 2.0 + bookmarks × 1.5 + shares × 3.0
```

A fresh item with no interactions scores approximately `1.0 × boost_multiplier`. Score decays over time and rises with engagement.

## Boost Tiers

Creators on active `creator_platform_subscriptions` receive a boost multiplier applied to their `rank_score`. The tier is derived from `platform_subscription_plans.sort_order`:

| Sort order | Tier | Boost multiplier | Plan name |
|---|---|---|---|
| — (no active subscription) | 0 | 1.0× | — |
| 0 | 1 | 1.8× | Basic |
| 1 | 2 | 3.0× | Pro |
| 2 | 3 | 5.0× | Ultra |

A creator with multiple active subscriptions across different service types receives the **highest tier** across all of them.

`boost_tier` is stored on each `feed_item` row and synced during every ranking cycle.

## Special Cases

**Pinned items** (`is_pinned = true`) — skipped by `recompute_feed_rank_scores()`. They are always returned first by `get_feed()` via `ORDER BY is_pinned DESC`. Only managers can pin items.

**System milestones and announcements** — inserted with a high initial `rank_score` (1000–2000) to surface immediately on creation, then decay normally on subsequent ranking cycles.

## `recompute_feed_rank_scores()`

This SECURITY DEFINER function runs three sequential UPDATE statements:

1. **Sync boost_tier** — joins `creator_platform_subscriptions` with `platform_subscription_plans` and updates `boost_tier` for all public, non-null-creator feed items.

2. **Recount interaction_counts** — recounts from `feed_item_likes`, `feed_item_comments`, `feed_item_bookmarks`, `feed_item_shares` for all public feed items. This corrects any counter-cache drift.

3. **Recompute rank_score** — applies the formula above to all public, non-pinned feed items.

The function is revoked from `public`, `anon`, and `authenticated`. It is only callable via service role or `pg_cron`.

## pg_cron Schedule

The cron job cannot be registered in the declarative schema (shadow-DB limitation). Register it once manually after enabling the `pg_cron` extension in the Supabase dashboard:

```sql
select cron.schedule(
  'recompute-feed-rank-scores',
  '*/30 * * * *',
  $$select public.recompute_feed_rank_scores()$$
);
```

To inspect the schedule:
```sql
select * from cron.job where jobname = 'recompute-feed-rank-scores';
```

To disable:
```sql
select cron.unschedule('recompute-feed-rank-scores');
```

## Feed Query Order

```sql
ORDER BY is_pinned DESC, rank_score DESC, id DESC
```

`id DESC` is the tiebreaker — newer items win when scores are equal.

## Cursor Pagination

`get_feed()` uses keyset pagination on `(rank_score, id)` to avoid inconsistent results when scores shift between ranking cycles:

```sql
WHERE (rank_score < p_cursor_score)
   OR (rank_score = p_cursor_score AND id < p_cursor_id)
```

Pass both `p_cursor_score` and `p_cursor_id` from the last item on the previous page.
