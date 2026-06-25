---
outline: deep
---

# Marketing — Architecture

Project location: `../marketing/`

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Astro 7 with `@astrojs/cloudflare` adapter |
| UI (islands) | React 19, shadcn/ui, Tailwind CSS v4 |
| Backend | Supabase SSR (`@supabase/ssr`), Astro Actions |
| i18n | Inlang/Paraglide (`bn` base, `en`) |
| State (client) | Nanostores |
| Rate Limiting | Upstash Redis |
| Bot Protection | Cloudflare Turnstile |
| Analytics | Google Tag Manager, Microsoft Clarity |
| Email | Resend |
| Deployment | Cloudflare Workers |
| Package Manager | Bun |

## Project Structure

```
src/
├── actions/          # Astro Actions (server RPCs)
├── components/       # Astro + React components
│   ├── ui/           # shadcn primitives
│   ├── auth/         # Auth dialog, forms
│   ├── landing/      # Landing page sections
│   └── ...
├── layouts/          # layout.astro, shop-layout.astro, content.astro
├── lib/              # Supabase clients, Resend, Upstash, Turnstile, OpenAI
├── pages/            # All routes
├── providers/        # React context
├── services/         # Data access services
├── stores/           # Nanostores (user store)
├── styles/           # Global CSS
├── types/            # TypeScript types
└── utils/            # Auth helpers, platform utils
```

## Layout Hierarchy

- `layout.astro` — SEO, Analytics, Navbar, Footer, AuthDialog, Confetti, Providers
- `shop-layout.astro` — Wraps Layout, adds ShopNavbar + ScrollToTop
- `content.astro` — Two-column layout for legal pages

## Middleware

Single Paraglide i18n middleware wraps every request:
```ts
export const onRequest = defineMiddleware((context, next) => {
  return paraglideMiddleware(context.request, ({ request }) => next(request));
});
```

## Supabase Clients

Three modes:
- `createDBClient()` — SSR with cookies (`@supabase/ssr`)
- `createServiceDBClient()` — service-role (admin ops)
- `getSupabaseBrowserClient()` — browser client (nanostore auth)

## Build & Deploy

```bash
bun run dev          # Astro dev server
bun run build        # paraglide-js compile → astro build
bun run preview      # Local Cloudflare Workers preview
```

Deployed via `.github/workflows/production.yaml` to Cloudflare Workers.
