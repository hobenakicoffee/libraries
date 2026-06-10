# Day 12 — RBAC and Custom JWT Claims

## Goal

By the end of today you fully understand the role-based access control (RBAC) system, how permissions flow from database → JWT → SQL policies → Edge Functions, and how to add or audit permissions.

---

## Resources

- [Supabase: Custom JWT claims](https://supabase.com/docs/guides/auth/custom-claims-and-role-based-access-control-rbac)
- [Supabase: Auth hooks](https://supabase.com/docs/guides/auth/auth-hooks)
- [Supabase: Custom access token hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)
- [OWASP: Broken Access Control](https://owasp.org/www-project-top-ten/2017/A5_2017-Broken_Access_Control) — why this matters for security
- `supabase/schemas/managers.sql` — the full implementation

---

## Two access control systems in this project

The project has two separate access systems:

| System | Who it's for | Mechanism |
|--------|-------------|-----------|
| **User RBAC** (`role` on profiles) | End users | `is_admin()` SQL function, `role` column |
| **Manager RBAC** (managers schema) | Internal staff | JWT claims + permission tables |

They do not overlap. A user with `role = 'admin'` on `profiles` is an end-user admin (can moderate content for users). Manager accounts are completely separate Supabase Auth users in the `managers` table.

---

## Manager roles and permissions

### The role hierarchy

```
super_admin
├── content_manager
├── support_manager
├── finance_manager
└── developer_manager
```

There's no inheritance in the code — each role has its own permission set in `manager_role_permissions`. The "hierarchy" is conceptual, not technical.

### The permission list

From `managers.sql`:

```
managers.*        -- create, view, update, delete manager accounts
content.*         -- moderate, approve, feature, delete content
users.*           -- view_details, suspend, reactivate, view_analytics
transactions.*    -- view, refund
payouts.*         -- approve, process
support.tickets.* -- view, respond, escalate, close
developers.*      -- create, view, update, delete
service_requests.*-- view, approve, reject, mark_implemented
```

### Seeding permissions for a role

The snippet in `supabase/snippets/Permission Insert for Managers.sql` shows how to bulk-assign permissions:

```sql
INSERT INTO public.manager_role_permissions (role, permission)
VALUES
  ('super_admin', 'managers.create'),
  ('super_admin', 'managers.view'),
  ('super_admin', 'content.moderate'),
  -- ... all permissions ...
  ('finance_manager', 'transactions.view'),
  ('finance_manager', 'payouts.approve'),
  ('finance_manager', 'payouts.process');
```

This data lives in the database. Adding a new permission to a role is just an INSERT — no code deployment needed.

---

## How permissions are checked: the full flow

Let's trace what happens when a `finance_manager` calls the `process_withdrawal` RPC:

**1. Login**

The manager logs into the admin panel. Supabase Auth calls `custom_access_token_hook`:

```sql
SELECT role INTO user_role
FROM public.manager_user_roles
WHERE user_id = (event ->> 'user_id')::UUID;
-- user_role = 'finance_manager'

claims := jsonb_set(claims, '{manager_role}', to_jsonb(user_role));
-- JWT now contains: { "manager_role": "finance_manager", ... }
```

**2. API call**

The manager's client sends a request with `Authorization: Bearer <jwt>`. The JWT contains `manager_role: finance_manager`.

**3. RPC call in the database**

The RPC (e.g., `process_withdrawal`) calls `authorize_manager('payouts.process')`:

```sql
CREATE OR REPLACE FUNCTION public.authorize_manager(requested_permission manager_permission)
RETURNS BOOLEAN AS $$
DECLARE
  bind_permissions INT;
  manager_role public.manager_role;
BEGIN
  -- read from JWT claim (no DB query)
  SELECT (auth.jwt() ->> 'manager_role')::public.manager_role INTO manager_role;
  -- manager_role = 'finance_manager'

  -- check permission table
  SELECT COUNT(*) INTO bind_permissions
  FROM public.manager_role_permissions
  WHERE permission = requested_permission  -- 'payouts.process'
    AND role = manager_role;               -- 'finance_manager'

  RETURN bind_permissions > 0;  -- true if finance_manager has payouts.process
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = '';
```

**4. Result**

If `authorize_manager` returns true, the RPC proceeds. If false, it returns `{ "success": false, "error": "UNAUTHORIZED" }`.

---

## Checking permissions in RLS policies vs functions

**In RLS policies:**

```sql
CREATE POLICY "Managers: authorized managers insert only"
ON public.managers FOR INSERT
TO authenticated
WITH CHECK (
  authorize_manager('managers.create')
);
```

**In PL/pgSQL functions:**

```sql
IF NOT (SELECT public.authorize_manager('users.suspend')) THEN
  RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
END IF;
```

The function approach gives you more control — you can return a descriptive error. The policy approach is simpler for table-level guards.

---

## Checking manager role in Edge Functions

From `_shared/types/index.ts`:

```typescript
export type JwtClaims = {
  sub: string;
  email: string;
  manager_role?: string;  // injected by custom_access_token_hook
};
```

In an Edge Function handler:

```typescript
withMiddleware(async (req, { claims }) => {
  if (claims?.manager_role !== 'finance_manager' && claims?.manager_role !== 'super_admin') {
    return unauthorizedError();
  }
  // proceed with finance operation...
}, { requireAuth: true })
```

---

## The `create_manager` function

Creating a manager requires the `managers.create` permission. Only a `super_admin` has this. The function:

1. Verifies the caller has `managers.create` via RLS policy
2. Creates a new row in `auth.users` directly (bypasses normal signup flow)
3. Creates a `managers` row
4. Assigns the role in `manager_user_roles`

```sql
CREATE OR REPLACE FUNCTION public.create_manager(
  manager_email TEXT,
  manager_full_name TEXT,
  manager_role manager_role,
  manager_department TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_user_id UUID;
  creator_id UUID;
BEGIN
  creator_id := auth.uid();
  new_user_id := extensions.uuid_generate_v4();

  INSERT INTO auth.users (id, email, email_confirmed_at)
  VALUES (new_user_id, manager_email, timezone('utc'::text, now()));

  INSERT INTO public.managers (id, full_name, email, department, created_by)
  VALUES (new_user_id, manager_full_name, manager_email, manager_department, creator_id);

  INSERT INTO public.manager_user_roles (user_id, role, assigned_by)
  VALUES (new_user_id, manager_role, creator_id);

  RETURN new_user_id;
END;
$$;
```

This function is `SECURITY DEFINER` so it can write to `auth.users` (normally inaccessible). It's revoked from all client-facing roles and can only be invoked via a seed script or direct service-role call.

---

## Security properties of this system

1. **Roles are in the JWT** — no per-request database lookup for the role. Fast and consistent within a session.
2. **Permissions are in the database** — you can add/remove permissions without redeploying code.
3. **Functions are revoked** — `create_manager` is not callable by regular users or `authenticated` role.
4. **`SET search_path = ''`** — all functions use explicit schemas, preventing schema injection attacks.
5. **No anon access** — the RLS audit removed all anon policies.

---

## Exercises

1. Open `supabase/seeds/7.managers.ts`. How are manager accounts seeded for local development? What roles are created? What permissions does each role have?

2. Open `supabase/snippets/Permission Insert for Managers.sql`. For each role, list the permissions assigned to it. Which role has the most permissions? Which has the fewest?

3. Open `supabase/tests/009_managers_test.sql`. Read the first 50 lines. What scenarios are being tested? Pick one test and explain in plain English what it's verifying.

4. Trace through the `authorize_manager` function. What happens if a regular user (not a manager) calls an RPC that uses `authorize_manager`? (Hint: what does `auth.jwt() ->> 'manager_role'` return for a non-manager?)

5. If you needed to add a new permission `'reports.resolve'` and assign it to `support_manager` and `super_admin`, what SQL would you write? (Just write the INSERT statements — no schema changes needed.)

6. The `manager_user_roles` table has a `UNIQUE (user_id)` constraint. What does this mean in practice? Can a manager have two roles simultaneously? If you needed multi-role support, how would you change the schema?
