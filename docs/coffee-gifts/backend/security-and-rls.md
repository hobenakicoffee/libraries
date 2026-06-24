# Security & Row Level Security

The coffee gifts service uses two layers of security: **Row Level Security (RLS)** on the `coffee_gifts` table controls what clients can read and write, and the **`SECURITY DEFINER`** attribute on the RPCs ensures that all writes go through trusted server-side code.

---

## Row Level Security Policies

RLS is enabled on the `coffee_gifts` table:

```sql
ALTER TABLE public.coffee_gifts ENABLE ROW LEVEL SECURITY;
```

### SELECT — Viewing Gifts

**Authenticated users** can view all coffee gifts (public data):

```sql
CREATE POLICY "Users can view coffee gifts"
ON public.coffee_gifts
FOR SELECT
TO authenticated
USING (
  true
  or supporter_profile_id = (select auth.uid())
  or creator_profile_id   = (select auth.uid())
);
```

::: info
The `true` short-circuit in the `USING` clause means every authenticated user can see every gift — it's designed as public data. The `OR` clauses exist as documentation/intent markers and are logically redundant given the `true`. If you want to restrict visibility to only the parties involved, remove `true` and keep the `OR` conditions.
:::

**Anonymous (unauthenticated) users** can also see all gifts:

```sql
CREATE POLICY "Anonymous can view coffee gifts"
ON public.coffee_gifts
FOR SELECT
TO anon
USING (true);
```

This policy is intentional — gift feeds on creator profile pages are public.

### INSERT — Creating Gifts

::: warning
**Security fix (SEC-08, 2026-06-24):** the previous direct `INSERT` policy let an authenticated user attribute gift rows to themselves without any payment actually occurring (e.g. a creator inserting gifts as their own social-proof, inflating `get_creator_coffee_gifts_stats`). That policy has been **removed entirely**; `insert` is now revoked from `authenticated`/`anon` at the grant level. All gifts (authenticated or anonymous) are written exclusively via `perform_coffee_gift()` (service role).
:::

```sql
revoke insert on public.coffee_gifts from authenticated, anon;
```

`coffee_count` also now has an upper bound (`check (coffee_count > 0 and coffee_count <= 100)`) in addition to the lower bound, since `perform_coffee_gift()` is the only insert path and a sane ceiling prevents a single row from claiming an absurd gift count.

### UPDATE — Blocked

Coffee gifts are **immutable**. No updates are permitted:

```sql
CREATE POLICY "Block updates on coffee gifts"
ON public.coffee_gifts
FOR UPDATE
TO authenticated
USING (false);
```

`USING (false)` means the policy never matches any row — effectively blocking all updates from authenticated users. There is no policy for the `anon` role on UPDATE, which also blocks it by default.

### DELETE — Blocked

Same as UPDATE:

```sql
CREATE POLICY "Block deletes on coffee gifts"
ON public.coffee_gifts
FOR DELETE
TO authenticated
USING (false);
```

---

## Policy Summary Table

| Operation | Authenticated | Anonymous (anon) |
|---|---|---|
| SELECT | ✅ All gifts | ✅ All gifts |
| INSERT | ❌ service-role only (`perform_coffee_gift()`) | ❌ service-role only |
| UPDATE | ❌ Always blocked | ❌ No policy (blocked by default) |
| DELETE | ❌ Always blocked | ❌ No policy (blocked by default) |

---

## SECURITY DEFINER Functions

All three RPCs are declared `SECURITY DEFINER`:

```sql
-- perform_coffee_gift
SECURITY DEFINER
SET search_path = ''

-- get_creator_coffee_gifts_stats
SECURITY DEFINER
SET search_path = ''

-- get_supporter_coffee_gifts_stats
SECURITY DEFINER
SET search_path = ''
```

### What SECURITY DEFINER means

When a `SECURITY DEFINER` function runs, it executes with the **permissions of the function owner** (typically the `postgres` superuser), not the permissions of the calling session. This lets the function bypass RLS on internal tables during its execution.

For `perform_coffee_gift` specifically, this is required because:

- It inserts into `coffee_gifts` using a trusted server-side path that bypasses the client-facing insert policy
- It delegates to `handle_successful_payment` which directly updates `wallets` and inserts into `transactions` — tables that clients cannot write to directly

### The service-role guard

`handle_successful_payment` contains an explicit additional guard:

```sql
if auth.role() <> 'service_role' then
  raise exception 'Not allowed!';
end if;
```

::: warning
**Security fix (SEC-16, 2026-06-24):** this previously checked `auth.uid() is not null`, which is a fragile proxy for "service role" — any context without a user JWT (e.g. `pg_cron`, a future internal caller) would also pass. It now checks `auth.role() = 'service_role'` directly, the same pattern already used in `kyc.sql`.
:::

### `SET search_path = ''`

All `SECURITY DEFINER` functions set an empty search path. This prevents **search path injection** attacks where an attacker creates a schema with the same name as a system function and tricks the SECURITY DEFINER function into calling it instead.

With `search_path = ''`, all table and function references inside the function must use their fully qualified name (e.g., `public.coffee_gifts`), making them unambiguous.

---

## Transactions Table RLS

The `transactions` table has its own RLS policy that's relevant to the coffee gifts service:

```sql
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (user_profile_id = (select auth.uid()));
```

This means:
- A creator can see their credit transaction from a gift
- A supporter can see their debit transaction
- Neither can see the other's transaction row (even though both rows have the same `reference_id`)

---

## Wallet RLS

Similarly, wallets are protected:

```sql
CREATE POLICY "Users can view their own wallet"
ON public.wallets
FOR SELECT
TO authenticated
USING (profile_id = (select auth.uid()));
```

Wallet balance updates are only possible via `SECURITY DEFINER` functions (the payment pipeline), not through direct client SQL.

---

## Security Checklist for New Developers

Before shipping any change to the coffee gifts service, verify:

- [ ] The RPC is called using the **service role** client (not the anon or user client)
- [ ] `p_identity_hash` is generated **server-side** — never trust a client-supplied hash
- [ ] `p_creator_profile_id` and `p_supporter_profile_id` are validated against your own business rules before calling the RPC (e.g., checking the creator has gifts enabled)
- [ ] No new RLS policy accidentally allows UPDATE or DELETE on `coffee_gifts`
- [ ] Any new function that touches wallets or transactions uses `SECURITY DEFINER` and `SET search_path = ''`
