# Settings — Backend Reference

## User Sessions (Active Devices)

Schema: `supabase/schemas/user_sessions.sql`. RPC-only — no new table. Wraps GoTrue's own
`auth.sessions`, which already carries device/IP/last-active data populated automatically on
every sign-in/refresh. The `auth` schema is not exposed via PostgREST, so this is the only way
to read/manage it from the client.

All three RPCs are `authenticated`-only (never `anon`) and act only on the caller's own
`auth.uid()` — there is no target-user parameter anywhere in this surface.

### `list_my_sessions()`

Returns one row per session belonging to the caller, most recently active first:

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key of `auth.sessions`, pass to `revoke_my_session` |
| `created_at` | timestamptz | When this session was first created (sign-in) |
| `updated_at` | timestamptz | |
| `refreshed_at` | timestamptz | Last token refresh — best "last active" proxy |
| `not_after` | timestamptz | Session's own expiry cutoff, if configured |
| `ip` | inet | IP at last sign-in/refresh |
| `user_agent` | text | Raw UA string — client parses for device/browser display |
| `aal` | text | Auth assurance level (`aal1`/`aal2`) |
| `is_current` | boolean | True for the session matching the caller's own JWT `session_id` claim |

### `revoke_my_session(p_session_id uuid)`

Deletes one of the caller's own sessions. Raises `session_not_found` (`P0002`) if the id
doesn't belong to the caller — deliberately indistinguishable from a nonexistent id, so a
caller can't probe for other users' session ids. Revoking your own current session is allowed
(self-logout-this-device).

### `revoke_other_sessions()`

Deletes every session for the caller except the current one. Returns the number of sessions
revoked (`integer`).

### Impersonation guard

Both mutators raise `impersonation_not_permitted` (`42501`) if the caller's JWT carries an
`impersonated_by` claim — a manager riding a support/impersonation session (see
[Managers & RBAC](../../managers-and-rbac/backend/index)) must never be able to revoke the
real user's other devices. `list_my_sessions` is unaffected (read-only, no guard).

### Known limitation — revocation is not instant

Deleting an `auth.sessions` row blocks that device from **refreshing** its token, but the
**access token already issued** to that device stays valid until its own `exp` claim (the
project's configured JWT lifetime, commonly up to 1 hour) — GoTrue has no
token-revocation/deny-list. A revoked device is logged out the next time it needs to refresh,
not instantly.
