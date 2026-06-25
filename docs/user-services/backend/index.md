# User Services & Service Requests — Backend Reference

## `user_services` table

Per-creator toggle for available service types.

| Column | Type | Description |
|---|---|---|
| `profile_id` | uuid → profiles(id) | The creator |
| `service` | varchar | Service type key |
| `is_enabled` | boolean | Whether the service is active |
| `created_at` | timestamptz | When toggled |

**Constraint**: `unique(profile_id, service)` — one toggle per service per creator.

### Service types

`gift`, `subscription`, `shop`, `newsletter`, etc.

### Usage

- `get_explore_creators()` — filters by enabled services
- Feed — recommendation logic uses enabled services

## `service_requests` table

Feature request / suggestion system.

| Column | Type | Description |
|---|---|---|
| `id` | bigint PK | Auto-incrementing ID |
| `profile_id` | uuid → profiles(id) | Requesting user |
| `title` | text | Request title |
| `description` | text | Request details |
| `category` | varchar | Request category |
| `status` | varchar | Open, in-progress, completed, declined |
| `manager_notes` | text | Internal notes |
| `created_at` | timestamptz | When submitted |
| `updated_at` | timestamptz | Last update |

## RPCs

- CRUD operations for `service_requests` (create, read, update, delete)
