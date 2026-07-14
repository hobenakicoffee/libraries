# Settings — Frontend Guide

## Route Group

```
src/routes/(app)/_settings/
├── route.tsx                    # Layout with secondary sidebar
├── -route.content.tsx           # Nav items content (i18n)
├── settings/
│   ├── appearance/
│   ├── billing/
│   ├── notifications/
│   ├── profile-and-page/
│   ├── thank-you-dialog/
│   └── verification/
```

The layout uses `getNavItems()` to build the secondary sidebar navigation.

## Pages

### Appearance

Route: `settings/appearance/`

- Theme toggle: light / dark / system
- Layout options (if applicable)

### Billing

Route: `settings/billing/`

- Billing information display
- Invoice history

### Notifications

Route: `settings/notifications/`

- Toggle notification preferences per type
- Each notification type has an enable/disable switch
- Preferences are stored via RPC or direct table update

### Profile & Page

Route: `settings/profile-and-page/`

Edit the following profile fields:

| Field | Type | Notes |
|---|---|---|
| `display_name` | text | Public display name |
| `username` | text | Unique username |
| `bio` | text | Short bio |
| `avatar_url` | text | Avatar image URL |
| `banner_url` | text | Banner image URL |
| `social_links` | jsonb | Social media links |
| `categories` | text[] | Creator categories |
| `page_slug` | text | Public page URL slug |

### Thank-You Dialog

Route: `settings/thank-you-dialog/`

- Configure the thank-you message shown to supporters after a gift/payment
- Live preview of the thank-you dialog

### Verification

Route: `settings/verification/`

- KYC status display
- Link to start ID verification process
- See [KYC Frontend](/kyc/frontend/) for details

### Active Sessions

Route: `settings/active-sessions/` (or wherever this gets added under the settings route group)

- List of the user's active sessions/devices (IP, device/browser parsed from `user_agent`,
  last active, a "this device" badge)
- Per-row "Revoke" action, plus a single "Log out other devices" action
- Uses the normal app Supabase client directly via `supabase.rpc(...)` — no special client
  setup, unlike the impersonation flow
- Revoking the current device's own session should immediately trigger a local
  `supabase.auth.signOut({ scope: "local" })` and redirect to login
- See [Settings Backend](/settings/backend/) for the RPC reference and the
  revocation-is-not-instant caveat that must be reflected in the UI copy

## Data & Mutations

Settings use the `ProfileProvider` context for reading profile data and `useUpdateProfile` hook for mutations, which handle cache invalidation automatically.
