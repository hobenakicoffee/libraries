# @hobenakicoffee/libraries

Shared constants, utilities, types, hooks, and moderation tools for "হবে নাকি Coffee?" projects.

## Install

```bash
bun add @hobenakicoffee/libraries
```

## Usage

```ts
import { PaymentStatuses, Visibility } from "@hobenakicoffee/libraries";
import { formatAmount, formatDate } from "@hobenakicoffee/libraries/utils";
import { containsProfanity } from "@hobenakicoffee/libraries/moderation";
import { useIsMobile } from "@hobenakicoffee/libraries/hooks";
import type { Database, Tables } from "@hobenakicoffee/libraries/types";
```

### Entry points

| Path | What |
|------|------|
| `@hobenakicoffee/libraries` | Constants re-export |
| `@hobenakicoffee/libraries/constants` | Constants |
| `@hobenakicoffee/libraries/utils` | Utility functions |
| `@hobenakicoffee/libraries/types` | TypeScript types (Supabase + custom) |
| `@hobenakicoffee/libraries/moderation` | Profanity detection |
| `@hobenakicoffee/libraries/nuqs` | URL state parsers |
| `@hobenakicoffee/libraries/hooks` | React hooks |
| `@hobenakicoffee/libraries/scripts` | Build/utility scripts |

## Dev

```bash
bun install
bun test
bun run typecheck
bun run format
```
