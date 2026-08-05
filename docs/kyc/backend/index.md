# KYC — Backend Reference

## Tables

### `kyc_sessions`

Short-lived session linking a desktop QR display to the mobile camera capture flow. Realtime subscription on this row drives the desktop UI when mobile submits.

```sql
kyc_sessions (
  id bigint PK,
  token uuid unique (QR URL param),
  profile_id uuid → profiles(id) on delete cascade,
  status kyc_session_status_enum ('pending', 'opened', 'submitted', 'expired'),
  expires_at timestamptz (default now() + 30 min),
  created_at,
  updated_at
)
```

One active session (`pending`/`opened`) per profile, enforced via a partial unique index. Updates blocked for `authenticated` — service role only.

### `kyc_submissions`

Permanent record of each verification attempt. `nid_front_path` / `nid_back_path` / `selfie_path` are Storage paths — never raw URLs; generate short-lived signed URLs server-side.

```sql
kyc_submissions (
  id bigint PK,
  profile_id uuid → profiles(id) on delete cascade,
  nid_number varchar(17),         -- BD NID: 10 digits (old) or 17 (Smart NID)
  nid_front_path text,            -- Storage path: {profile_id}/{path_prefix}/nid_front.jpg
  nid_back_path text,
  selfie_path text,
  status kyc_status_enum ('pending', 'under_review', 'approved', 'rejected', 'resubmit_requested'),
  reviewed_by uuid → profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,          -- shown to creator
  admin_notes text,                -- internal only, never exposed to creator
  attempt_number integer default 1,
  consent_given_at timestamptz,   -- PDPO 2025: consent log for biometric/ID data
  consent_ip inet,
  created_at,
  updated_at
)
```

`nid_number` / `nid_front_path` / `nid_back_path` / `selfie_path` are nullable and get purged (set to `null`) once their raw data is no longer needed, while the row itself is kept as a compliance stub (status, reviewer, timestamps, rejection reason, admin notes, consent log). This happens in two cases:

- **Automatically**, 7 days after the submission reaches `approved` or `rejected`, via the `cleanup-reviewed-kyc-documents` cron job. `resubmit_requested` is excluded since the creator is expected to submit a new attempt using these files soon.
- **On account closure**, immediately, via `close_account()` (see `edge-functions/backend/delete-user.md`).

One active submission (`pending`/`under_review`) per profile, enforced via a partial unique index.

## RPCs (service role only)

| Function | Purpose |
|---|---|
| `admin_approve_kyc(submission_id, reviewed_by, admin_notes)` | Sets `status='approved'`, grants `is_kyc_verified`/`is_verified` on `profiles`, logs an activity |
| `admin_reject_kyc(submission_id, reviewed_by, rejection_reason, admin_notes, request_resubmit)` | Sets `status` to `rejected` or `resubmit_requested`, logs an activity |
| `get_kyc_queue(status, limit, cursor)` | Cursor-paginated admin review queue |
| `cleanup_orphaned_kyc_documents()` | Deletes `kyc-documents` storage objects unreferenced by any submission row, older than 1 hour |
| `cleanup_reviewed_kyc_documents()` | Purges NID/document/selfie data (row + storage) for submissions `approved`/`rejected` more than 7 days ago |

All are `security definer`, `set search_path = ''`, and revoked from `public`/`anon`/`authenticated`.

## Cron Jobs

| Job | Schedule | Description |
|---|---|---|
| `expire-kyc-sessions` | Hourly (`0 * * * *`) | Marks stale `pending`/`opened` sessions as `expired` |
| `cleanup-kyc-orphaned-files` | Hourly, offset 30 min (`30 * * * *`) | Removes storage files not referenced by any submission row, older than 1 hour |
| `cleanup-reviewed-kyc-documents` | Daily (`0 3 * * *`) | Purges `nid_number`/`nid_front_path`/`nid_back_path`/`selfie_path` + matching storage files for submissions `approved`/`rejected` more than 7 days ago |

## Security

- **RLS**: Creators can only read their own KYC data. Inserts/updates on `kyc_submissions` are blocked for `authenticated` — handled exclusively by the `submit-kyc` edge function and admin RPCs (service role).
- **Storage**: `kyc-documents` bucket — private, 10MB limit, `image/jpeg|png|webp|heic`. Path convention: `{profile_id}/{path_prefix}/{nid_front|nid_back|selfie}.jpg`. Creators can upload/read only within their own `{auth.uid()}/` folder — no delete/update policy for users.

## Flow

1. `create-kyc-session` → 2. `generate-kyc-upload-urls` (signed uploads to `kyc-documents`) → 3. `submit-kyc` (validates NID format, verifies files exist, inserts `kyc_submissions`) → 4. Manager reviews via `admin_approve_kyc`/`admin_reject_kyc` → 5. `profile.is_kyc_verified` + `is_verified` updated on approval → 6. Sensitive columns purged 7 days after the terminal decision
