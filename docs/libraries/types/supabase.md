# Supabase Types

Full Supabase database types with Row, Insert, and Update types for each table.

## Usage

```ts
import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from "@hobenakicoffee/libraries/types";
```

## Database Type

```ts
type DB = Database;
```

## Table Types

```ts
type Profile = Tables<"profiles">;
type Transaction = Tables<"transactions">;
type Supporter = Tables<"supporters">;
```

## Insert Types

```ts
type NewProfile = TablesInsert<"profiles">;
type NewTransaction = TablesInsert<"transactions">;
```

## Update Types

```ts
type ProfileUpdate = TablesUpdate<"profiles">;
```

## Enum Types

```ts
type PaymentStatus = Enums<"payment_status_enum">;
type SupporterPlatform = Enums<"supporter_platform_enum">;
```

## Database Tables

- `activities` - User activity tracking
- `coffee_gifts` - Coffee gift transactions
- `conversation_participants` - Chat participants
- `conversations` - Chat conversations
- `follows` - User follow relationships
- `manager_role_permissions` - Manager role permissions
- `manager_user_roles` - Manager user role assignments
- `managers` - Manager profiles
- `messages` - Chat messages
- `messages_*` - Monthly partitioned message tables
- `payout_methods` - User payout methods
- `profiles` - User profiles
- `supporters` - Supporter records
- `transactions` - Payment transactions
- `wallets` - User wallets
- `withdrawal_requests` - Withdrawal requests

## Database Enums

- `manager_permission` - Manager permissions
- `manager_role` - Manager roles
- `manager_status` - Manager account status
- `payment_status_enum` - Payment statuses
- `payout_provider` - Payout provider types
- `provider_enum` - Payment providers
- `reference_type_enum` - Transaction reference types
- `supporter_platform_enum` - Supporter platform types
- `transaction_direction_enum` - Debit/credit
- `user_role` - User roles
- `visibility_enum` - Public/private visibility
- `withdrawal_status` - Withdrawal request statuses

## Related

- [Types Overview](./overview)