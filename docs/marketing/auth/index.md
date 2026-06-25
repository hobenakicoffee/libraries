---
outline: deep
---

# Marketing — Authentication

## Auth Dialog

A global auth dialog (`global-auth-dialog.tsx`) is triggered by a CustomEvent:
```ts
window.dispatchEvent(new CustomEvent('open-auth-dialog'));
```

Components in `src/components/auth/`:
- `global-auth-dialog.tsx` — Dialog wrapper
- `auth-dialog.tsx` — Inner auth container
- `email-form.tsx` — Email input + submit
- `otp-form.tsx` — OTP verification input

## Flow

1. User enters email → `auth.sendOtp` action → Supabase `signInWithOtp`
2. OTP email sent to user
3. User enters OTP → `auth.verifyOtp` action → Supabase `verifyOtp`
4. Session cookie set → user is authenticated

## User Store

Nanostore-based auth state in `src/stores/user-store.ts`:
- `$user` — Current user or null
- `$userLoading` — Loading state
- `$isAuthenticated` — Derived boolean
- `fetchUser()` — Calls Supabase `getSession()` + `getUser()`
- `subscribeToAuthChanges()` — Listens to `onAuthStateChange`

React binding: `use-user.ts` hook subscribes to `$user` store.

## SSR Auth Helpers

```ts
import { requireUser, getOptionalUser } from '@/utils/auth';

// Redirects to login if not authenticated
const user = await requireUser(context);

// Returns null if not authenticated (no redirect)
const user = await getOptionalUser(context);
```

## Rate Limiting

Auth actions limited to 5 requests per 60 seconds per IP via Upstash Redis.

## Security

- Cloudflare Turnstile on auth forms
- Rate limiting on OTP send/verify
- Session cookies via `@supabase/ssr`
- Redirect to app project post-login via `PUBLIC_APP_PAGE_URL`
