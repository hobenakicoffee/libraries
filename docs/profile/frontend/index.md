# Profile — Frontend Guide

## ProfileProvider

Location: `src/components/providers/profile-provider.tsx`

```tsx
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfileDataByUserId(supabase, user!.id),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,  // 10 minutes
    gcTime: 30 * 60 * 1000,      // 30 minutes
  })

  return (
    <ProfileContext.Provider
      value={{
        profile: profileData?.profile ?? null,
        userServices: profileData?.userServices ?? [],
        isLoading,
        error,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}
```

**Provides:**

| Value | Type | Description |
|---|---|---|
| `profile` | `ProfileData \| null` | Current creator's profile |
| `userServices` | `UserService[]` | Enabled services for the creator |
| `isLoading` | `boolean` | Profile fetch in progress |
| `error` | `Error \| null` | Fetch error if any |

**React Query config:** 10 min stale time, 30 min cache time.

## Profile Queries

Service: `src/services/get-profile-data-by-user-id.service.ts`

```tsx
export async function getProfileDataByUserId(
  client: TypedSupabaseClient,
  userId: string
) {
  const { data, error } = await client
    .from('profiles')
    .select('*, user_services(*)')
    .eq('id', userId)
    .single()

  if (error) throw error

  return {
    profile: data as ProfileData,
    userServices: data.user_services ?? [],
  }
}
```

The query joins `user_services` to fetch all enabled services alongside the profile in a single request.

## Profile Mutations

Service: `src/services/update-profile-data-by-user-id.service.ts`

```tsx
export async function updateProfileDataByUserId(
  client: TypedSupabaseClient,
  userId: string,
  data: Partial<ProfileData>
) {
  const { error } = await client
    .from('profiles')
    .update(data)
    .eq('id', userId)

  if (error) throw error
}
```

## Hook: use-update-profile

Hook: `src/hooks/use-update-profile.ts`

```tsx
export function useUpdateProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<ProfileData>) =>
      updateProfileDataByUserId(supabase, user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
  })
}
```

Wraps the mutation with automatic cache invalidation on success.

## Profile Type

```tsx
interface ProfileData {
  id: string
  display_name: string | null
  username: string | null
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  page_slug: string | null
  categories: string[] | null
  social_links: SocialLink[] | null
  onboarding_step: number
  onboarding_completed_at: string | null
  accepted_creator_agreement_at: string | null
  creator_agreement_version: number | null
  suspended_at: string | null
  user_services: UserService[]
}
```

The `user_services` relation contains all enabled/disabled services for the creator profile.
