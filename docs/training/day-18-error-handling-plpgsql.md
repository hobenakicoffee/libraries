# Day 18 — Error Handling & Custom Exceptions in PL/pgSQL

## Goal

By the end of today you can read and write `RAISE EXCEPTION` statements with proper error codes, understand `EXCEPTION` blocks, and know how database errors surface through to Edge Functions and the client app.

---

## Resources

- [PostgreSQL: Errors and Messages (RAISE)](https://www.postgresql.org/docs/current/plpgsql-errors-and-messages.html)
- [PostgreSQL: Trapping Errors](https://www.postgresql.org/docs/current/plpgsql-control-structures.html#PLPGSQL-ERROR-TRAPPING)
- [PostgreSQL Error Codes (Appendix A)](https://www.postgresql.org/docs/current/errcodes-appendix.html)

---

## Why this matters

Validation in this project doesn't happen in `IF` statements that return early with a "success: false" JSON — it happens via `RAISE EXCEPTION`. This single mechanism does three things at once:

1. **Stops execution immediately** — no further code in the function runs.
2. **Rolls back everything** the function did so far (Day 17) — atomicity for free.
3. **Propagates an error message and code** all the way to the Edge Function / client, where it can be matched and shown to the user.

If you don't understand `RAISE EXCEPTION`, you can't safely write validation logic anywhere in this codebase.

---

## `RAISE EXCEPTION` — the basics

```sql
RAISE EXCEPTION 'Something went wrong';
```

This immediately aborts the current function (and the whole transaction, per Day 17) and returns an error to the caller.

### With formatting

```sql
RAISE EXCEPTION 'Rate limit exceeded. You can only send % messages per % seconds',
  v_max_messages, v_window_seconds;
```

`%` is a placeholder, filled in order by the arguments after the message — like `printf` or template strings. From `messaging.sql`.

### Real validation examples (from `coffee_gifts.sql`)

```sql
if p_amount <= 0 then
  raise exception 'INVALID_AMOUNT'
    using errcode = 'P0001',
          detail  = 'Amount must be greater than zero.';
end if;

if p_creator_profile_id = p_supporter_profile_id then
  raise exception 'CANNOT_GIFT_SELF'
    using errcode = 'P0001',
          detail  = 'You cannot gift yourself.';
end if;
```

This is the standard pattern in this project:

- The **message** (`'INVALID_AMOUNT'`, `'CANNOT_GIFT_SELF'`) is a short, machine-readable, UPPER_SNAKE_CASE code — not a human sentence. This lets the Edge Function / frontend match on it (`if (error.message === 'CANNOT_GIFT_SELF') ...`) to show a translated, user-friendly message.
- The **`detail`** is a longer, human-readable explanation — useful for logs and debugging.
- **`errcode = 'P0001'`** is PostgreSQL's generic "raised exception" code (the default for `RAISE EXCEPTION` if you don't specify one). You'll also see other codes (below).

---

## `errcode` — choosing an error code

PostgreSQL has a large table of standard error codes (SQLSTATE codes), e.g. `23505` (unique violation), `23503` (foreign key violation). The range `P0001`–`P0009` (and any custom 5-character code starting with a letter) is reserved for **application-defined errors** — exactly what `RAISE EXCEPTION` without an explicit code uses (`P0001`).

### Real example with multiple custom codes (`feed.sql`)

```sql
if v_user_id is null then
  raise exception 'Not authenticated' using errcode = 'P0001';
end if;

if v_comment_id is null then
  raise exception 'Comment not found' using errcode = 'P0002';
end if;

if not v_is_owner then
  raise exception 'Not authorised to delete this comment' using errcode = '42501';
end if;
```

Note the last one: `42501` is the **standard PostgreSQL code for `insufficient_privilege`**. Using a standard code (instead of inventing a new `P000x`) means generic error-handling code (e.g., "if insufficient_privilege, return HTTP 403") works correctly without knowing about this specific function.

### Common codes you'll see or want to use

| Code | Meaning | When to use |
|------|---------|-------------|
| `P0001` | Generic raised exception (default) | General validation errors specific to this app |
| `P0002` | `no_data_found` (custom convention here) | "Record not found" |
| `42501` | `insufficient_privilege` | Authorization failures |
| `23505` | `unique_violation` | (Usually raised by PostgreSQL itself, not by you) |
| `23503` | `foreign_key_violation` | (Usually raised by PostgreSQL itself, not by you) |

---

## `EXCEPTION` blocks — catching errors

So far we've only *raised* errors. You can also *catch* them with an `EXCEPTION` block at the end of a `BEGIN ... END` block:

```sql
BEGIN
  -- risky code
EXCEPTION
  WHEN <condition> THEN
    -- handle it
END;
```

### Real example (`coffee_gifts.sql`)

```sql
create or replace function public.perform_coffee_gift(...)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- ... validation, wallet updates, insert ...

  return v_payment_result || jsonb_build_object(
    'success', true,
    'reference_id', v_reference_id
  );

exception
  when others then
    raise exception '%', sqlerrm;
end;
$$;
```

`WHEN OTHERS` catches **any** error not otherwise specified. Here it's used to **re-raise** the original error message (`sqlerrm` = "SQL error message", a built-in variable holding the caught error's text) — which on its own seems pointless (why catch just to re-raise the same thing?).

### Why catch-and-rethrow is used here

This pattern is mainly defensive/diagnostic: it gives you a single place to add logging, cleanup, or transformation of *any* error coming out of this function, without having to anticipate every possible failure mode (constraint violations, type errors, division by zero, etc.) individually. In practice, most functions in this codebase **don't** have an `EXCEPTION` block at all — they rely on `RAISE EXCEPTION` + automatic rollback (Day 17). Only add one when you have a specific reason to intercept an error (cleanup, translating a low-level error into an app-level code, retry logic).

### Catching a *specific* error

```sql
begin
  insert into public.wallets (profile_id, balance) values (p_profile_id, 0);
exception
  when unique_violation then
    -- someone else already created this wallet — that's fine, ignore it
    null;
end;
```

(In practice, this project prefers `ON CONFLICT DO NOTHING` — Day 17 — over catching `unique_violation`, because it's atomic and doesn't need a sub-block. But you should recognize this pattern when you see it.)

---

## How errors reach the client

1. PL/pgSQL function calls `RAISE EXCEPTION 'CANNOT_GIFT_SELF' USING errcode = 'P0001'`.
2. PostgreSQL aborts the transaction and returns a Postgres error to whatever called the function (PostgREST, for RPC calls; or an Edge Function via the Supabase client).
3. **Supabase client (`supabase-js`)** receives this as `{ data: null, error: { message: 'CANNOT_GIFT_SELF', code: 'P0001', details: '...', hint: '...' } }`.
4. **Edge Functions** (Day 9/14) typically check `error` and map it to an HTTP status + JSON response, e.g.:

```typescript
const { data, error } = await supabase.rpc('perform_coffee_gift', { ... });

if (error) {
  if (error.message === 'CANNOT_GIFT_SELF') {
    return new Response(JSON.stringify({ error: 'You cannot gift yourself' }), { status: 400 });
  }
  if (error.code === '42501') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  // fallback
  return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
}
```

This is why the **message string** matters so much — it's effectively a typed error code shared between SQL and TypeScript. Always use UPPER_SNAKE_CASE machine-readable messages for `RAISE EXCEPTION` in business-logic functions, matching the existing convention.

---

## `RAISE` levels other than `EXCEPTION`

`RAISE` can also log without aborting:

```sql
RAISE NOTICE 'Processing % rows', v_count;   -- visible to the client/logs, doesn't stop execution
RAISE WARNING 'Unexpected state for profile %', p_profile_id;
RAISE DEBUG 'v_balance = %', v_balance;
```

Only `RAISE EXCEPTION` (and above, `RAISE EXCEPTION` is the highest) aborts the transaction. `NOTICE`, `WARNING`, `DEBUG`, `INFO`, `LOG` are purely informational — useful while developing/debugging a function locally, but don't leave noisy `RAISE NOTICE` calls in production functions.

---

## Exercises

1. Open `supabase/schemas/feed.sql` and find every distinct `errcode` used. Group them by what kind of failure they represent (auth, not-found, validation, authorization).

2. Open `supabase/schemas/messaging.sql`. Find the rate-limit check. What message does it raise? What `errcode` does it use (or does it use the default)? How would you rewrite it to use a more specific machine-readable code following the `coffee_gifts.sql` convention?

3. Write a PL/pgSQL snippet (doesn't need to run) that validates a `p_amount` parameter: it must be greater than 0 and less than 100000. Use two separate `RAISE EXCEPTION` calls with distinct UPPER_SNAKE_CASE messages and `errcode = 'P0001'`.

4. Explain the difference between `RAISE EXCEPTION` and `RAISE WARNING`. If you wanted to log that a wallet balance is unexpectedly negative but still let the function continue, which would you use?

5. Open `supabase/schemas/kyc.sql` and find a function that checks `auth.role() <> 'service_role'`. What error code does it raise? Why might `42501` (`insufficient_privilege`) be a *more* appropriate choice than `P0001` here? Discuss with your tech lead — would changing this break any existing client error-handling code?

6. Trace one error end-to-end: pick `CANNOT_GIFT_SELF` from `coffee_gifts.sql`. Find (or imagine, if not yet implemented) the Edge Function that calls `perform_coffee_gift`. Write the TypeScript `if (error.message === ...)` branch that would handle this specific error and return a friendly message to the gifting UI.
