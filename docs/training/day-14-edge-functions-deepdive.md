# Day 14 — Edge Functions Deep-Dive: Real Functions in This Project

## Goal

By the end of today you've read every Edge Function in the project, understand the middleware chain in full detail, and can confidently add a new Edge Function following the existing conventions.

---

## Resources

- `supabase/functions/_shared/middelware/index.ts` — the middleware composer
- `supabase/functions/_shared/middelware/rate-limit-upstash.ts`
- `supabase/functions/_shared/arcjet/index.ts`
- [Upstash Redis docs](https://upstash.com/docs/redis/overall/getstarted)
- [Arcjet docs](https://docs.arcjet.com/)
- [Deno testing](https://docs.deno.com/runtime/fundamentals/testing/)

---

## The full middleware chain

`withMiddleware` (in `_shared/middelware/index.ts`) wraps every handler:

```typescript
export function withMiddleware(handler, options = {}) {
  return async (req: Request): Promise<Response> => {
    // 1. CORS preflight
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    // 2. AUTH — verify JWT, extract claims
    const claims = await verifyAuth(req);
    if (options.requireAuth && !claims) {
      return unauthorizedError();
    }

    // 3. RATE LIMIT — Upstash Redis sliding window
    if (options.rateLimit) {
      const rlResponse = await applyRateLimitUpstash(req, claims, options.rateLimit.tier, options.rateLimit.customKey);
      if (rlResponse) return rlResponse;
    }

    // 4. HANDLER — your actual logic
    const res = await handler(req, { claims });

    // 5. CORS headers attached to every response
    Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));

    return res;
  };
}
```

Every function in `supabase/functions/` follows this contract. Read it carefully — it's short but does a lot.

### `MiddlewareOptions`

```typescript
type MiddlewareOptions = {
  requireAuth?: boolean;
  rateLimit?: { tier: "strict" | "standard" | "relaxed"; customKey?: string };
};
```

`tier` controls the rate limit window/count — `strict` for expensive operations (exports, AI calls), `relaxed` for cheap reads.

---

## Rate limiting with Upstash

`_shared/middelware/rate-limit-upstash.ts` implements a sliding-window rate limiter backed by Upstash Redis (serverless Redis). The rate limit key is typically `{tier}:{userId or IP}`. If the limit is exceeded, it returns a `429 Too Many Requests` response before the handler runs.

---

## Arcjet — bot protection

`_shared/arcjet/index.ts` integrates [Arcjet](https://arcjet.com/), used for bot detection and an alternative rate-limiting backend (`rate-limit-arcjet.ts`). Used selectively on functions exposed to public/unauthenticated traffic (e.g., signup-adjacent flows).

---

## Reading every function in the project

Go through each function below. For each, identify: (1) what it does, (2) auth requirements, (3) rate limit tier, (4) what tables/RPCs it touches.

### `ai-editor-chat`
AI-assisted writing helper for the newsletter editor. Calls an LLM API. Strict rate limit (AI calls are expensive).

### `create-kyc-session`
Creates a session with the KYC verification provider. Requires auth. Returns a session URL/token for the client to redirect to.

### `download-shop-file`
Generates a time-limited signed URL for a purchased digital product. Verifies purchase ownership before issuing the URL.

### `export-shop-products`
CSV export of a creator's shop products (similar pattern to `export-transactions`).

### `export-transactions`
CSV export of a user's transaction history with filters (you read this on Day 9).

### `generate-kyc-upload-urls`
Generates signed upload URLs for KYC document submission — client uploads directly to storage without routing the file through the function.

### `generate-shop-theme`
AI-generated shop theme/branding suggestions based on the creator's profile/category.

### `moderate-content`
Runs content (post text, etc.) through moderation checks — likely combines `_shared/utils/moderation.ts` (bad word filtering) with an external moderation API.

### `polish-post`
AI-assisted text polishing/rewriting for newsletter posts.

### `submit-kyc`
Final submission of KYC data after document upload — validates and records the submission for manager review.

---

## `_shared/utils/moderation.ts` and bad-words filtering

```typescript
import { BANGLA_BAD_WORDS } from "../constants/bangla-bad-words.ts";
```

This project supports Bangla-language content moderation alongside English. The moderation utility checks text against this word list before allowing publication, in addition to any external moderation API call.

---

## `_shared/utils/csv.ts` — the CSV builder

```typescript
export type CsvColumnMap<T> = {
  [K in keyof T]?: {
    header: string;
    transform?: (value: unknown) => string;
  };
};

export function toCSV<T>(rows: T[], columns: CsvColumnMap<T>): string {
  // builds header row + data rows, applying transforms
}
```

This is a generic, reusable CSV serializer. `Pick<Tables<"...">, ...>` + `CsvColumnMap` gives full type safety: if you typo a column name, TypeScript errors at compile time.

---

## Edge Function tests

`supabase/functions/tests/` contains Deno tests for each function. Pattern:

```typescript
// supabase/functions/tests/export-transactions-test.ts
import { assertEquals } from "...";
import { createTestClient } from "./_helpers/client.ts";
import { startMockServer } from "./_helpers/mock-server.ts";

Deno.test("export-transactions requires auth", async () => {
  const res = await fetch(`${BASE_URL}/export-transactions`, { method: "POST" });
  assertEquals(res.status, 401);
});
```

Run all function tests:
```bash
cd supabase/functions
deno test --allow-all
```

`_helpers/setup.ts` and `_helpers/mock-server.ts` set up a local test environment and mock external APIs (so tests don't hit real third-party services).

---

## Writing a new Edge Function — checklist

When adding a new function to `supabase/functions/<name>/`:

1. Create `index.ts` with `Deno.serve(withMiddleware(handler, options))`
2. Choose `requireAuth` and `rateLimit.tier` appropriately
3. Use response helpers from `_shared/utils/response.ts` — never raw `new Response`
4. If querying user-scoped data, prefer the `anon`/user-scoped client + RLS; only use `SUPABASE_SERVICE_ROLE_KEY` when RLS genuinely can't express the access pattern, and manually scope queries by `claims.sub`
5. Add types from `src/supabase/types/supabase.ts` (`Tables<"table_name">`)
6. Write a test in `supabase/functions/tests/<name>-test.ts`
7. If a `deno.json` with extra dependencies is needed, add one in the function's folder
8. Update docs in `libraries/docs/` per the schema → docs sync rule (AGENTS.md)

---

## Exercises

1. Read `supabase/functions/_shared/middelware/rate-limit-upstash.ts` in full. What Redis data structure does it use for the sliding window? What headers does it return when a request is rate-limited?

2. Open `supabase/functions/submit-kyc/index.ts`. What validation does it perform before accepting a submission? What table(s) does it write to?

3. Open `supabase/functions/_shared/utils/moderation.ts` and `_shared/constants/bangla-bad-words.ts`. How does the moderation check work? Is it case-sensitive?

4. Open one test file in `supabase/functions/tests/`. Run it with `deno test --allow-all` (from `supabase/functions/`). Does it pass? What does `_helpers/mock-server.ts` mock?

5. Design (don't implement yet) a new Edge Function `get-creator-leaderboard` that returns the top 10 creators by `popularity_score`. Decide: does it need auth? What rate limit tier? Does it need the service role, or can it use the anon client (since `profiles` SELECT is public via RLS)?

6. Open `supabase/functions/_shared/constants/index.ts`. What constants are defined? Which ones relate to `corsHeaders`? Why is CORS needed for Edge Functions called from a browser?
