# Supporters — Frontend Guide

## Route

```
src/routes/(app)/_authenticated/supporters/
├── -components/
│   └── index.tsx
```

## Features

Lists supporters with infinite scroll. Data comes from the `get_supporters_with_profiles()` RPC which joins supporter records with `public_profiles`.

## RPC

```tsx
interface GetSupportersParams {
  p_limit?: number
  p_offset?: number
  p_search?: string
}

interface Supporter {
  id: string
  supporter_id: string
  display_name: string | null
  avatar_url: string | null
  total_amount: number
  support_count: number
  last_support_date: string
}
```

## Fetch Implementation

```tsx
async function fetchSupporters(params: {
  limit: number
  offset: number
  search?: string
}) {
  const { data, error } = await supabase.rpc('get_supporters_with_profiles', {
    p_limit: params.limit,
    p_offset: params.offset,
    p_search: params.search ?? null,
  })

  if (error) throw error
  return data as Supporter[]
}
```

## Infinite Scroll with React Query

Uses the `query-list.tsx` component pattern with `useInfiniteQuery`:

```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery({
    queryKey: ['supporters', search],
    queryFn: ({ pageParam = 0 }) =>
      fetchSupporters({ limit: 20, offset: pageParam, search }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < 20 ? undefined : allPages.length * 20
    },
    initialPageParam: 0,
  })
```

## Display

Each supporter row shows:

- Avatar (from `public_profiles`)
- Display name
- Total amount contributed
- Support count
- Last support date

Periodic refetching keeps the list up to date.
