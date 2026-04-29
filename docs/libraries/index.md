---
outline: deep
---

# Libraries

A framework-agnostic TypeScript package that provides essential utilities for the Hobenaki Coffee ecosystem.

## Installation

```bash
npm install @hobenakicoffee/libraries
```

## Exports

| Export | Description |
| ------- | ----------- |
| `constants` | Payment types, statuses, platforms, visibility, and service type constants |
| `lib/utils` | Utility functions (cn, formatting, validation) |
| `moderation` | Profanity detection for English and Bengali with leetspeak normalization |
| `types` | Full Supabase database types and custom type definitions |
| `utils` | Format amounts, dates, validate phone numbers, social links, and more |
| `nuqs` | Type-safe URL state parsers using zod for sorting, filtering, and date ranges |
| `scripts` | Build utilities and environment encryption helpers |

## Usage

```ts
import { Visibility, PaymentStatuses } from "@hobenakicoffee/libraries/constants";
import { formatCurrency, cn } from "@hobenakicoffee/libraries/lib/utils";
```

## Related

- [Constants](./constants/index)
- [Utilities](./utils/index)
- [Types](./types/index)
- [Moderation](./moderation/index)
- [nuqs](./nuqs/index)
- [Scripts](./scripts/index)
