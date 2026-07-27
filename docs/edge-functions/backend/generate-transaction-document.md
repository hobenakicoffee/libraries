# generate-transaction-document

Renders a PDF **receipt** for any transaction, or a PDF **invoice** for a
platform-subscription payment that carries an invoice number. Documents are
generated fresh on every request and never stored.

```
GET /functions/v1/generate-transaction-document
      ?transaction_id=<uuid>
      &type=invoice|receipt
Authorization: Bearer <user access token>
```

| | |
|---|---|
| Method | `GET` |
| Auth | Required (`withMiddleware`, `requireAuth: true`) |
| Rate limit tier | `download` (20 req / 60s per user) |
| `verify_jwt` | `false` — the function owns its auth check |
| Response | `application/pdf`, `Content-Disposition: attachment`, `Cache-Control: no-store` |

The dedicated `download` tier exists because the limiter runs inside
`withMiddleware` **before** the handler, so `4xx` responses consume budget too.
On the `auth` tier (5/60s) a user working through a year of billing history, or
clicking a stale row and getting `404` twice, hit `429` on a plain download.

## Authorization model

Unlike `export-transactions` / `export-billing-history`, which use the
service-role client and filter by `user_profile_id` in application code, this
function builds a **caller-scoped** client per request from the incoming
`Authorization` header:

```ts
const callerClient = createClient(SUPABASE_URL, getPublishableKey(), {
  global: { headers: { Authorization: authHeader } },
});
```

The existing `"Users and managers can view transactions"` RLS policy then does
the ownership check, so there is no service-role client that could over-fetch.
The client must never be hoisted to module scope — a cached one leaks a
caller's header across concurrent requests on a warm isolate.

## Responses

| Status | `error` | When |
|---|---|---|
| `200` | — | PDF bytes |
| `400` | `invalid_transaction_id` | `transaction_id` is not a uuid |
| `400` | `invalid_type` | `type` is not `invoice` or `receipt` |
| `400` | `document_not_available` | Row is `direction = 'credit'` — money the caller received, not paid |
| `401` | `unauthorized` | Missing/invalid token |
| `404` | `not_found` | Row does not exist **or** RLS filtered it out |
| `405` | `method_not_allowed` | Not a `GET` |
| `409` | `transaction_not_completed` | `status` is not `completed` |
| `409` | `transaction_disputed` | Invoice requested for a row with `is_disputed = true` |
| `409` | `invoice_number_unassigned` | Row has no `invoice_number` (not one of the eligible service types, or predates invoice numbering); use the receipt |
| `500` | `internal_server_error` | Query or render failure |

`404` rather than `403` for another user's row is intentional: the endpoint must
not let a caller distinguish "not yours" from "does not exist".

### Why `direction` and `status` are checked separately from RLS

RLS scopes by `user_profile_id`, which is the row's **owner** — and for a credit
row that owner is the *recipient*. `handle_successful_payment` writes the
creator's side of a gift, and `request_withdrawal` writes payouts, both as
`direction = 'credit'` rows owned by the creator. Without the explicit guard those
rows pass RLS and render as `RECEIPT / BILL TO Customer / Amount paid`, asserting
the caller paid money they were in fact paid. Payout statements are a separate
document type that does not exist yet.

Likewise, the renderers label the total "Amount paid" / "Total" unconditionally,
so a `pending`, `failed`, `reversed` or `refunded` row would otherwise produce a
document asserting a payment that never settled. Receipts stay available for
disputed rows — the payment did happen — but invoices do not, since a chargeback
under review must not yield a clean tax invoice.

## Document contents

Both documents share a header (the HobeNakiCoffee wordmark logo, document
number, issue date, **From** / **Bill To**) and a payment footer (provider,
masked gateway reference, status).

