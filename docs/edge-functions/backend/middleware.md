# Middleware Infrastructure

Every edge function in this project is wrapped with `withMiddleware()` — a shared composer that standardises CORS, authentication, and rate limiting across all functions.

## `withMiddleware()` Composer

```typescript
import { withMiddleware } from "../_shared/middelware/index.ts";

Deno.serve(
  withMiddleware(async (req, { claims }) => {
    // handler logic
    return okResponse({ result });
  }, {
    requireAuth: true,
    rateLimit: { tier: "strict" },
  }),
);
```

### Execution Order

```mermaid
flowchart TD
    A[Request arrives] --> B{Method = OPTIONS?}
    B -->|Yes| C[Return 200 + corsHeaders]
    B -->|No| D[verifyAuth\nRead Authorization header]
    D --> E{requireAuth AND\nno claims?}
    E -->|Yes| F[Return 401 Unauthorized]
    E -->|No| G{rateLimit tier set?}
    G -->|Yes| H[applyRateLimitUpstash\nSliding window check]
    H --> I{Limit exceeded?}
    I -->|Yes| J[Return 429 Too Many Requests]
    I -->|No| K[Run handler]
    G -->|No| K
    K --> L[Attach corsHeaders\nto response]
    L --> M[Return response]
```

## Authentication Flow

The `verifyAuth()` function (from `_shared/middelware/auth.ts`) handles JWT verification:

1. Reads the `Authorization` header from the incoming request
2. Extracts the Bearer token
3. Calls `supabase.auth.getClaims(token)` to parse and verify the JWT
4. Returns `JwtClaims` (containing `sub` — the user UUID) on success, or `null` on failure

```typescript
export async function verifyAuth(req: Request): Promise<JwtClaims | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const { data, error } = await supabaseClient.auth.getClaims(token);
  if (error || !data?.claims) return null;

  return data.claims as JwtClaims;
}
```

**Note:** `verify_jwt = false` is set for all functions in `supabase/config.toml`. This disables Supabase's built-in JWT gateway because the custom `verifyAuth()` middleware is used instead — allowing the middleware chain to handle CORS and rate limiting before auth.

### `JwtClaims` Shape

```typescript
type JwtClaims = {
  sub: string;        // user UUID (profile_id)
  aud: string;        // audience
  exp: number;        // expiry timestamp
  iat: number;        // issued at timestamp
  // ... optional custom claims
};
```

## Rate Limiting

### Primary: Upstash Redis (Sliding Window)

The primary rate limiter (`_shared/middelware/rate-limit-upstash.ts`) uses Upstash Redis with a sliding-window algorithm. The rate limit key is `{tier}:{userId or IP}`.

When a request exceeds the limit, it returns a `429 Too Many Requests` response with retry headers.

### Secondary: Arcjet

Arcjet (`_shared/arcjet/index.ts`) is available as a secondary rate-limiting and bot-detection backend (`rate-limit-arcjet.ts`). It is primarily used for functions exposed to public/unauthenticated traffic. Currently commented as **not** the primary rate limiter in the middleware — Upstash handles all rate limiting by default.

### Rate Limit Tiers

| Tier | Window | Max Requests | Used By |
|---|---|---|---|
| `public` | 10 seconds | 10 | Public-facing endpoints |
| `auth` | 60 seconds | 5 | Authenticated read operations |
| `ai` | 60 seconds | 3 | AI/LLM calls (expensive) |
| `strict` | 60 seconds | 2 | Destructive/rare operations |

### `MiddlewareOptions` Type

```typescript
type MiddlewareOptions = {
  requireAuth?: boolean;
  rateLimit?: {
    tier: "public" | "auth" | "ai" | "strict";
    customKey?: string;   // override the rate limit key (default: `${tier}:${userId || IP}`)
  };
};
```

## CORS Handling

CORS headers are defined in `_shared/constants/index.ts` and applied in two places:

1. **Preflight** (`OPTIONS`): Returns `200 OK` with `corsHeaders` immediately — the handler never runs.
2. **Every response**: After the handler executes, `corsHeaders` are attached to the response via `Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v))`.

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};
```

## Response Helpers

From `_shared/utils/response.ts` — always use these instead of raw `new Response()`:

| Helper | Status | Use Case |
|---|---|---|
| `okResponse(data)` | 200 | Successful JSON response |
| `badRequestError(msg)` | 400 | Invalid input |
| `unauthorizedError()` | 401 | Missing/invalid auth |
| `methodNotAllowedError()` | 405 | Wrong HTTP method |
| `internalError(msg)` | 500 | Unexpected server error |
| `csvResponse(csv, filename)` | 200 | CSV file download |

## Security Notes

- **SIP (Service Identity Prevention)**: The `SUPABASE_SECRET_KEYS` environment variable validates request origin — prevents external impersonation of the service role.
- **Service role usage**: Functions use `supabaseAdmin` (service role client) only when RLS genuinely cannot express the access pattern. When querying user-scoped data, the anon/client with RLS is preferred and queries are manually scoped by `claims.sub`.
