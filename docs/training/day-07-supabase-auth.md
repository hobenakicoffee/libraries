# Day 7 — Supabase Overview: Auth, Client SDK, and Local Dev

## Goal

By the end of today you understand what Supabase is, how authentication works in this project, what a JWT token is, and how to use the Supabase local development environment.

---

## Resources

- [Supabase documentation home](https://supabase.com/docs)
- [Supabase: How Auth works](https://supabase.com/docs/guides/auth/architecture)
- [Supabase: Auth overview](https://supabase.com/docs/guides/auth)
- [JWT explained visually](https://jwt.io/introduction/)
- [Supabase local development guide](https://supabase.com/docs/guides/cli/local-development)
- [Supabase JavaScript client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase config.toml reference](https://supabase.com/docs/guides/cli/config)

---

## What is Supabase?

Supabase is a backend-as-a-service (BaaS) built on top of PostgreSQL. It gives you:

| Feature | What it provides |
|---------|-----------------|
| **Database** | PostgreSQL — you write real SQL |
| **Auth** | User sign-up, login, JWTs, OAuth providers |
| **REST API** | Auto-generated from your schema (PostgREST) |
| **Realtime** | Listen to database changes over WebSocket |
| **Storage** | File storage with access control |
| **Edge Functions** | Serverless TypeScript functions (Deno runtime) |
| **Dashboard** | Studio UI for exploring data, running SQL, viewing logs |

The key difference from other BaaS products: you own the PostgreSQL database. All business logic lives in SQL functions and RLS policies — not locked into Supabase's own abstractions.

---

## The `auth` schema

Supabase manages a separate `auth` schema in the database. You never write directly to `auth.users` in application code, but you reference it constantly.

Key table: `auth.users`
- `id` — UUID, the user's identity everywhere
- `email` — the user's email
- `raw_user_meta_data` — JSONB of data passed at sign-up (e.g., `full_name`, `avatar_url`)
- `email_confirmed_at` — non-null if the email is verified

In this project, `public.profiles.id` is a foreign key to `auth.users.id`. Every authenticated user has exactly one profile.

---

## How Auth works: the JWT flow

1. User signs in (email/password, OAuth, magic link)
2. Supabase Auth creates a **JWT** (JSON Web Token) and returns it to the client
3. The client sends the JWT in the `Authorization: Bearer <token>` header on every request
4. PostgreSQL (via RLS) and Edge Functions verify the JWT and know who the user is

### What is a JWT?

A JWT is a base64-encoded, cryptographically signed token. It contains three parts separated by dots:

```
header.payload.signature
```

The payload (claims) contains things like:
```json
{
  "sub": "uuid-of-the-user",
  "email": "user@example.com",
  "role": "authenticated",
  "manager_role": "super_admin",
  "exp": 1234567890
}
```

The `sub` claim is the user's UUID. In SQL, `auth.uid()` returns this value.

### `auth.uid()` — getting the current user in SQL

This is the most important Supabase function you'll use in RLS policies:

```sql
-- "is this row owned by the currently authenticated user?"
WHERE id = (SELECT auth.uid())

-- "is this row created by the current user?"
WHERE profile_id = (SELECT auth.uid())
```

### `auth.jwt()` — reading JWT claims in SQL

```sql
-- get the manager_role claim (injected by custom_access_token_hook)
(auth.jwt() ->> 'manager_role')::public.manager_role
```

This is used in the `authorize_manager` function to check permissions without a database query.

---

## Custom JWT hook

This project extends the standard JWT with a custom hook (from `managers.sql`):

```sql
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB ...
AS $$
BEGIN
  -- look up manager role from the database
  SELECT role INTO user_role FROM public.manager_user_roles
  WHERE user_id = (event ->> 'user_id')::UUID;

  -- inject it into the JWT claims
  claims := jsonb_set(claims, '{manager_role}', to_jsonb(user_role));
  RETURN event;
END;
$$;
```

When a manager logs in, their `manager_role` is embedded in their JWT. Every subsequent request carries this role — no database lookup needed to check "is this person a finance_manager?".

This hook is configured in `supabase/config.toml`:

```toml
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/custom_access_token_hook"
```

---

## The three database roles

Supabase uses three PostgreSQL roles for RLS:

| Role | Who | When |
|------|-----|------|
| `anon` | Unauthenticated requests | No JWT provided |
| `authenticated` | Logged-in users | Valid JWT provided |
| `service_role` | Backend services | Service role key (bypasses RLS entirely) |

In this project:
- `anon` — **no access to any table** (locked down in the RLS audit)
- `authenticated` — can access their own data (scoped by `auth.uid()`)
- `service_role` — used in Edge Functions that need to bypass RLS (e.g., admin operations)

---

## Local development with Supabase CLI

```bash
# start the local stack (PostgreSQL + Auth + Storage + Studio)
supabase start

# the output shows local URLs:
# Studio:   http://localhost:54323
# API:      http://localhost:54321
# DB:       postgresql://postgres:postgres@localhost:54322/postgres

# check status
supabase status

# stop
supabase stop

# apply new migrations
supabase migration up

# run pgTAP tests
supabase test db

# generate TypeScript types from the schema
supabase gen types typescript --local > src/supabase/types/supabase.ts
```

The local Supabase stack runs entirely in Docker. It's a complete replica of the production environment.

---

## `config.toml` — project configuration

`supabase/config.toml` controls the local Supabase stack. Key sections:

```toml
[db]
port = 54322       # local database port
shadow_port = 54320

[api]
port = 54321       # REST API port

[studio]
port = 54323       # Studio dashboard port

[auth]
site_url = "http://localhost:3000"

[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/custom_access_token_hook"

[edge_runtime]
policy = "oneshot"   # for local testing
```

---

## The Supabase JavaScript client

The frontend and edge functions use `@supabase/supabase-js`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

// sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "secret",
});

// read data (respects RLS)
const { data: profiles } = await supabase
  .from("profiles")
  .select("id, username")
  .eq("is_page_active", true);

// call an RPC (stored function)
const { data } = await supabase.rpc("moderate_user", {
  p_user_id: "some-uuid",
  p_is_page_active: false,
});
```

The client automatically attaches the user's JWT to every request.

---

## How auth is verified in Edge Functions

From `supabase/functions/_shared/middelware/auth.ts`:

```typescript
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SB_PUBLISHABLE_KEY")!,  // anon key
);

export async function verifyAuth(req: Request): Promise<JwtClaims | null> {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) return null;
  return data.claims as JwtClaims;
}
```

The edge function extracts the Bearer token from the request header, verifies it with Supabase Auth, and gets back the JWT claims (including `sub` = user UUID and `manager_role`).

---

## Exercises

1. Read the [Supabase Auth overview](https://supabase.com/docs/guides/auth). Summarize in 3 bullet points how authentication works end-to-end.

2. Go to [jwt.io](https://jwt.io/) and paste in any JWT token (you can use a test token from `supabase start` output). What fields are in the payload?

3. Start the local Supabase stack (`supabase start`). Open Studio at `http://localhost:54323`. Navigate to Authentication → Users and see the test users created by seeds.

4. In Studio's SQL editor, run `SELECT auth.uid();`. What does it return when you're not authenticated? Now look at the RLS policies — why does this matter?

5. Open `supabase/config.toml`. Find the `[auth.hook.custom_access_token]` section. What URI is it pointing to? Open that function in `managers.sql` and re-read it now that you understand the JWT context.

6. Open `supabase/functions/_shared/middelware/auth.ts`. Trace the full auth verification flow: what happens step by step when an Edge Function receives a request with a Bearer token?
