# @hobenakicoffee/libraries

Framework-agnostic shared constants and utilities for "হবে নাকি Coffee?" projects.

## Installation

```bash
npm install @hobenakicoffee/libraries
# or
pnpm add @hobenakicoffee/libraries
# or
yarn add @hobenakicoffee/libraries
# or
bun add @hobenakicoffee/libraries
```

## Usage

This package exposes three entry points:

- `@hobenakicoffee/libraries` (re-exports constants)
- `@hobenakicoffee/libraries/constants`
- `@hobenakicoffee/libraries/utils`

Examples:

```ts
import { PaymentStatuses, ServiceTypes } from "@hobenakicoffee/libraries";

import { SupporterPlatforms } from "@hobenakicoffee/libraries/constants";

import {
  formatAmount,
  formatDate,
  getUserPageLink,
} from "@hobenakicoffee/libraries/utils";
```

## API at a glance

### Constants and types

| Entrypoint                            | Runtime exports                                                                                                                                              | Type exports                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `@hobenakicoffee/libraries`           | Re-exports all constants from `@hobenakicoffee/libraries/constants`                                                                                          | Re-exports all types from `@hobenakicoffee/libraries/constants`                                                         |
| `@hobenakicoffee/libraries/constants` | `Visibility`, `productInfo`, `companyInfo`, `PaymentTypes`, `PaymentStatuses`, `PaymentProviders`, `PaymentDirections`, `SupporterPlatforms`, `ServiceTypes` | `Visibility`, `PaymentType`, `PaymentStatus`, `PaymentProvider`, `PaymentDirection`, `SupporterPlatform`, `ServiceType` |

### Utilities

| Entrypoint                        | Function exports                                                                                                                                                                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@hobenakicoffee/libraries/utils` | `checkModeration`, `formatAmount`, `formatSignedAmount`, `formatDate`, `formatNumber`, `formatToPlainText`, `getSocialHandle`, `getSocialUrl`, `getUserNameInitials`, `getUserPageLink`, `openInNewWindow`, `shareToFacebook`, `shareToInstagram`, `shareToLinkedIn`, `shareToX`, `printQrSvg`, `toHumanReadable`, `validatePhoneNumber` |

## Local development

Install dependencies:

```bash
bun install
```

Available scripts:

```bash
# Build the library
bun run build

# Run in watch mode during development
bun run dev

# Run tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run type checking
bun run typecheck

# Alias for typecheck
bun run lint

# Clean build artifacts
bun run clean
```

## Project structure

```text
src/
  index.ts
  constants/
    common.ts
    legal.ts
    payment.ts
    platforms.ts
    services.ts
    index.ts
  utils/
    check-moderation.ts
    format-amount.ts
    format-date.ts
    format-number.ts
    format-plain-text.ts
    get-social-handle.ts
    get-social-link.ts
    get-user-name-initials.ts
    get-user-page-link.ts
    open-to-new-window.ts
    post-to-facebook.ts
    post-to-instagram.ts
    post-to-linkedin.ts
    post-to-x.ts
    qr-svg-utils.ts
    to-human-readable.ts
    validate-phone-number.ts
    index.ts
  moderation/
    normalizer.ts
    profanity-service.ts
    index.ts
  types/
    supabase.ts
    index.ts
  lib/
    utils.ts
  providers/
    theme-provider.tsx
  components/
    ui/
      ... (Radix UI based components)
    turnstile-captcha.tsx
```

## Release & publish

Publishing is automated on push to the `main` branch via GitHub Actions. Ensure:

- `package.json` version is updated.
- `NPM_TOKEN` secret is configured with publish permissions.

For local publish (if needed):

```bash
npm publish --access public
```
