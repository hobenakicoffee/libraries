# Day 19 — Full-Text Search with `tsvector` / `tsquery`

## Goal

By the end of today you understand how PostgreSQL's full-text search works, and can read (and extend) the `search_feed` RPC in `feed.sql` and the search indexes in `newsletter_service.sql` and `managers.sql`.

---

## Resources

- [PostgreSQL: Full Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [PostgreSQL: Controlling Text Search](https://www.postgresql.org/docs/current/textsearch-controls.html)
- [pg_trgm extension](https://www.postgresql.org/docs/current/pgtrgm.html)

---

## Why this matters

The "search" feature on the explore/feed page (`search_feed` in `feed.sql`) and newsletter post search (`newsletter_service.sql`) are both built on PostgreSQL full-text search, not `LIKE '%...%'`. `LIKE` with a leading `%` can't use a normal index and gets slow on large tables. Full-text search is purpose-built for "find rows containing these words" and stays fast at scale.

---

## The problem with `ILIKE '%query%'`

```sql
-- works, but can't use a normal index — full table scan
SELECT * FROM public.feed_items WHERE metadata->>'title' ILIKE '%coffee%';
```

This matches substrings anywhere, has no concept of "word", can't rank results by relevance, and (without a trigram index) requires scanning every row. Full-text search solves "does this document contain these *words*, and how relevant is it?" — a fundamentally different and more powerful question.

---

## `tsvector` — a searchable representation of text

A `tsvector` is text broken into normalized **lexemes** (word forms) with position information.

```sql
SELECT to_tsvector('simple', 'The quick brown fox jumps');
-- 'brown':3 'fox':4 'jumps':5 'quick':2 'the':1
```

Notice: lowercase, words tracked with their position. With the `'simple'` config (no stemming), `'jumps'` stays `'jumps'`. With `'english'` config, `to_tsvector('english', 'jumps')` would become `'jump'` (stemmed) and common words ("the") would be removed as stopwords.

### Why this project uses `'simple'`, not `'english'`

From `feed.sql`:

```sql
NEW.search_vector := to_tsvector('simple',
  coalesce(NEW.metadata->>'title',   '') || ' ' ||
  coalesce(NEW.metadata->>'excerpt', '') || ' ' ||
  v_creator_name                         || ' ' ||
  coalesce(NEW.content_type, '')
);
```

The comment in the schema explains: **`'simple'` dictionary: no stemming — correct for Bangla, fine for English with trigrams**. The `'english'` config's stemming rules (e.g. "running" → "run") are English-specific and would mangle Bangla text. `'simple'` just lowercases and tokenizes — language-neutral. The trigram index (below) picks up the slack for fuzzy/partial English matches.

---

## `tsquery` — the search query

A `tsquery` represents what you're searching *for*, with boolean operators (`&` = AND, `|` = OR, `!` = NOT, `<->` = followed by).

```sql
SELECT to_tsquery('simple', 'coffee & shop');   -- 'coffee' AND 'shop'
SELECT websearch_to_tsquery('simple', 'coffee shop -tea');  -- google-style syntax
```

### `websearch_to_tsquery` — used by `search_feed`

```sql
with q as (
  select websearch_to_tsquery('simple', p_query) as tsq
)
```

`websearch_to_tsquery` parses input the way a search engine does: plain words become `&` (AND), quoted phrases become `<->` (phrase search), and `-word` becomes `!word` (exclude). It **never errors on malformed input** (unlike `to_tsquery`, which requires strict operator syntax) — critical when `p_query` comes directly from user input.

> **Never use `to_tsquery` directly on raw user input** — a query like `"coffee &"` is invalid syntax for `to_tsquery` and will raise an error. `websearch_to_tsquery` and `plainto_tsquery` handle arbitrary user text safely.

---

## `@@` — the match operator

```sql
fi.search_vector @@ q.tsq
```

Returns `true` if the `tsvector` matches the `tsquery`. This is the core of the `WHERE` clause in `search_feed`:

```sql
where fi.visibility = 'public'
  and (
    fi.search_vector @@ q.tsq
    or (fi.metadata->>'title') ilike '%' || p_query || '%'
  )
```

Two strategies combined with `OR`:
1. **Full-text match** (`@@`) — fast, word-aware, works well for English and Bangla tokens.
2. **Trigram `ILIKE` fallback** — catches partial-word matches that full-text search would miss (e.g., searching `"coff"` won't match the lexeme `"coffee"` via `@@`, but `ILIKE '%coff%'` will).

---

## `ts_rank` — relevance ranking

```sql
ts_rank(fi.search_vector, q.tsq) as search_rank
```

`ts_rank` returns a numeric relevance score based on how well the document matches the query (frequency and proximity of matched lexemes). `search_feed` orders by this:

```sql
order by
  (case when fi.search_vector @@ q.tsq then 1 else 0 end) desc,
  search_rank desc,
  fi.rank_score desc
```

Read this `ORDER BY` as: **(1) true full-text matches first, (2) most relevant of those first, (3) tie-broken by the item's own `rank_score`** (a separate, app-defined popularity score — nothing to do with text search).

---

## Indexing a `tsvector` — GIN index

A `tsvector` column is only fast to search if it has a **GIN index** (Generalized Inverted Index) — covered briefly on Day 5, here's the full-text-specific use:

```sql
create index idx_feed_items_search_vector
  on public.feed_items using gin(search_vector)
  where visibility = 'public';
```

This is also a **partial index** (Day 5) — it only indexes public feed items, since `search_feed` only ever searches `visibility = 'public'` rows. Smaller index, faster queries, less disk space.

### Keeping `search_vector` up to date — trigger

`tsvector` columns don't update themselves. This project uses a `BEFORE INSERT OR UPDATE` trigger (Day 6):

```sql
create or replace function public.handle_feed_item_search_vector()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_creator_name text := '';
begin
  if NEW.creator_profile_id is not null then
    select coalesce(display_name, username, '')
    into v_creator_name
    from public.profiles
    where id = NEW.creator_profile_id;
  end if;

  NEW.search_vector := to_tsvector('simple',
    coalesce(NEW.metadata->>'title',   '') || ' ' ||
    coalesce(NEW.metadata->>'excerpt', '') || ' ' ||
    v_creator_name                         || ' ' ||
    coalesce(NEW.content_type, '')
  );

  return NEW;
end;
$$;

create trigger on_feed_item_search_vector_update
before insert or update on public.feed_items
for each row
execute procedure public.handle_feed_item_search_vector();
```

Every time a feed item is inserted or updated, this trigger recomputes `search_vector` from the current title, excerpt, creator name, and content type — so search results always reflect the latest data, with zero extra application code.

---

## Trigram indexes (`pg_trgm`) — the fallback partner

```sql
create extension if not exists pg_trgm;

-- GIN trigram index on title for fuzzy/partial match fallback (covers Bangla)
create index idx_feed_items_title_trgm
  on public.feed_items using gin((metadata->>'title') gin_trgm_ops)
  where visibility = 'public';
```

A trigram index breaks text into overlapping 3-character sequences ("coffee" → `"  c"`, `" co"`, `"cof"`, `"off"`, `"ffe"`, `"fee"`, `"ee "`). This lets `ILIKE '%coff%'` use the index instead of a full scan — the OR-fallback in `search_feed`'s `WHERE` clause relies on this index existing, otherwise that `ILIKE` would be slow.

This is the same `gin_trgm_ops` index type used for manager email/name search (Day 5, `managers.sql`).

---

## Putting it together: the full picture

For `feed_items`, two indexes work together:

| Index | Type | Catches |
|-------|------|---------|
| `idx_feed_items_search_vector` | GIN on `tsvector`, partial (`visibility='public'`) | Whole-word matches, ranked by relevance |
| `idx_feed_items_title_trgm` | GIN trigram, partial | Partial/fuzzy substring matches in the title |

`search_feed` queries both via `OR`, ranks full-text matches higher, and falls back to substring matches for queries that don't tokenize well (typos, partial words, short Bangla fragments).

---

## Exercises

1. Run this in your local Supabase SQL editor and explain the output in your own words:
   ```sql
   SELECT to_tsvector('simple', 'Hobenaki Coffee Shop — Buy Me A Coffee');
   SELECT websearch_to_tsquery('simple', 'coffee shop -tea');
   SELECT to_tsvector('simple', 'Hobenaki Coffee Shop') @@ websearch_to_tsquery('simple', 'coffee shop -tea');
   ```

2. Open `supabase/schemas/feed.sql` and find the `search_vector` column definition on `feed_items`. Is it a generated column (Day 5) or populated by a trigger? Why might the project have chosen one over the other?

3. Open `supabase/schemas/newsletter_service.sql` and find the trigram indexes on `newsletter_posts` (`title`, `subtitle`). Does `newsletter_posts` have a `tsvector`/GIN full-text index like `feed_items` does, or does it rely only on trigram `ILIKE`? What's the tradeoff?

4. `EXPLAIN ANALYZE` this query locally and check whether it uses `idx_feed_items_search_vector`:
   ```sql
   SELECT id FROM public.feed_items
   WHERE visibility = 'public'
     AND search_vector @@ websearch_to_tsquery('simple', 'coffee');
   ```

5. A user searches for `"কফি"` (Bangla for "coffee"). Walk through `search_feed`'s `WHERE` clause and explain which of the two strategies (`@@` full-text match or `ILIKE` trigram fallback) is more likely to find a feed item titled `"আমার কফি শপ"`. Why?

6. Why does `search_feed` use `cross join q` instead of just inlining `websearch_to_tsquery('simple', p_query)` directly into the `WHERE` and `ORDER BY` clauses? (Hint: think about how many times the expression would otherwise need to be written, and whether PostgreSQL is guaranteed to compute it only once.)
