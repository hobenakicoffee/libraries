# Memberships Hub — Frontend Overview

The Memberships Hub is a single page (`/memberships`) with two tabs and a persistent sidebar. It uses the standard stack: TanStack Query for data fetching, `nuqs` for URL state, and TanStack Router for navigation.

## Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  [User Tab]  [Creator Tab]                              │  ← tabs
├──────────────────────────────────┬──────────────────────┤
│                                  │                      │
│  Feed                            │  Memberships Widget  │
│  ┌──────────────────────────┐    │  ┌────────────────┐  │
│  │ Feed Card                │    │  │ Creator A      │  │
│  │ (newsletter post)        │    │  │ Pro Plan ৳500  │  │
│  └──────────────────────────┘    │  └────────────────┘  │
│  ┌──────────────────────────┐    │                      │
│  │ Feed Card  [Promoted]    │    │  Recommended         │
│  │ (membership plan)        │    │  ┌────────────────┐  │
│  └──────────────────────────┘    │  │ Creator B      │  │
│  ...                             │  └────────────────┘  │
│                                  │                      │
│  Following    [See All →]        │                      │
│  ○ ○ ○ ○ ○ ○                    │                      │
│                                  │                      │
│  Followers    [See All →]        │                      │
│  ○ ○ ○ ○ ○ ○                    │                      │
└──────────────────────────────────┴──────────────────────┘
```

**Creator Tab** replaces the feed with membership performance stats:

```
┌─────────────────────────────────────────────────────────┐
│  [User Tab]  [Creator Tab ✓]                            │
├──────────────────────────────────┬──────────────────────┤
│                                  │                      │
│  Stats Cards                     │  Memberships Widget  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │  (same sidebar)      │
│  │ 42 │ │৳85k│ │৳12k│ │ 3  │    │                      │
│  │mem │ │rev │ │/mo │ │chr │    │                      │
│  └────┘ └────┘ └────┘ └────┘    │                      │
│                                  │                      │
│  Engagement                      │                      │
│  ┌────┐ ┌────┐ ┌────┐           │                      │
│  │12k │ │840 │ │210 │           │                      │
│  │imp │ │like│ │cmt │           │                      │
│  └────┘ └────┘ └────┘           │                      │
│                                  │                      │
│  Per-plan breakdown              │                      │
│  Top feed item                   │                      │
└──────────────────────────────────┴──────────────────────┘
```

## Tech Stack

| Concern | Library |
|---|---|
| Data fetching | TanStack Query (`useQuery`, `useInfiniteQuery`, `useMutation`) |
| URL state (active tab) | `nuqs` |
| Routing | TanStack Router |
| UI components | shadcn/ui |
| Icons | `@hugeicons/react` |
| Animations | `framer-motion` |

## URL State

Use `nuqs` to persist the active tab in the URL so users can share/bookmark their tab:

```typescript
import { useQueryState } from 'nuqs'

const [tab, setTab] = useQueryState('tab', {
  defaultValue: 'user',
  parse: (v) => v === 'creator' ? 'creator' : 'user'
})
```

URL: `/memberships?tab=creator`

## Data Loading Strategy

Load data per-tab to avoid unnecessary requests:

| Data | When to load | Hook |
|---|---|---|
| Feed | Always (user tab default) | `useInfiniteQuery` |
| Memberships widget | Always (sidebar, both tabs) | `useQuery` |
| Recommended creators | Always (sidebar) | `useQuery` |
| Following/followers | On "See All" click | `useInfiniteQuery` (lazy) |
| Creator stats | Only when creator tab active | `useQuery` (enabled: tab === 'creator') |

## Query Keys Convention

```typescript
export const feedQueryKeys = {
  feed: ['feed', 'my'] as const,
  membershipsWidget: ['feed', 'memberships-widget'] as const,
  recommendedCreators: ['feed', 'recommended-creators'] as const,
  following: ['feed', 'following'] as const,
  followers: ['feed', 'followers'] as const,
  creatorStats: ['feed', 'creator-stats'] as const,
  comments: (feedItemId: string) => ['feed', 'comments', feedItemId] as const,
}
```

## Authentication Guard

This entire page requires authentication. Redirect unauthenticated users to `/login`.

```typescript
// In your route definition (TanStack Router)
export const Route = createFileRoute('/memberships')({
  beforeLoad: ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: '/login' })
    }
  },
  component: MembershipsHubPage,
})
```

## Pages in This Section

| Page | What it covers |
|---|---|
| [Feed](./feed.md) | Loading, rendering, pagination, impression tracking |
| [Interactions](./interactions.md) | Likes, comments, replies |
| [Boost](./boost.md) | Launch, pause, resume UI flow |
| [Creator Dashboard](./creator-dashboard.md) | Stats tab, widgets, following/followers dialogs |
