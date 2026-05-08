---
outline: deep
---

# TypeScript Types

The types module provides TypeScript types for Supabase database and custom type definitions.

## Usage

```ts
import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from "@hobenakicoffee/libraries/types";
```

## Exports

| Type | Description |
| ---- | ----------- |
| `Database` | Full Supabase database type |
| `Tables<T>` | Table row types |
| `TablesInsert<T>` | Insert types for tables |
| `TablesUpdate<T>` | Update types for tables |
| `Enums<E>` | Enum types |
| `TransactionMetadata` | Transaction metadata type |
| `ActivityMetadata` | Activity metadata type |
| `ActivityType` | Activity type union (`'category_approved' | 'category_rejected' | 'product_approved' | 'product_rejected' | 'post_gifted' | 'post_gift_sent' | 'post_approved' | 'post_rejected'`) |
| `SupportersMetadata` | Supporters metadata type |

## Related

- [Supabase Types](./supabase)