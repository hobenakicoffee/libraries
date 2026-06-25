# Image Upload — Frontend Guide

## Pipeline

The full upload pipeline follows this flow:

```
Select → Compress → Quality Check → Moderate → Upload to Supabase Storage
```

Each step is handled by a dedicated hook or service.

## Hook: use-image-upload

Location: `src/hooks/use-image-upload.ts`

Orchestrates the entire pipeline:

```tsx
export function useImageUpload() {
  const compress = useImageCompression()
  const quality = useImageQuality()
  const moderate = useModerateContent()
  const queryClient = useQueryClient()

  const upload = async (
    file: File,
    options: { bucket: string; userId: string }
  ) => {
    // 1. Compress
    const compressed = await compress.compress(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
    })

    // 2. Quality check
    const report = await quality.assess(compressed)
    if (!report.isValid) {
      throw new Error(report.issues.join(', '))
    }

    // 3. Moderate
    await moderate.mutateAsync({ imageUrl: URL.createObjectURL(compressed) })

    // 4. Upload to Supabase Storage
    const path = `${options.userId}/${compressed.name}`
    const { data, error } = await uploadImage(
      options.bucket,
      path,
      compressed
    )

    if (error) throw error
    return { url: data.url, path }
  }

  return { upload, isUploading: compress.isCompressing || moderate.isPending }
}
```

## Compression

Hook: `src/hooks/use-image-compression.ts`

Uses the `browser-image-compression` library to reduce file size before upload:

```tsx
import imageCompression from 'browser-image-compression'

export function useImageCompression() {
  const [isCompressing, setIsCompressing] = useState(false)

  const compress = async (
    file: File,
    options: { maxSizeMB: number; maxWidthOrHeight: number }
  ) => {
    setIsCompressing(true)
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: options.maxSizeMB,
        maxWidthOrHeight: options.maxWidthOrHeight,
        useWebWorker: true,
      })
      return compressed
    } finally {
      setIsCompressing(false)
    }
  }

  return { compress, isCompressing }
}
```

## Quality Check

Hook: `src/hooks/use-image-quality.ts`

Validates resolution and dimensions before upload:

```tsx
export function useImageQuality() {
  const assess = async (file: File): Promise<QualityReport> => {
    const img = await createImageBitmap(file)
    const issues: string[] = []

    if (img.width < 200 || img.height < 200) {
      issues.push('Image must be at least 200x200 pixels')
    }

    if (img.width > 4096 || img.height > 4096) {
      issues.push('Image must not exceed 4096x4096 pixels')
    }

    return {
      isValid: issues.length === 0,
      width: img.width,
      height: img.height,
      issues,
    }
  }

  return { assess }
}
```

## Moderation

Hook: `src/hooks/use-moderate-content.ts`

Calls the `moderate-content` Edge Function for profanity and content policy checks:

```tsx
import { moderateContent } from '@/services/moderate-content.service'

export function useModerateContent() {
  return useMutation({
    mutationFn: (params: { content?: string; imageUrl?: string }) =>
      moderateContent(supabase, params.content ?? '', params.imageUrl),
    onError: (error) => {
      const parsed = parseSupabaseFunctionError(error)
      toast.error(parsed.displayMessage)
    },
  })
}
```

## Upload Service

`src/lib/storage/upload-image.service.ts`:

```tsx
export async function uploadImage(
  bucket: string,
  path: string,
  file: File
) {
  return supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })
}
```

## Storage Buckets

| Bucket | Max File Size | Purpose |
|---|---|---|
| `avatars` | 2 MB | User profile avatars |
| `banners` | 5 MB | Profile banner images |
| `post-images` | 5 MB | Newsletter post images |
| `shop-images` | 5 MB | Shop product images |

## File Path Convention

```
{bucket}/{userId}/{filename}
```

Example: `avatars/abc123/profile.jpg`

This keeps files organized per user and prevents collisions.
