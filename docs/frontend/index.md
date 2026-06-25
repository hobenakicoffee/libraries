# Frontend Overview

The HobeNakiCoffee creator platform has two frontend surfaces: the **App** (React SPA creator dashboard) and **Marketing** (Astro SSR public site).

---

## App (React SPA)

Path: `app/` — creator dashboard with auth, settings, services, analytics, and more.

| Section | Description |
|---|---|
| [App Architecture](../app-architecture/frontend/index) | Build tool, router, state management, env vars |
| [Auth](../auth/frontend/index) | Login flow, OTP, AuthProvider, protected routes |
| [Onboarding](../onboarding/frontend/index) | 5-step creator onboarding wizard |
| [Settings](../settings/frontend/index) | Appearance, billing, notifications, profile, verification |
| [Profile](../profile/frontend/index) | ProfileProvider, queries, mutations |
| [Services Hub](../services-hub/frontend/index) | Service cards, toggles, request dialog |
| [Creator Agreement](../creator-agreement/frontend/index) | Agreement banner, acceptance flow |
| [Supporters](../supporters/frontend/index) | Infinite scroll supporter list |
| [Notifications](../notifications/frontend/index) | Activity feed, real-time, dismissals |
| [Electron Desktop](../electron-desktop/frontend/index) | Desktop app, toolbar, updates |
| [Common Components](../common-components/frontend/index) | Reusable UI components catalog |
| [Custom Hooks](../custom-hooks/frontend/index) | Hooks library reference |
| [Services Layer](../services-layer/frontend/index) | Data services, Supabase client |
| [Error Handling](../error-handling/frontend/index) | EdgeFunctionError, error codes |
| [Image Upload](../image-upload/frontend/index) | Upload pipeline, compression, moderation |

## Marketing (Astro SSR)

Path: `marketing/` — public-facing site with creator pages, blog, explore.

| Section | Description |
|---|---|
| Marketing Overview | Astro SSR public site architecture |
| Explore Page | Creator directory with search and filters |
| Creator Pages | Dynamic `@handle` pages |
| Shop Public Pages | Public product listings and checkout |
| Newsletter Reader | Post reader and subscription management |
| Coffee Gifts | Gift sending and receiving |
| Authentication | Public auth pages (login, signup) |
| SEO & Metadata | Open Graph, structured data, sitemaps |

## Tech Stack

### App

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TanStack Router v1 | File-based routing |
| TanStack Query v5 | Server state management |
| TanStack Form | Form state management |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui | Component primitives |
| Supabase | Database, auth, storage, realtime |
| Vite 8 | Build tool |
| TypeScript 6 | Language |
| Intlayer | Internationalization (i18n) |
| nuqs | URL query-state management |
| Electron | Desktop app wrapper |

### Marketing

| Technology | Purpose |
|---|---|
| Astro 7 | Static site generation / SSR |
| React 19 | Interactive components |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui | Component primitives |
| Supabase SSR | Server-side Supabase client |
| Cloudflare Workers | Edge deployment |
| TypeScript 6 | Language |
| Inlang/Paraglide | Internationalization (i18n) |
| Nanostores | Lightweight client-side state |

## Architecture

```mermaid
flowchart LR
    U[User] --> CF[Cloudflare CDN/Proxy]
    CF -->|/app/*| SPA[React SPA<br/>Creator Dashboard]
    CF -->|/@handle/*| SSR[Astro SSR<br/>Public Site]
    SPA --> SB[Supabase<br/>Database / Auth / Storage]
    SSR --> SB
```

## See Also

- [Supabase Backend](../supabase-backend) — Master index for all backend docs
- [Libraries](../libraries/index) — Shared library docs (constants, types, utils, hooks)
