# Supporters — Backend Reference

## `supporters` table

Tracks unique supporter relationships between creators and their supporters.

### Key Columns

| Column | Type | Description |
|---|---|---|
| `profile_id` | uuid → profiles(id) | The creator receiving support |
| `supporter_id` | uuid → profiles(id) | The user providing support |
| `first_supported_at` | timestamptz | First time this supporter supported this creator |
| `last_supported_at` | timestamptz | Most recent support timestamp |
| `total_amount` | numeric | Cumulative support amount |
| `support_count` | integer | Number of support transactions |
| `is_active` | boolean | Whether the supporter relationship is active |

### Constraints

- **Unique** on `(profile_id, supporter_id)` — one record per supporter/creator pair
- **Triggers**: On supporter insert/update, updates `profile.total_supporter_count` on the creator's profile

### RPCs

- `get_supporter_count(profile_id)` — returns total active supporters
- `toggle_supporter_active(profile_id, supporter_id)` — toggle `is_active` status
