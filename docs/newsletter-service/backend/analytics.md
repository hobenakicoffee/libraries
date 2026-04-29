# Analytics Tables & Storage

## `newsletter_post_analytics_daily`

### Purpose

Time-series analytics bucketed by day. One row per (post, date) pair, upserted atomically by the RPCs that record events. Powers the chart in the Creator Studio Analytics dialog for a given post.

### Schema

```sql
CREATE TABLE public.newsletter_post_analytics_daily (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid    NOT NULL REFERENCES public.newsletter_posts(id) ON DELETE CASCADE,
  date       date    NOT NULL,
  views      integer NOT NULL DEFAULT 0 CHECK (views >= 0),
  clicks     integer NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  purchases  integer NOT NULL DEFAULT 0 CHECK (purchases >= 0),
  revenue    bigint  NOT NULL DEFAULT 0 CHECK (revenue >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_analytics_daily_unique UNIQUE (post_id, date)
);
```

### How Rows Are Written

No direct writes are allowed for authenticated users (the `Block direct writes` policy rejects all INSERTs). Every write goes through a `SECURITY DEFINER` RPC using `INSERT … ON CONFLICT … DO UPDATE`:

| Event | RPC | Columns incremented |
|---|---|---|
| Post viewed | `record_newsletter_post_view()` | `views` |
| Post clicked (CTA) | `record_newsletter_post_click()` | `clicks` |
| Post purchased | `purchase_newsletter_post()` | `purchases`, `revenue` |

Example upsert pattern (used in every event RPC):

```sql
INSERT INTO public.newsletter_post_analytics_daily (post_id, date, views)
VALUES (p_post_id, current_date, 1)
ON CONFLICT (post_id, date) DO UPDATE
  SET views      = newsletter_post_analytics_daily.views + 1,
      updated_at = now();
```

### `revenue` Column Unit

`revenue` stores **net amount** (gross payment minus platform fee) as a `bigint`. The unit is the smallest denomination of the local currency (e.g. paisa if BDT, cents if USD). Keep this in mind when displaying values — divide by 100 if your currency uses two decimal places.

> `revenue_total` on `newsletter_posts` uses the same convention.

### RLS Policies

| Policy | Roles | Rule |
|---|---|---|
| `Post owners view own analytics` | `authenticated` | The post must belong to `auth.uid()` |
| `Block direct writes` | `authenticated` | `WITH CHECK (false)` — all writes blocked |

### Index

```sql
idx_nl_analytics_post_date (post_id, date DESC)
```

Used by `get_post_analytics()` to efficiently fetch a date range for a given post.

---

## Storage — `post-images` Bucket

### Bucket Configuration

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,        -- public bucket: GET needs no auth token
  5242880,     -- 5 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);
```

Because the bucket is **public**, any uploaded image is accessible by URL without an auth token. This is intentional — post images are shown in the reader feed to unauthenticated visitors.

### Upload Path Convention

Authenticated users must upload into a folder named after their own `auth.uid()`:

```
post-images/{auth.uid()}/{filename}
```

The RLS policy enforces this:

```sql
WITH CHECK (
  bucket_id = 'post-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
```

This means a user can never overwrite another user's images.

### Storage RLS Policies

| Policy | Operation | Rule |
|---|---|---|
| `post-images: public read` | SELECT | `bucket_id = 'post-images'` (anon + authenticated) |
| `post-images: authenticated upload own folder` | INSERT | Folder must match `auth.uid()` |
| `post-images: authenticated update own files` | UPDATE | Folder must match `auth.uid()` |
| `post-images: authenticated delete own files` | DELETE | Folder must match `auth.uid()` |

### Orphan Cleanup

Images that are uploaded but not referenced by any post are deleted nightly by `cleanup_orphaned_post_images()`. An image is considered **referenced** if its URL appears in any of:

1. `newsletter_posts.cover_image_url` (exact match)
2. `newsletter_posts.content` (substring match — Markdown body)
3. `newsletter_post_versions.content` (version history ring buffer)

A **24-hour grace window** prevents race conditions where an image was just uploaded but the post hasn't been saved yet.

### Cron Schedule

```sql
SELECT cron.schedule(
  'nightly-cleanup-orphaned-post-images',
  '0 2 * * *',  -- 02:00 UTC = 08:00 BST/BDT
  $$ SELECT public.cleanup_orphaned_post_images(); $$
);
```

Requires the `pg_cron` extension to be enabled in your Supabase project.

### Base URL Derivation

The cleanup function does not hardcode the Supabase project URL. Instead, it derives the base URL at runtime from `storage.objects.metadata->>'httpUrl'`:

```sql
SELECT rtrim(metadata->>'httpUrl', '/' || name)
INTO v_base_url
FROM storage.objects
WHERE bucket_id = 'post-images'
  AND metadata->>'httpUrl' IS NOT NULL
LIMIT 1;
```

This means the function works correctly across local, staging, and production environments without any configuration changes.

---

**Next:** [Triggers & RLS Policies Reference](./triggers-and-rls.md)
