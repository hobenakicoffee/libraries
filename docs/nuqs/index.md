---
outline: deep
---

# URL State (nuqs)

The nuqs module provides type-safe URL state parsers using zod for sorting, filtering, and date ranges.

## Usage

```ts
import { parseAsSortOrder, parseAsDateRange, parseAsLastTimeRange } from "@hobenakicoffee/libraries/nuqs";
```

## Exports

| Parser | Description |
| `parseAsSortOrder` | Parse "asc" or "desc" sort order |
| `parseAsDateRange` | Parse date range object |
| `parseAsLastTimeRange` | Parse last X days/weeks/months |

## Example

```ts
// Sort order
parseAsSortOrder.parse("asc");  // => "asc"
parseAsSortOrder.parse("desc"); // => "desc"

// Date range
parseAsDateRange.parse({ from: new Date(), to: new Date() });

// Last time range
parseAsLastTimeRange.parse("last_7_days");
parseAsLastTimeRange.parse("last_30_days");
parseAsLastTimeRange.parse("last_90_days");
parseAsLastTimeRange.parse("last_180_days");
parseAsLastTimeRange.parse("last_year");
```

## Requirements

- [nuqs](https://nuqs.47ng.dev/) - URL state management
- [zod](https://zod.dev/) - Schema validation