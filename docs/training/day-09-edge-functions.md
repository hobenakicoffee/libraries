# Day 9 — Edge Functions: Deno + TypeScript Serverless

## Goal

By the end of today you understand what Deno is, how to read and write a Supabase Edge Function, how middleware works in this project, and how to test functions locally.

---

## Resources

- [Supabase Edge Functions overview](https://supabase.com/docs/guides/functions)
- [Deno documentation](https://docs.deno.com/)
- [Deno: HTTP server basics](https://docs.deno.com/runtime/fundamentals/http_server/)
- [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html) — focus on Types, Interfaces, Generics
- [Supabase: Calling Edge Functions from the client](https://supabase.com/docs/guides/functions/invoke-function)
- [Supabase: Edge Functions secrets](https://supabase.com/docs/guides/functions/secrets)

---

## What is Deno?

Deno is a modern JavaScript/TypeScript runtime (like Node.js but with security-first design and built-in TypeScript support). Supabase Edge Functions run on Deno.

Key differences from Node.js:
- TypeScript is first-class — no build step needed
- No `node_modules` — imports use URLs or `npm:` specifiers
- Secure by default — no file/network/env access without explicit permission
- Web-standard APIs — uses `fetch`, `Request`, `Response`, `URL` (same as browsers)

---

## Anatomy of an Edge Function

Every Edge Function lives in `supabase/functions/<function-name>/index.ts`.

The entry point is `Deno.serve()`:

```typescript
Deno.serve(async (req: Request) => {
  return new Response("Hello!", { status: 200 });
});
```

---

## The middleware pattern

This project wraps every function with `withMiddleware` from `_shared/middelware/index.ts`:

```typescript
import { withMiddleware } from "../_shared/middelware/index.ts";

Deno.serve(
  withMiddleware(async (req, { claims }) => {
    // your handler logic
    return new Response(JSON.stringify({ ok: true }));
  }, {
    requireAuth: true,            // reject unauthenticated requests
    rateLimit: { tier: "strict" }, // rate limiting via Arcjet/Upstash
  }),
);
```

`withMiddleware` handles:
1. **Auth verification** — validates the JWT, extracts claims (user UUID, manager_role)
2. **Rate limiting** — throttles requests to prevent abuse
3. **Error handling** — catches unhandled exceptions before they surface to users

The handler receives `req` (the raw Request) and `{ claims }` (the verified JWT claims). `claims.sub` is the user's UUID.

---

## The `_shared/` directory

Shared utilities used across all functions:

```
_shared/
  arcjet/index.ts           -- bot detection and rate limiting (Arcjet)
  constants/index.ts        -- shared constants (platform fee, etc.)
  middelware/
    auth.ts                 -- JWT verification
    index.ts                -- withMiddleware composer
    rate-limit-arcjet.ts    -- rate limit via Arcjet
    rate-limit-upstash.ts   -- rate limit via Upstash Redis
  types/index.ts            -- shared TypeScript types
  upstash/index.ts          -- Redis client for rate limiting
  utils/
    csv.ts                  -- CSV generation
    index.ts                -- misc helpers
    moderation.ts           -- content moderation
    response.ts             -- standardized HTTP responses
```

---

## Response helpers

From `_shared/utils/response.ts`:

```typescript
// 200 OK with JSON
okResponse({ data: result })

// 400 Bad Request
badRequestError("Invalid JSON body")

// 401 Unauthorized
unauthorizedError()

// 405 Method Not Allowed
methodNotAllowedError()

// 500 Internal Server Error
internalError("Failed to fetch transactions")

// CSV file download
csvResponse(csvString, "filename.csv")
```

Always use these helpers for consistency. Never build a `new Response(...)` manually in a handler.

---

## Full example: `export-transactions`

Let's read `supabase/functions/export-transactions/index.ts` section by section.

### 1. Imports

```typescript
import { createClient } from "@supabase/supabase-js";
import { withMiddleware } from "../_shared/middelware/index.ts";
import { badRequestError, csvResponse, internalError, methodNotAllowedError } from "../_shared/utils/response.ts";
import { type CsvColumnMap, toCSV } from "../_shared/utils/csv.ts";
import type { Tables } from "../../../src/supabase/types/supabase.ts";
```

- `@supabase/supabase-js` — the Supabase client library
- `Tables<"transactions">` — auto-generated TypeScript type for the `transactions` table

### 2. Type definitions

```typescript
type TransactionRow = Pick<
  Tables<"transactions">,
  "id" | "service_type" | "net_amount" | "status" | ...
>;
```

`Pick<T, Keys>` creates a new type with only the specified keys from type `T`. This ensures type safety — only the fields we actually use.

### 3. Service role client

```typescript
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
```

Uses the service role key to bypass RLS. This function queries transactions for a specific user, so it explicitly filters `WHERE user_profile_id = profileId` — the function enforces data isolation itself.

### 4. The handler

```typescript
Deno.serve(
  withMiddleware(async (req, { claims }) => {
    if (req.method !== "POST") return methodNotAllowedError();

    const filters = await req.json();
    const profileId = claims?.sub;
    if (!profileId) return badRequestError("Unauthorized");

    let query = supabaseAdmin
      .from("transactions")
      .select("id, service_type, ...")
      .eq("user_profile_id", profileId)   // scope to this user
      .limit(10000);

    // apply filters...

    const { data, error } = await query;
    if (error) return internalError("Failed to fetch transactions");

    const csv = toCSV(data, TRANSACTION_COLUMNS);
    return csvResponse(csv, `transactions-${timestamp}.csv`);
  }, { requireAuth: true, rateLimit: { tier: "strict" } }),
);
```

---

## Environment variables

Edge Functions access secrets via `Deno.env.get()`:

| Variable | What it is |
|----------|-----------|
| `SUPABASE_URL` | Auto-provided by Supabase |
| `SUPABASE_ANON_KEY` | Auto-provided (use for user-scoped queries) |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided (bypasses RLS — use carefully) |
| `SB_PUBLISHABLE_KEY` | Custom secret (same as anon key, set via CLI) |

In local dev, secrets go in `supabase/functions/.env`. Never commit this file.

---

## `deno.json` — imports and configuration

Each function (and the root `functions/deno.json`) defines import maps:

```json
{
  "imports": {
    "@supabase/supabase-js": "npm:@supabase/supabase-js@^2",
    "arcjet": "npm:arcjet@^1"
  }
}
```

Instead of `node_modules`, Deno resolves `npm:` imports from the npm registry. The `deno.lock` file pins exact versions.

---

## Running functions locally

```bash
# serve all functions locally
supabase functions serve

# serve one specific function
supabase functions serve export-transactions

# test with curl
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/export-transactions' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"dateRange": {"from": "2026-01-01"}}'
```

Get a test JWT from Studio: Authentication → Users → click a user → "..." menu → "Copy JWT".

---

## TypeScript types generated from the schema

```bash
supabase gen types typescript --local > src/supabase/types/supabase.ts
```

This generates TypeScript types that match your database schema exactly. `Tables<"transactions">` gives you a type with all the columns and their correct TypeScript types — no manual typing needed.

---

## Exercises

1. Read the [Supabase Edge Functions overview](https://supabase.com/docs/guides/functions). What are the constraints on Edge Functions? (Max execution time, max memory, etc.)

2. Open `supabase/functions/_shared/middelware/index.ts`. Read the full file. What does `withMiddleware` do step by step? When does it reject a request before reaching your handler?

3. Open `supabase/functions/moderate-content/index.ts`. What does this function do? What authentication does it require? What does it return?

4. Open `supabase/functions/_shared/utils/response.ts`. What HTTP status code does each helper return? Why does the project use a shared `response.ts` instead of writing `new Response(...)` inline?

5. Start `supabase functions serve` and call the `export-transactions` function with curl (grab a JWT from Studio). What response do you get?

6. Open `supabase/functions/generate-shop-theme/index.ts`. This function uses an AI model. What model does it call? What does it generate? Trace the full request flow.
