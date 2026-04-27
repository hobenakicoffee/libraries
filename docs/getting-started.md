---
outline: deep
---

# Getting Started

A framework-agnostic TypeScript package for HobeNakiCoffee projects.

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

This package exposes multiple entry points:

```ts
// Main entry - re-exports constants
import { PaymentStatuses, ServiceTypes, Visibility } from "@hobenakicoffee/libraries";

// Constants only
import { SupporterPlatforms } from "@hobenakicoffee/libraries/constants";

// Utilities only
import { formatAmount, formatDate, getUserPageLink } from "@hobenakicoffee/libraries/utils";

// Types only
import type { Database, Tables } from "@hobenakicoffee/libraries/types";

// Moderation tools
import { moderateText } from "@hobenakicoffee/libraries/moderation";

// URL state management
import { parseAsSortOrder } from "@hobenakicoffee/libraries/nuqs";

// Scripts
import { checkEnvEncryption } from "@hobenakicoffee/libraries/scripts";
```

## Requirements

- TypeScript 5.9.3+
- Node.js 18+

## License

MIT