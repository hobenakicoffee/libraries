# Services Layer — Frontend Guide

All data-fetching services live in `src/services/`. Each service is a standalone async function that takes a typed Supabase client and returns typed data.

## Shared Services

### Profile

#### `get-profile-data-by-user-id.service.ts`

```tsx
export async function getProfileDataByUserId(
  client: TypedSupabaseClient,
  userId: string
) {
  return client
    .from('profiles')
    .select('*, user_services(*)')
    .eq('id', userId)
    .single()
}
```

Fetches the full profile with all `user_services` joined in a single query.

#### `update-profile-data-by-user-id.service.ts`

```tsx
export async function updateProfileDataByUserId(
  client: TypedSupabaseClient,
  userId: string,
  data: Partial<ProfileData>
) {
  return client
    .from('profiles')
    .update(data)
    .eq('id', userId)
}
```

Partial profile update — only sends changed fields.

### BD Geo Data

#### `get-districts-by-division.service.ts`

```tsx
export async function getDistrictsByDivision(
  client: TypedSupabaseClient,
  divisionId: number
) {
  return client
    .from('districts')
    .select('id, name, bn_name')
    .eq('division_id', divisionId)
    .order('name')
}
```

#### `get-upazillas-by-district.service.ts`

```tsx
export async function getUpazillasByDistrict(
  client: TypedSupabaseClient,
  districtId: number
) {
  return client
    .from('upazillas')
    .select('id, name, bn_name')
    .eq('district_id', districtId)
    .order('name')
}
```

#### `get-unions-by-upazilla.service.ts`

```tsx
export async function getUnionsByUpazilla(
  client: TypedSupabaseClient,
  upazillaId: number
) {
  return client
    .from('unions')
    .select('id, name, bn_name')
    .eq('upazilla_id', upazillaId)
    .order('name')
}
```

### Content Moderation

#### `moderate-content.service.ts`

```tsx
export async function moderateContent(
  client: TypedSupabaseClient,
  content: string,
  imageUrl?: string
) {
  const { data, error } = await client.functions.invoke('moderate-content', {
    body: { content, imageUrl },
  })

  if (error) throw error
  return data as ModerationResult
}
```

Calls the `moderate-content` Edge Function which performs two-stage moderation: profanity detection (client-side) + OpenAI vision (server-side for images).

## Supabase Client

All services use the typed Supabase browser client from `src/lib/supabase.ts`:

```tsx
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@hobenakicoffee/libraries/types'

export const supabase = createBrowserClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
)
```

A singleton is created once and imported throughout the app. The `Database` type from `@hobenakicoffee/libraries/types` provides full type safety for all queries, RPCs, and mutations.

## Type Safety

All queries are typed with the `Database` type:

```tsx
import type { Database } from '@hobenakicoffee/libraries/types'

type TypedSupabaseClient = ReturnType<
  typeof createBrowserClient<Database>
>
```

This ensures column names, types, and relationships are checked at compile time.
