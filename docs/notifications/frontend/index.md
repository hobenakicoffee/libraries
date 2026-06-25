# Notifications — Frontend Guide

## Route

```
src/routes/(app)/_authenticated/notifications/
├── -components/
│   └── notifications-popover.tsx
├── index.tsx
```

## Data Source

Notifications are fetched from the `activities` table with `visibility = 'private'`:

```tsx
async function fetchNotifications(client: TypedSupabaseClient, profileId: string) {
  return client
    .from('activities')
    .select('*')
    .eq('profile_id', profileId)
    .eq('visibility', 'private')
    .order('created_at', { ascending: false })
    .limit(50)
}
```

## Real-Time Subscription

Subscribes to new activities via Supabase Realtime:

```tsx
useEffect(() => {
  const channel = supabase
    .channel('activities')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activities',
        filter: `profile_id=eq.${profileId}`,
      },
      (payload) => {
        const activity = payload.new as Activity
        if (activity.visibility === 'private') {
          setNotifications((prev) => [activity, ...prev])
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [profileId])
```

## Dismissal

Uses RPCs for dismissing notifications:

```tsx
// Dismiss single notification
await supabase.rpc('dismiss_activity', { id: activityId })

// Dismiss all notifications
await supabase.rpc('dismiss_all_activities')
```

> **Security note:** Direct `UPDATE` on the `activities` table has been revoked (SEC-15). All dismissals must go through RPCs.

## Unread Count

The bell icon in the header displays the count of unread notifications. This is derived from activities where `dismissed_at` is null.

## Components

### Notifications Popover

`notifications-popover.tsx` — a dropdown/popover component shown when clicking the bell icon. Displays recent notifications with:

- Activity type icon
- Title and description
- Timestamp
- Dismiss button per item
- "Dismiss All" action
- Empty state when no notifications

## Backend Reference

- [Notification Types & Preferences](/notifications/) — all notification types and preference system
- [Activities Backend](/payments-and-memberships/backend/activities) — activities table schema and RPCs
