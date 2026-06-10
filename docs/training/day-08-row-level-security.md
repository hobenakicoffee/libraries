# Day 8 — Row Level Security (RLS): The Heart of the Project

## Goal

By the end of today you understand Row Level Security completely, can read every RLS policy in the project, and understand why this project uses it as the primary data access control layer.

---

## Resources

- [Supabase: Row Level Security guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL RLS documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase: RLS policies](https://supabase.com/docs/guides/database/postgres/row-level-security#policies)
- [Supabase RLS performance guide](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)

---

## What is Row Level Security?

Without RLS, any user with access to the database can SELECT, INSERT, UPDATE, or DELETE any row in any table they have table-level permissions for.

**RLS adds a row-level filter.** When RLS is enabled on a table, every query automatically gets a WHERE clause appended that filters to only the rows the current user is allowed to see or modify.

This is enforced at the database level — it doesn't matter what the application code does. Even if there's a bug in the API, a user cannot access another user's data.

---

## Enabling RLS

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

Once enabled, **all access is denied by default** until you create policies. A table with RLS enabled and no policies: no one can read or write any rows (except the `service_role` which bypasses RLS).

---

## Creating policies

```sql
CREATE POLICY "policy name"
ON public.table_name
FOR [SELECT | INSERT | UPDATE | DELETE | ALL]
TO [role]        -- optional: authenticated, anon, service_role
USING (condition)         -- for SELECT, UPDATE, DELETE: filter existing rows
WITH CHECK (condition);   -- for INSERT, UPDATE: validate new rows
```

- `USING` — applied to rows being read/modified. Think of it as: "which existing rows can this user touch?"
- `WITH CHECK` — applied to the new row being written. Think of it as: "is this new/updated row valid for this user?"

---

## The three roles and what they can do

This project has a strict rule:
- **`anon`** — zero access to any table. Period. The RLS audit (`rls-anon-lockdown` migration) removed all anon access.
- **`authenticated`** — scoped access based on `auth.uid()`
- No explicit role = policy applies to all roles

---

## Pattern 1: Own-data access

The most common pattern: users can only see and modify their own rows.

```sql
-- users can only read their own wallet
CREATE POLICY "Users can view their own wallet"
ON public.wallets
FOR SELECT
TO authenticated
USING (profile_id = (SELECT auth.uid()));

-- users can only insert their own wallet
CREATE POLICY "Users can create their own wallet"
ON public.wallets
FOR INSERT
TO authenticated
WITH CHECK (profile_id = (SELECT auth.uid()));
```

Why `(SELECT auth.uid())` instead of just `auth.uid()`? The `SELECT` wrapper tells the query planner to evaluate it once and cache it — a performance optimization. Without it, `auth.uid()` could be called once per row.

---

## Pattern 2: Public read, own write

Some data is publicly readable (e.g., profiles for the explore page) but only the owner can write.

```sql
-- anyone (authenticated or not) can read profiles
CREATE POLICY "Anyone can view all profiles"
ON public.profiles
FOR SELECT
USING (true);

-- only you can create your own profile
CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  id = (SELECT auth.uid())
  AND role = 'user'   -- force user role — can't sign up as admin
);
```

`USING (true)` means "all rows match" — no filtering. Use this only for intentionally public data.

---

## Pattern 3: Admin override

Combine user-scoped access with an admin bypass:

```sql
CREATE POLICY "Users can update own profile, admins can update any"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = (SELECT auth.uid()) OR public.is_admin()
)
WITH CHECK (
  (
    id = (SELECT auth.uid())
    AND role = (SELECT role FROM public.profiles WHERE id = (SELECT auth.uid()))
  )
  OR public.is_admin()
);
```

Regular users can update their own profile but can't change their `role` (the `WITH CHECK` re-reads their current role and enforces it stays the same). Admins can update any profile, including changing roles.

---

## Pattern 4: Manager permission check

For manager-only operations, policies call `authorize_manager()`:

```sql
CREATE POLICY "Managers: authorized managers insert only"
ON public.managers
FOR INSERT
TO authenticated
WITH CHECK (
  authorize_manager('managers.create')
);
```

This checks the `manager_role` claim from the JWT, looks up permissions in `manager_role_permissions`, and returns true only if the manager has the `managers.create` permission.

---

## Pattern 5: Creator/supporter relationship

Some tables are readable by both the creator and the people who interact with them.

```sql
-- from supporters: both the supporter and the creator can see the record
CREATE POLICY "Users can view own supporter records"
ON public.supporters
FOR SELECT
TO authenticated
USING (
  profile_id = (SELECT auth.uid())   -- the supporter
  OR creator_id = (SELECT auth.uid()) -- the creator
);
```

---

## PERMISSIVE vs RESTRICTIVE policies

By default, policies are `AS PERMISSIVE` — if ANY policy allows access, access is granted.

`AS RESTRICTIVE` means ALL restrictive policies AND at least one permissive policy must pass. The project uses PERMISSIVE for normal access and RESTRICTIVE rarely (you can see an example in the managers section for the auth admin read policy).

---

## Why `(SELECT auth.uid())` matters for performance

```sql
-- SLOW: auth.uid() called once per row
USING (profile_id = auth.uid())

-- FAST: auth.uid() called once per query
USING (profile_id = (SELECT auth.uid()))
```

Always use the subquery form. This is a project-wide convention. You'll see it in every policy.

---

## Checking if RLS is enabled

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

The project has a test (`supabase/tests/001_verify_rls_enabled_on_all_schema_test.sql`) that asserts RLS is enabled on every public table.

---

## The `service_role` bypass

Edge Functions that use the service role key bypass RLS entirely:

```typescript
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,  // bypasses RLS
);
```

This is used in admin Edge Functions where the function itself enforces authorization (e.g., by checking `claims.manager_role`). The trade-off: you must be extra careful in these functions because PostgreSQL won't protect you — your code is the only guard.

---

## Debugging RLS

When a query returns fewer rows than expected or an insert fails silently, RLS is often the cause.

```sql
-- temporarily disable RLS for a table (ONLY in dev, never in prod)
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;

-- see all policies on a table
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- test as a specific role
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub":"user-uuid-here","role":"authenticated"}';
SELECT * FROM public.wallets;
RESET ROLE;
```

In pgTAP tests (Day 15), the test helpers `tests.authenticate_as('email')` and `tests.authenticate_as_service_role()` switch the session role to simulate different users.

---

## Exercises

1. Read [Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security) in full. It's not long. Take notes.

2. Open `supabase/schemas/wallets.sql`. Read every RLS policy. For each one, write down: who is allowed to do what, and under what condition.

3. Open `supabase/schemas/transactions.sql`. Are there any `anon` policies? Should there be? Explain your reasoning.

4. In your SQL client, run: `SELECT * FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, cmd;`. This shows all policies. How many are there on `profiles`? What do they cover?

5. Consider this scenario: a profile exists with `is_page_active = false`. A regular authenticated user runs `SELECT * FROM public.profiles WHERE id = 'that-uuid';`. What does the query return? Why?

6. Open `supabase/tests/001_verify_rls_enabled_on_all_schema_test.sql`. What is it testing? Run `supabase test db` and confirm this test passes.

7. Open `supabase/schemas/memberships.sql`. Find the SELECT policy. A user is subscribed to creator X. Can they see the subscription record? Can creator X see it? Can another random user see it? Trace through the policy to answer each question.
