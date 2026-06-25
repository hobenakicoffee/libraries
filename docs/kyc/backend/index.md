# KYC — Backend Reference

## Tables

### `kyc_sessions`

```sql
kyc_sessions (
  id bigint PK,
  profile_id uuid → profiles(id),
  token text unique,
  status kyc_session_status ('pending', 'opened', 'completed', 'expired', 'rejected'),
  expires_at timestamptz (30 min from creation),
  created_at,
  updated_at
)
```

### `kyc_documents`

```sql
kyc_documents (
  id bigint PK,
  profile_id uuid → profiles(id),
  session_id bigint → kyc_sessions(id),
  document_type kyc_document_type enum,
  storage_path text,
  status kyc_document_status enum,
  rejection_reason text,
  created_at,
  updated_at
)
```

### `kyc_verifications`

```sql
kyc_verifications (
  id bigint PK,
  profile_id uuid → profiles(id),
  verified_by uuid → managers(id),
  status kyc_verification_status ('approved', 'rejected'),
  rejection_reason text,
  verified_at,
  created_at
)
```

## Cron Jobs

| Job | Schedule | Description |
|---|---|---|
| `expire-kyc-sessions` | Hourly | Marks expired KYC sessions |
| `cleanup-kyc-orphaned-files` | Hourly | Removes orphaned storage files |

## Security

- **RLS**: Creators can only read/write their own KYC data
- **Storage**: `kyc-documents` bucket — private, 10MB limit, image types only

## Flow

1. Create session → 2. Upload documents → 3. Manager reviews → 4. Approved/rejected → 5. `profile.is_kyc_verified` + `is_verified` updated
