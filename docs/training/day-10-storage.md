# Day 10 — Storage Buckets and Storage RLS

## Goal

By the end of today you understand how Supabase Storage works, how to define buckets in SQL, how to apply RLS to storage objects, and how this project manages avatar and banner uploads.

---

## Resources

- [Supabase Storage overview](https://supabase.com/docs/guides/storage)
- [Supabase Storage: Access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Storage: RLS policies](https://supabase.com/docs/guides/storage/security/access-control#policy-examples)
- [Supabase Storage JS client](https://supabase.com/docs/reference/javascript/storage-createbucket)
- [Supabase: storage helper functions](https://supabase.com/docs/guides/storage/security/access-control#helper-functions)

---

## What is Supabase Storage?

Supabase Storage is a file storage system backed by an S3-compatible object store. Files are organized into **buckets**, and access to each file is controlled by RLS policies on the `storage.objects` table — the same RLS system you learned on Day 8.

Key concepts:
- **Bucket** — a container for files (like a folder at the top level)
- **Object** — a file stored in a bucket, at a path like `avatars/user-uuid/photo.jpg`
- **Public bucket** — objects are publicly readable via URL without auth
- **Private bucket** — objects require authentication and passing RLS policies to read

---

## Defining buckets in SQL

Buckets are created with an INSERT into `storage.buckets`. This project does it in the schema files so buckets are version-controlled alongside the tables that use them.

From `supabase/schemas/profiles.sql`:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,                     -- publicly readable
  2097152,                  -- 2 MB max file size
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;  -- idempotent: safe to run twice
```

| Column | Meaning |
|--------|---------|
| `id` | Unique bucket identifier |
| `name` | Display name |
| `public` | If true, objects are publicly accessible via URL |
| `file_size_limit` | Max file size in bytes (2 MB = 2 × 1024 × 1024) |
| `allowed_mime_types` | Whitelist of allowed file types (security: prevents uploading .exe) |

---

## Storage RLS: the `storage.objects` table

Every file uploaded is a row in `storage.objects`. RLS policies on this table control who can upload, read, update, and delete files.

Supabase provides helper functions for storage policies:

| Helper | What it does |
|--------|-------------|
| `storage.foldername(name)` | Returns the path components as an array. `storage.foldername('avatars/uuid/photo.jpg')` → `['avatars', 'uuid']` |
| `storage.filename(name)` | Returns just the filename: `'photo.jpg'` |
| `bucket_id` | The bucket the object belongs to |
| `owner` | The UUID of the user who uploaded the file |

---

## The avatar/banner storage policies

From `supabase/schemas/profiles.sql`:

### Upload policy (INSERT)

```sql
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
```

This enforces that:
1. The file goes into the `avatars` bucket
2. The **first folder** in the path must be the user's own UUID

So `auth.uid()/photo.jpg` is allowed. `some-other-uuid/photo.jpg` is denied.

This means files are stored at: `avatars/{user-uuid}/filename.jpg`

### Read policy (SELECT)

```sql
CREATE POLICY "Users can read their own avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
```

Wait — but the bucket is `public = true`. So why is there a SELECT policy?

A **public bucket** means the file URLs are publicly accessible via the CDN URL (no auth header needed). But the `storage.objects` table rows still respect RLS when you query them via the Supabase API (`supabase.storage.from('avatars').list(...)`). The SELECT policy scopes which files a user can list/manage through the API, even though anyone can access the CDN URL directly.

### Update/Delete policies

```sql
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (SELECT auth.uid()) = owner)
WITH CHECK (bucket_id = 'avatars' AND (SELECT auth.uid()) = owner);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (SELECT auth.uid()) = owner);
```

These use the `owner` column (set automatically to `auth.uid()` at upload time). Update and delete require being the owner.

### Admin override

```sql
CREATE POLICY "Admins can upload any avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND public.is_admin());
```

Admins can manage any user's avatars — needed for moderation.

---

## Public vs private buckets

| Bucket | `public` | Who can read via URL | Who can manage via API |
|--------|----------|---------------------|----------------------|
| `avatars` | true | Anyone (no auth) | Owner + admins |
| `banners` | true | Anyone (no auth) | Owner + admins |
| Shop files | false | Only authenticated buyer/seller | Owner + admins |

A public bucket is appropriate for profile images and banners — these should be visible to anyone viewing a creator's page. Shop files (like digital downloads) are private buckets controlled by purchase records.

---

## File paths and naming convention

The project stores files at: `{bucket}/{user-uuid}/{filename}`

This is enforced by the INSERT policy:
```sql
(storage.foldername(name))[1] = (SELECT auth.uid())::text
```

The `[1]` is the first folder path. So the upload path from the client should be:
```typescript
const path = `${user.id}/avatar.jpg`;
await supabase.storage.from("avatars").upload(path, file);
```

---

## Getting a public URL

```typescript
const { data } = supabase.storage.from("avatars").getPublicUrl(`${userId}/avatar.jpg`);
// data.publicUrl = "https://your-project.supabase.co/storage/v1/object/public/avatars/user-uuid/avatar.jpg"
```

This URL works without any auth header because the bucket is public.

---

## The shop file download function

For private bucket files, the project uses a signed URL approach through an Edge Function (`supabase/functions/download-shop-file/index.ts`). This function:
1. Verifies the user's auth
2. Checks if they have purchased the product
3. If yes, generates a temporary signed URL (expires in 60 seconds)
4. Returns the signed URL to the client

This is the correct pattern for protected file downloads — never expose the storage path directly in the database.

---

## Exercises

1. Read [Supabase Storage: Access control](https://supabase.com/docs/guides/storage/security/access-control). What is the difference between a public and private bucket?

2. Open `supabase/schemas/profiles.sql`. Read all storage bucket definitions and all storage RLS policies. For the `banners` bucket, are the policies the same structure as `avatars`? What's different, if anything?

3. In Studio (`http://localhost:54323`), go to Storage. You should see the `avatars` and `banners` buckets. What other buckets exist? Which are public vs private?

4. Open `supabase/functions/download-shop-file/index.ts`. Trace the full logic: what does it check before generating a signed URL? What happens if the user hasn't purchased the product?

5. Write the SQL policy for a hypothetical `kyc-documents` private bucket where only the user who uploaded the document and users with the `finance_manager` role can read it. Use the patterns from `profiles.sql` as a reference.

6. What happens if you try to upload a `.pdf` file to the `avatars` bucket? Trace through the `allowed_mime_types` check and the INSERT policy.
