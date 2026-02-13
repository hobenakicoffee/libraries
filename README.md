# @hobenakicoffee/libraries

Framework-agnostic shared constants and utilities for “হবে নাকি Coffee?” projects.

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

| Entrypoint                        | Function exports                                                                                                                                                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@hobenakicoffee/libraries/utils` | `formatAmount`, `formatSignedAmount`, `formatDate`, `formatToPlainText`, `formatMetadataKey`, `getSocialUrl`, `getUserPageLink`, `openInNewWindow`, `shareToFacebook`, `shareToInstagram`, `shareToLinkedIn`, `shareToX`, `printQrSvg` |

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
    format-amount.ts
    format-date.ts
    format-plain-text.ts
    get-social-handle.ts
    get-user-page-link.ts
    open-to-new-window.ts
    post-to-facebook.ts
    post-to-instagram.ts
    post-to-linkedin.ts
    post-to-x.ts
    qr-svg-utils.ts
    index.ts
```

## Release & publish

Publishing is automated on push to the `main` branch via GitHub Actions. Ensure:

- `package.json` version is updated.
- `NPM_TOKEN` secret is configured with publish permissions.

For local publish (if needed):

```bash
npm publish --access public
```
