# Custom Hooks — Reference

## UI & Effects

### `use-confetti`

Celebration effects with multiple variants.

```tsx
const { fireConfetti } = useConfetti()

// Coffee-themed confetti
fireConfetti({ variant: 'coffee' })

// Realistic confetti
fireConfetti({ variant: 'realistic' })

// Fireworks effect
fireConfetti({ variant: 'fireworks' })
```

### `use-copy-to-clipboard`

Clipboard copy with state tracking.

```tsx
const { copy, state } = useCopyToClipboard()
// state: 'idle' | 'copied' | 'error'

copy('text to copy')
```

### `use-debounced-callback`

Debounced function wrapper with cancel support.

```tsx
const debouncedSearch = useDebouncedCallback(
  (query: string) => performSearch(query),
  300
)

// Cancel pending invocation
debouncedSearch.cancel()
```

## Responsive

### `use-mobile`

Responsive breakpoint detection for mobile.

```tsx
const isMobile = useMobile()
// Returns true when viewport < 768px
```

### `use-tablet`

Responsive breakpoint detection for tablet.

```tsx
const isTablet = useTablet()
```

## Image Handling

### `use-image-compression`

Browser-based image compression using `browser-image-compression`.

```tsx
const { compress, isCompressing } = useImageCompression()

const compressedFile = await compress(file, {
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
})
```

### `use-image-upload`

Orchestrates the full upload pipeline: compress → quality check → moderate → upload to Supabase Storage.

```tsx
const { upload, isUploading } = useImageUpload()

const result = await upload(file, {
  bucket: 'avatars',
  userId: profile.id,
})
// Result: { url: string, path: string }
```

### `use-image-quality`

Quality assessment before upload — validates resolution and dimensions.

```tsx
const { assess } = useImageQuality()

const report = await assess(file)
// report: { isValid: boolean, width: number, height: number, issues: string[] }
```

## Data Mutations

### `use-update-profile`

Profile update mutation with automatic cache invalidation.

```tsx
const updateProfile = useUpdateProfile()

updateProfile.mutate({ display_name: 'New Name' })
```

### `use-moderate-content`

Content moderation mutation with i18n error messages.

```tsx
const moderate = useModerateContent()

moderate.mutate({ content: 'text to check' })
// Shows translated error toast on violation
```

## Geo Data

### `use-districts`

Fetch Bangladesh districts by division.

```tsx
const { data: districts, isLoading } = useDistricts(divisionId)
```

### `use-upazillas`

Fetch Bangladesh upazillas by district.

```tsx
const { data: upazillas, isLoading } = useUpazillas(districtId)
```

### `use-unions`

Fetch Bangladesh unions by upazilla.

```tsx
const { data: unions, isLoading } = useUnions(upazillaId)
```

## Formatting

### `use-human-readable-timerange`

Format time ranges into human-readable strings.

```tsx
const format = useHumanReadableTimerange()

format('2024-01-01', '2024-01-31')
// Returns: "January 2024"
```

## Shared Library Hooks

For the `useIsMobile` hook from the shared library:

```tsx
import { useIsMobile } from '@hobenakicoffee/libraries/hooks'
```

See [Libraries Hooks](/libraries/hooks/) for details.