- **Invoice** — document number `INV-<number padded to 6>`, one line item (plan
  name + billing period + amount), a **Total**, and either a VAT line or an
  explicit "VAT not applicable" note depending on whether `company_vat_bin` is
  set in [platform settings](../../platform-settings/backend/index).
  `platform_fee` / `net_amount` are deliberately **not** printed: the fee is 0
  for subscriptions and the split is an internal ledger concept, not a
  customer-facing invoice line.
- **Receipt** — document number `RCPT-<transaction id>`, a human label derived
  from `service_type`, and the amount paid. Unknown `service_type` values fall
  back to a title-cased form, since the column is a bare `varchar(50)` with no
  check constraint.

Where present, the frozen `metadata->'invoice'` snapshot is authoritative — see
[Invoice numbering](../../payments-and-memberships/backend/transactions#invoice-numbering).
Live `platform_settings` / `profiles` data is only a fallback.

Only rows with a non-null `invoice_number` carry that snapshot — platform
subscriptions, coffee gifts, and membership (newsletter plan) purchases — so
for shop orders and one-time newsletter post purchases the seller block comes
entirely from the fallback. It is read with `get_company_identity()` — see
[platform settings](../../platform-settings/backend/index) — which is the one
settings reader granted to `authenticated`, so the call stays on the same
caller-scoped client and no service-role client is introduced. An error there is
non-fatal: the function logs it and falls back to the hardcoded platform name,
since a receipt without the address beats no receipt at all.

## Logo

The header draws the wordmark as an image rather than plain text, embedded via
`pdf.embedPng()`. The asset at
`generate-transaction-document/assets/logo-full.png` is a 480x107 downscale of
`marketing/public/logo-full.png` — full resolution buys nothing at the ~22pt
header height it renders at and would only bloat every document (the resized
copy is ~27KB). It ships as a `static_files` asset alongside the Bengali font
and is read once per isolate by the same `loadFonts()` helper.

## Fonts

Layout lives in `_shared/pdf/transaction-document.ts`. Text is split into
per-script runs: Latin draws with pdf-lib's built-in Helvetica (zero embedded
bytes), Bengali runs — which includes ৳ (U+09F3) — with an embedded Noto Sans
Bengali shipped as a `static_files` asset. Four constraints forced that shape,
each verified:

1. Helvetica is WinAnsi-only and throws outright on Bangla display names and ৳.
2. `@pdf-lib/fontkit` cannot shape Bengali at all — its UMD bundle omits the
   Indic shaper, so the whole Bengali block fails with
   `this.shaper.plan is not a function`. Full `fontkit` is used instead.
3. `subset: true` needs `subset.encodeStream()`, an API fontkit 2 dropped, so
   runtime subsetting is off. Pre-subsetting offline does not help either:
   fontkit's `createSubset()` emits no `cmap` table.
4. Noto Sans Bengali carries no Latin glyphs (135 codepoints), so Latin cannot
   simply share it.

The Bengali face is embedded lazily on the first Bengali run, keeping a typical
document around 75KB. Characters outside both faces are replaced with `?` so an
exotic display name degrades instead of 500-ing.

## Frontend usage

A bare `<a href>` cannot carry the auth header, so the download must go through
`fetch` → `blob()` → a programmatic anchor. Show **Download Invoice** only when
the row's `invoice_number` is non-null; it is exposed by `get_transactions_page`
and by a direct `transactions` select.

Offer either button only on rows with `direction = 'debit'` and
`status = 'completed'` — both are returned by `get_transactions_page`. The
endpoint enforces this regardless, but a button that always `400`s is worse than
no button.

## Tests

`supabase/functions/tests/generate-transaction-document-test.ts`, registered in
the `test:unit` task in `supabase/functions/deno.json`. The `download` tier
(20 req / 60s) leaves ample headroom, but the steps are still split across two
users so the cross-user `404` has a second identity to be denied from.

The suite runs without Upstash credentials: the placeholder host in
`supabase/functions/.env.test` is detected as unconfigured and enforcement is
skipped. See
[Unconfigured environments](./middleware#unconfigured-environments).
