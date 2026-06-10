# Day 6 — PL/pgSQL: Stored Functions and Triggers

## Goal

By the end of today you can read, understand, and write PL/pgSQL stored functions and triggers — the building blocks of all the database-side logic in this project.

---

## Resources

- [PostgreSQL PL/pgSQL documentation](https://www.postgresql.org/docs/current/plpgsql.html)
- [PostgreSQL Functions tutorial](https://www.postgresqltutorial.com/postgresql-plpgsql/postgresql-create-function/)
- [PostgreSQL Triggers tutorial](https://www.postgresqltutorial.com/postgresql-triggers/introduction-postgresql-trigger/)
- [Supabase: Database Functions](https://supabase.com/docs/guides/database/functions)
- [Supabase: Database Triggers](https://supabase.com/docs/guides/database/postgres/triggers)

---

## What is PL/pgSQL?

PL/pgSQL is PostgreSQL's procedural language. Unlike plain SQL (which is declarative — you say what you want, not how to get it), PL/pgSQL lets you write step-by-step logic with variables, conditionals (`IF`), loops, and exception handling.

You use it when a task requires multiple SQL statements, branching logic, or returning computed results.

---

## Anatomy of a function

```sql
CREATE OR REPLACE FUNCTION public.function_name(
  param1 type,
  param2 type DEFAULT default_value
)
RETURNS return_type
LANGUAGE plpgsql
SECURITY DEFINER        -- runs as the function owner, not the caller
SET search_path = ''    -- security: explicit schema path
AS $$
DECLARE
  v_variable type;      -- local variables declared here
BEGIN
  -- your logic here
  RETURN result;
END;
$$;
```

### Key keywords

| Keyword | Meaning |
|---------|---------|
| `CREATE OR REPLACE` | Create or overwrite the function |
| `RETURNS` | The return type (`void`, `boolean`, `jsonb`, `uuid`, a table type, etc.) |
| `LANGUAGE plpgsql` | Use PL/pgSQL (vs `sql` for simpler functions) |
| `SECURITY DEFINER` | Run as the function owner (can bypass RLS) |
| `SECURITY INVOKER` | Run as the calling user (subject to RLS) |
| `SET search_path = ''` | **Required for SECURITY DEFINER** — forces explicit schema names, prevents hijacking |
| `DECLARE` | Block where local variables are declared |
| `BEGIN … END` | The function body |
| `$$` | Dollar-quoting — the function body delimiter |

### `SECURITY DEFINER` vs `SECURITY INVOKER`

- `SECURITY DEFINER` — the function runs as its owner (usually `postgres`). It can access tables even if the calling user's RLS policies would block them. Use this for RPCs that need to read/write data on behalf of the user in a controlled way.
- `SECURITY INVOKER` — the function runs as the calling user, subject to all their RLS policies. Used for helper functions that should respect access control.

**This project uses `SECURITY DEFINER` + `SET search_path = ''` for all functions that touch sensitive tables.** The `SET search_path = ''` is a security requirement — without it, a malicious schema could shadow `public.profiles` with its own `profiles` table.

---

## A simple SQL function

For simple cases (no variables, no branching), use `LANGUAGE sql`:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
    AND role = 'admin'
  );
$$;
```

This is from `supabase/schemas/profiles.sql`. `STABLE` means the function doesn't modify the database and returns the same result for the same input within a transaction — PostgreSQL can cache it.

---

## A PL/pgSQL function with variables and branching

From `supabase/schemas/profiles.sql` — the `moderate_user` function:

```sql
CREATE OR REPLACE FUNCTION public.moderate_user(
  p_user_id        uuid,
  p_is_page_active boolean DEFAULT NULL,
  p_allow_gifting  boolean DEFAULT NULL,
  p_allow_subs     boolean DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- check permission based on the operation
  IF p_is_page_active IS NOT NULL THEN
    IF p_is_page_active = false AND NOT (SELECT public.authorize_manager('users.suspend')) THEN
      RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
    END IF;
  END IF;

  -- do the update
  UPDATE public.profiles
  SET is_page_active      = COALESCE(p_is_page_active, is_page_active),
      allow_gifting       = COALESCE(p_allow_gifting, allow_gifting),
      allow_subscriptions = COALESCE(p_allow_subs, allow_subscriptions),
      updated_at          = now()
  WHERE id = p_user_id;

  -- check if the row was found
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;
```

Notice:
- Parameters are prefixed with `p_` to avoid naming collisions with columns
- `IF … THEN … END IF;` — conditional logic
- `IF NOT FOUND` — built-in check after INSERT/UPDATE/DELETE: did any rows match?
- `RETURN jsonb_build_object(...)` — return a JSON result to the caller

---

## DECLARE — local variables

```sql
CREATE OR REPLACE FUNCTION public.create_manager(...)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_user_id uuid;
  creator_id  uuid;
BEGIN
  creator_id := auth.uid();          -- := is assignment in PL/pgSQL
  new_user_id := extensions.uuid_generate_v4();

  -- use the variables
  INSERT INTO auth.users (id, email, ...) VALUES (new_user_id, ...);

  RETURN new_user_id;
END;
$$;
```

Use `SELECT ... INTO variable` to store a query result:

```sql
DECLARE
  v_balance numeric;
BEGIN
  SELECT balance INTO v_balance
  FROM public.wallets
  WHERE profile_id = p_user_id;

  IF v_balance < 100 THEN
    RETURN jsonb_build_object('error', 'Insufficient balance');
  END IF;
END;
```

---

## Triggers — running code automatically on table changes

A **trigger** fires automatically when a row is inserted, updated, or deleted. The function a trigger calls must return `trigger`.

### The `handle_updated_at` trigger (used on almost every table)

From `supabase/schemas/common.sql`:

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  new.updated_at = now();    -- NEW is the row being written
  RETURN new;
END;
$$;
```

This function is attached to tables:

```sql
-- from profiles.sql
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
```

Every time any column in `profiles` is updated, PostgreSQL calls `handle_updated_at()` first, which sets `updated_at = now()`. The application never has to set it manually.

### `NEW` and `OLD` in trigger functions

- `NEW` — the row as it will be after the operation (available on INSERT and UPDATE)
- `OLD` — the row as it was before the operation (available on UPDATE and DELETE)

### The `handle_new_user` trigger — auto-create a profile on signup

From `profiles.sql`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, page_slug, role, full_name, avatar_url)
  VALUES (
    new.id,
    new.id::text,
    new.id::text,
    'user',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();
```

When a new user signs up, Supabase inserts into `auth.users`. The trigger fires and automatically creates the corresponding `profiles` row — the application never has to call a separate "create profile" endpoint.

---

## REVOKE — locking down function access

Every function is accessible to `public` (all roles) by default. This project explicitly revokes unnecessary access:

```sql
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.moderate_user(...) FROM public, anon, authenticated;
```

`moderate_user` is revoked from `authenticated` too because it's called only by managers via `SECURITY DEFINER` — regular users can never call it directly.

---

## Calling functions from the client (RPCs)

The Supabase client can call any function exposed to `authenticated`:

```typescript
// TypeScript client
const { data, error } = await supabase.rpc('moderate_user', {
  p_user_id: userId,
  p_is_page_active: false,
});
```

This is the RPC (Remote Procedure Call) pattern used throughout the project. The client calls a function name, passes parameters, and gets back a JSON result.

---

## Exercises

1. Read `supabase/schemas/common.sql` fully. Write down: what does `handle_updated_at` do, and which `LANGUAGE` does it use?

2. Open `supabase/schemas/managers.sql`. Read the `authorize_manager` function (around line 128). Explain in plain English: what does this function do, and what does it return?

3. Open `supabase/schemas/managers.sql`. Read `custom_access_token_hook`. This function is called by Supabase Auth every time a JWT is issued. What does it add to the JWT claims? Why does this matter for authorization?

4. Write a simple PL/pgSQL function that accepts a `profile_id uuid` parameter and returns a `jsonb` with `{ "follower_count": N, "following_count": N }` for that profile. Test it in your SQL client.

5. Look at all the `CREATE TRIGGER` statements in `profiles.sql`. For each trigger, identify: the trigger timing (`BEFORE`/`AFTER`), the event (`INSERT`/`UPDATE`/`DELETE`), and which function it calls.

6. Find all the `REVOKE` statements in `profiles.sql`. For each one, explain why that revocation makes the system more secure.
