# Newsletter Service — Backend Overview

This document gives backend developers a high-level map of the Newsletter Service: what it does, how the pieces fit together, and which external modules it depends on.

## What the Newsletter Service Does

The Newsletter Service lets any creator profile publish written posts — articles, updates, tutorials — with flexible access control. Readers can browse a public feed, like posts, purchase individual pay-per-post articles, or subscribe to a creator's membership plan for unlimited access.

The entire feature lives in the `public` schema of the Supabase Postgres database. There are no separate microservices; all business logic runs through PostgreSQL functions (RPCs) that are exposed to the client via Supabase's auto-generated REST and RPC endpoints.

## High-Level Architecture

```mermaid
flowchart TD
    subgraph Client["Client (Browser / App)"]
        FE["Frontend"]
    end

    subgraph Supabase
        Auth["auth.uid()"]
        REST["REST API + RPC"]
        PG["PostgreSQL"]
        Storage["Storage\n(post-images bucket)"]
        Cron["pg_cron"]
    end

    subgraph EdgeFunctions["Edge Functions (Deno)"]
        EPurchasePost["purchase-post"]
        EJoinMembership["join-membership"]
        EPaymentGW["Payment Gateway\n(SSLCommerz / ShurjoPay)"]
        EPolishPost["polish-post\n(AI polish & review)"]
    end

    FE -->|supabase-js| REST
    REST --> Auth
    REST --> PG
    FE -->|image upload| Storage
    FE -->|AI polish / review| EPolishPost
    EdgeFunctions --> PG
    EPaymentGW --> EPurchasePost
    EPaymentGW --> EJoinMembership
    EPurchasePost -->|purchase_newsletter_post()| PG
    EJoinMembership -->|purchase_newsletter_membership()| PG
    Cron -->|nightly 02:00 UTC| PG
```

## Design Decisions

### 1. Two-Flag Access Model

Access is controlled by **two independent booleans**, not a single status enum. This maps 1-to-1 with the two checkboxes in the Post Settings sidebar.

| `is_members_only` | `is_pay_per_post` | Who can read |
|---|---|---|
| `false` | `false` | Everyone — Public |
| `true` | `false` | Active newsletter member only |
| `false` | `true` | Purchase / gift / active member |
| `true` | `true` | Members read free; non-members can purchase |

The UI's "Premium" toggle is purely presentational: `Premium = is_members_only OR is_pay_per_post`.

### 2. Denormalised Counters

`newsletter_posts` carries `view_count`, `like_count`, `click_count`, `purchase_count`, and `revenue_total`. These are kept in sync by triggers (likes) and RPC calls (views, clicks, purchases) rather than being recomputed on every read. This keeps feed queries fast.

### 3. Draft Limit — 50 per Profile

A DB trigger (`trg_newsletter_draft_limit`) blocks an INSERT or a status change to `'draft'` when the profile already has 50 drafts. The `unpublish_newsletter_post()` RPC checks this quota before moving a post back to draft and returns a structured JSON error so the UI can display a warning dialog.

### 4. Version History Ring Buffer

`newsletter_post_versions` keeps the last **20 versions** per post. A trigger prunes older versions automatically after each insert. The `source = 'ai_polish'` row is the snapshot taken *before* the AI rewrote the content — restoring it is the "undo AI" action.

### 5. Service-Role–Only Payment RPCs

`purchase_newsletter_post()` and `purchase_newsletter_membership()` explicitly **reject** calls from authenticated users (`auth.uid() IS NOT NULL → raise exception`). They are called only by Edge Functions running under the service role, after the payment gateway has confirmed a charge.

### 6. Auto-Provisioning on Service Enable

When a creator enables the `newsletter` service in `user_services`, the trigger `on_newsletter_service_enabled` automatically creates a monthly membership plan at ৳299 (default) and links it to `newsletter_settings`. If a plan with `price > 0` already exists, the trigger skips the update to preserve user-configured pricing.

## Dependencies

The newsletter service depends on these modules being migrated first:

| Dependency | Source |
|---|---|
| `public.profiles` | `profiles.sql` |
| `public.transactions` | `transactions.sql` |
| `public.activities` | `activities.sql` |
| `public.membership_plans`, `public.profile_memberships` | `memberships.sql` |
| `public.user_services` | `user_services.sql` |
| `public.handle_updated_at()` | `common.sql` |
| `public.visibility_enum` | `common.sql` |
| `public.reference_type_enum` | `common.sql` |
| `public.payment_status_enum` | `common.sql` |
| `public.has_active_membership()` | `memberships.sql` |
| `public.process_service_payment()` | `payments.sql` |

## Module Inventory

| Part | Tables & Functions |
|---|---|
| **Part 1 — Core** | `newsletter_posts`, `newsletter_post_versions`, `newsletter_settings` |
| **Part 2 — Engagement** | `newsletter_post_likes`, `post_access_grants` |
| **Part 3 — Analytics** | `newsletter_post_analytics_daily` |
| **Part 4 — RPCs** | `check_newsletter_post_access`, `create_newsletter_draft`, `unpublish_newsletter_post`, `toggle_newsletter_post_like`, `gift_newsletter_post`, `record_newsletter_post_click`, `record_newsletter_post_view`, `get_newsletter_stats`, `get_post_analytics`, `get_posts_page`, `get_reader_feed`, `purchase_newsletter_post`, `purchase_newsletter_membership` |
| **Storage** | `post-images` bucket + `cleanup_orphaned_post_images()` cron job |
| **AI** | `polish-post` edge function — AI polish and editorial review |

## AI Features — `polish-post` Edge Function

The `polish-post` edge function provides two AI-powered writing tools in the editor. It is called directly from the frontend via `fetch` (not via `supabase-js`) using the user's session JWT.

### Modes

**`polish`** — Rewrites/improves one or more fields and returns the improved values as JSON.

**`review`** — Returns an array of editorial suggestions (`todos`) the author can act on before publishing. Each todo has a `field`, a human-readable `message` (written in the post's language), and a `severity` of `"warning"` or `"error"`.

### Content Types

The `contentType` field controls how much editorial latitude the AI takes. Pass this from the editor's content-type selector:

| `contentType` | Spelling/Grammar | Word choice | Structure | Content/facts |
|---|---|---|---|---|
| `"blog"` (default) | Fix | Improve | Suggest | Suggest gaps |
| `"tutorial"` | Fix | Improve | Suggest | Suggest gaps |
| `"review"` | Fix | Improve | Preserve | Preserve verdict |
| `"opinion"` | Fix | Improve | Preserve | Preserve argument |
| `"travel"` | Fix | Improve | Preserve | Preserve experiences |
| `"story"` | Fix | Preserve | Preserve | Preserve entirely |
| `"poetry"` | Fix | Preserve | Preserve | Preserve entirely |
| `"historical"` | Fix | Preserve | Preserve | Preserve entirely |
| `"news"` | Fix | Preserve | Preserve | Preserve entirely |

### Bangla Language Support

The prompts include explicit rules for standard written Bangla (প্রমিত বাংলা): common spelling errors, non-standard verb forms (হইছে→হয়েছে), word choice (অনেক→খুব for intensity), and পূর্ণচ্ছেদ (।) punctuation. Review messages for Bangla posts are returned in Bangla.

### Dialogue Preservation

For all content types, quoted speech and reported dialogue (text following speech verbs like বললো, said, replied) are auto-detected. Inside dialogue, only spelling errors are flagged — colloquial grammar and dialectal forms are left intact.

---

**Next:** [Database Tables & ER Diagram](./tables.md)
