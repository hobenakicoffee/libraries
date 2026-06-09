# Creator Reports — Backend Overview

A moderation reporting system that lets users report creators for policy violations. Reports are stored with severity scoring, auto-flagging, and duplicate detection.

## Dependencies

| Dependency | Why |
|---|---|
| `public.profiles` | Creator FK, reporter FK (if authenticated), reviewer FK |

## Module Inventory

| Object | Type | Purpose |
|---|---|---|
| `public.report_category` | Enum | Categories for creator reports |
| `public.creator_reports` | Table | Report rows linking a reporter to a creator |
| `public.creator_report_summary` | Table | Denormalised per-creator stats for fast auto-flagging |
| `public.handle_creator_report_insert()` | Function (BEFORE INSERT) | Sets severity_score by category; auto-dismisses duplicates |
| `public.handle_creator_report_flagged()` | Function (AFTER INSERT) | Upserts summary; applies auto-flag rules |
| `public.handle_creator_report_status_change()` | Function (AFTER UPDATE) | Keeps `pending_reports` in sync on status transitions |
| `public.update_creator_report_status()` | RPC | Admin: update report status + notify the reported creator |
| `trg_creator_report_before_insert` | Trigger | Fires `handle_creator_report_insert` |
| `trg_creator_report_after_insert` | Trigger | Fires `handle_creator_report_flagged` |
| `trg_creator_report_after_status_update` | Trigger | Fires `handle_creator_report_status_change` |

## ER Diagram

```mermaid
erDiagram
    profiles {
        uuid id PK
    }
    creator_reports {
        uuid id PK
        uuid creator_id FK
        uuid reporter_user_id FK "nullable"
        text reporter_email
        enum category
        text description
        text evidence_url
        text evidence_file_path
        int severity_score
        text status
        text resolution_note
        uuid reviewed_by FK
        timestamptz reviewed_at
        timestamptz email_notified_at
        timestamptz created_at
    }
    creator_report_summary {
        uuid creator_id PK FK
        int total_reports
        int pending_reports
        timestamptz last_reported_at
        boolean is_flagged
        timestamptz flagged_at
        timestamptz updated_at
    }

    profiles ||--o{ creator_reports : "reported about"
    profiles ||--o{ creator_reports : "reported by (optional)"
    profiles ||--o{ creator_reports : "reviewed by"
    creator_reports ||--o| creator_report_summary : "aggregates"
```

## Design Decisions

### 1. Severity scoring by category
Each category maps to a severity score in the `BEFORE INSERT` trigger:

| Score | Categories |
|---|---|
| 10 | `illegal_activity`, `nudity_or_explicit_content` |
| 9 | `scam_or_fraud` |
| 8 | `hate_speech_or_discrimination` |
| 6 | `intellectual_property` |
| 5 | `bullying_or_harassment` |
| 4 | `inaccurate_or_misleading_info` |
| 3 | `incomplete_or_unfulfilled_orders` |
| 1 | `other` |

### 2. Partial unique index instead of `UNIQUE` constraint
The original spec had a `UNIQUE (creator_id, reporter_email, category)` constraint, but this would prevent the auto-dismiss duplicate flow (the duplicate insert would fail). Instead we use a **partial unique index** that only enforces uniqueness for non-finalised statuses (`pending`, `under_review`). When a duplicate arrives, the trigger sets `status = 'auto_dismissed'` and the insert succeeds (the index skips it).

```sql
CREATE UNIQUE INDEX idx_creator_reports_active_unique
  ON public.creator_reports (creator_id, reporter_email, category)
  WHERE status NOT IN ('auto_dismissed', 'resolved_actioned', 'resolved_dismissed');
```

### 3. Auto-flagging rules
The `AFTER INSERT` trigger upserts `creator_report_summary` and sets `is_flagged = true` when either condition is met:

- **3+ unique reporter emails** for the same creator in the last 24 hours (suggests coordinated or repeated violations)
- **severity_score >= 8** on the new report (illegal activity, nudity, scam, or hate speech)

The `flagged_at` timestamp is set once when the creator first becomes flagged, and never overwritten — preserving audit history of when flagging began.

### 4. Service-role-only access
Both tables use `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` with explicit deny-all policies for `authenticated` and `REVOKE ALL` for `anon`. Only the **service role** (bypassing RLS) can read or write these tables. All report creation and management happens through backend application code, not from the client directly.

### 5. Storage bucket: `report_evidence`
Private bucket (not publicly accessible) for uploaded evidence files. 10 MB limit, accepts image formats and PDF. No RLS policies exist — default-deny for all non-service-role access.

## RPCs

### `update_creator_report_status(p_report_id, p_new_status, p_resolution_note?)`

Manager-only RPC for reviewing reports from the admin panel.

**Permission required:** `content.moderate` (checked via `authorize_manager()`).

**Allowed target statuses:**

| Status | Meaning |
|---|---|
| `under_review` | Report has been picked up; investigation in progress |
| `resolved_actioned` | Report was valid; action taken against the creator |
| `resolved_dismissed` | Report was invalid or insufficient; dismissed by reviewer |

**Transition rules:**
- `auto_dismissed` → `under_review` is allowed (manual override / re-open)
- Already-resolved reports (`resolved_actioned`, `resolved_dismissed`) cannot be changed
- `pending` and `under_review` are valid source states

**`reviewed_by` / `reviewed_at`** are stamped only on final (`resolved_*`) transitions, not on `under_review`.

**Side-effect — in-app notification:**  
Inserts a `private` activity row into `public.activities` for the **reported creator** (`user_profile_id = creator_id`). The reviewing manager is stored as `counterparty_profile_id`. Metadata shape:

```json
{
  "activity_type": "report_status_updated",
  "report_id": "<uuid>",
  "old_status": "pending",
  "new_status": "resolved_dismissed",
  "resolution_note": "..."
}
```

Anonymous reporters (no `reporter_user_id`) are not notified in-app; email notification is handled separately via `email_notified_at`.

**Return value:**

```json
{ "success": true, "report_id": "...", "old_status": "pending", "new_status": "under_review" }
```

On error: `{ "success": false, "error": "FORBIDDEN" | "INVALID_STATUS" | "REPORT_NOT_FOUND" | "ALREADY_RESOLVED" }`

**Execute grant:** revoked from `public`, `anon`, `authenticated` — service role only.

## RLS Summary

| Table | anon | authenticated | service_role |
|---|---|---|---|
| `creator_reports` | No access (`REVOKE ALL`) | Deny-all policies (no CRUD) | Full access (bypasses RLS) |
| `creator_report_summary` | No access (`REVOKE ALL`) | Deny-all policies (no CRUD) | Full access (bypasses RLS) |
