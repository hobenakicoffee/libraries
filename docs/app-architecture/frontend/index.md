# App Architecture

## Project Location

The app lives at `../app/` relative to the libraries package root.

## Build Tool

Vite 8 with base path `/app/`. The app is deployed behind Cloudflare which strips the `/app` prefix before serving.

## Router

TanStack Router v1 with file-based routing. Route tree is auto-generated into `routeTree.gen.ts` via the TanStack Router Vite plugin. Routes are defined as `.tsx` files in `src/routes/` following the file-system convention.

### Folder Conventions Per Route

Each route directory can contain these subdirectories:

| Folder | Purpose |
|---|---|
| `-components/` | Route-specific UI components |
| `-hooks/` | Route-specific React hooks |
| `-services/` | Route-specific data fetching functions |
| `-types/` | Route-specific TypeScript types |
| `-utils/` | Route-specific utility functions |
| `-nuqs/` | Route-specific URL state parsers |
| `-constants/` | Route-specific constant values |
| `-schemas/` | Route-specific Zod validation schemas |

## Provider Tree

```
AuthProvider
└── ThemeProvider
    └── ReactQueryClientProvider
        └── SiteHeaderProvider
            └── ProfileProvider
                └── MessagesSheetProvider
                    └── Router
```

Providers are composed in `src/main.tsx`. Authentication wraps everything so downstream providers depend on a known session. ProfileProvider fetches the creator's profile and user services on mount.

## State Management Layers

| Layer | Technology | Scope |
|---|---|---|
| Server state | TanStack Query v5 | All API/Supabase data fetches and mutations |
| Auth state | React Context (AuthProvider) | User session, login/logout |
| Profile state | React Context (ProfileProvider) | Profile data, user services |
| Theme state | React Context (ThemeProvider) | Light/dark/system theme |
| Site header state | React Context (SiteHeaderProvider) | Header visibility, title |
| URL state | nuqs | Search params, filters, pagination |
| Form state | TanStack Form | Form field values, validation |

## Key Files

| File | Purpose |
|---|---|
| `src/main.tsx` | Application entry point, provider composition |
| `src/index.css` | Tailwind CSS v4 setup with shadcn/ui CSS variables |
| `src/lib/supabase.ts` | Typed Supabase browser client singleton |
| `src/routeTree.gen.ts` | Auto-generated route tree (do not edit manually) |

## Route Groups

| Route Group | Description |
|---|---|
| `(auth)/` | Login pages (email entry, OTP verification, callback) |
| `(app)/_authenticated/` | Main app routes with sidebar navigation |
| `(app)/_settings/` | Settings routes with secondary settings sidebar |
| `(app)/onboarding/` | Creator onboarding wizard (5 steps) |
| `kyc/mobile/` | Standalone KYC mobile verification page |

## Electron

The app supports a dual build via `vite-plugin-electron`:

| File | Purpose |
|---|---|
| `electron/main.ts` | Electron main process — window creation, IPC handlers |
| `electron/preload.ts` | Context bridge — exposes platform, navigation, notifications, updates |

## Cloudflare Worker

`worker/index.ts` — a Cloudflare Worker that strips the `/app` prefix from requests and proxies to the SPA origin. This allows the app to be served from `example.com/app/*` while the SPA itself is a regular Vite SPA.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `VITE_SUPABASE_COOKIE_NAME` | Custom auth cookie name |
| `VITE_SUPABASE_COOKIE_HOST` | Auth cookie host domain |
| `VITE_SUPABASE_COOKIE_SECURE` | Whether auth cookie requires HTTPS |
| `VITE_MARKETING_SITE_URL` | Marketing site base URL for cross-linking |
| `VITE_DEV_SERVER_URL` | Local dev server URL (used by Electron) |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key for CAPTCHA |
