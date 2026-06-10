# Day 15 — Testing with pgTAP and the Migration Workflow

## Goal

By the end of today you understand the full development loop for schema changes: edit schema → diff → migrate → test. You can write a pgTAP test and run the full test suite.

---

## Resources

- [pgTAP documentation](https://pgtap.org/documentation.html)
- [Supabase: Testing your database](https://supabase.com/docs/guides/database/testing)
- [Supabase: Local development overview](https://supabase.com/docs/guides/cli/local-development)
- [basejump-supabase_test_helpers (GitHub)](https://github.com/usebasejump/supabase-test-helpers)
- `AGENTS.md` in the project root — the schema workflow rules

---

## The golden rule of this project

> **Never hand-write migration files.** Edit `supabase/schemas/*.sql` (the declarative source of truth), then generate a migration with `supabase db diff`.

> **Never run `supabase db reset/push/pull`.**

This is documented in `AGENTS.md`. The reasoning: schema files describe the desired end-state; migrations are the generated diffs to get there. If you hand-edit migrations, the schema files and the actual database can drift apart.

---

## The schema → migration → test workflow

### Step 1: Edit the schema file

Make your change in `supabase/schemas/<file>.sql`. For example, add a new column:

```sql
-- in supabase/schemas/profiles.sql
ALTER TABLE public.profiles ADD COLUMN tagline text;
```

Wait — actually, declarative schema files are usually written as the desired `CREATE TABLE` definition, not `ALTER`. You'd add the column directly into the `CREATE TABLE public.profiles (...)` block. The diff tool figures out the `ALTER TABLE` needed.

### Step 2: Generate the migration

```bash
supabase db diff --local -f add_tagline_to_profiles
```

This compares your local database's current state against the schema files, and writes a new migration file:

```
supabase/migrations/20260610120000_add_tagline_to_profiles.sql
```

containing:
```sql
alter table "public"."profiles" add column "tagline" text;
```

### Step 3: Verify the diff

**Always read the generated migration before applying it.** The diff tool sometimes generates unwanted `revoke`/`grant` statements, or misses something. Check:
- Does it only contain the change you intended?
- Are there unexpected `DROP` statements?
- Are RLS policies / grants preserved?

### Step 4: Apply the migration

```bash
supabase migration up
```

This applies any pending migrations to your local database.

### Step 5: Run the tests

```bash
supabase test db
```

This runs every `.sql` file in `supabase/tests/` using pgTAP. **Always run this after any schema change.**

### Step 6: Update docs

Per `AGENTS.md`'s Schema → Docs Sync Rule: any change to `supabase/schemas/` or `supabase/functions/` must be reflected in `libraries/docs/` in the same commit.

---

## What is pgTAP?

pgTAP is a unit-testing framework for PostgreSQL — it's SQL that tests SQL. Tests are written as `.sql` files in `supabase/tests/`, run with `pg_prove` (wrapped by `supabase test db`).

### Anatomy of a pgTAP test file

```sql
BEGIN;                    -- everything in a transaction — auto-rolled back
SELECT plan(38);          -- declare how many assertions you'll run

-- setup: create test users
SELECT tests.create_supabase_user('stats_user1@test.com');
SELECT tests.authenticate_as_service_role();

-- insert test data
INSERT INTO public.wallets (profile_id, balance, currency)
SELECT id, 5000.00, 'BDT' FROM public.profiles
WHERE id = tests.get_supabase_uid('stats_user1@test.com');

-- ... more setup and assertions ...

SELECT * FROM finish();   -- finalize, report pass/fail count
ROLLBACK;                 -- undo everything — tests don't pollute the DB
```

### Key test helper functions (from `basejump-supabase_test_helpers`)

| Function | What it does |
|----------|-------------|
| `tests.create_supabase_user('email')` | Creates a test user in `auth.users` (and triggers profile creation) |
| `tests.get_supabase_uid('email')` | Returns the UUID of a test user |
| `tests.authenticate_as('email')` | Switches the session to act as that user (for RLS testing) |
| `tests.authenticate_as_service_role()` | Switches to service role (bypasses RLS) |
| `tests.clear_authentication()` | Resets to anonymous |

### pgTAP assertion functions

| Function | Checks |
|----------|--------|
| `ok(boolean, description)` | The expression is true |
| `is(actual, expected, description)` | Two values are equal |
| `is_empty(sql, description)` | A query returns no rows |
| `results_eq(sql1, sql2, description)` | Two queries return the same result set |
| `throws_ok(sql, expected_error, description)` | A statement raises an error |
| `has_table('table_name')` | A table exists |
| `has_column('table_name', 'col')` | A column exists |
| `policies_are('table', array['policy1', 'policy2'])` | Exact set of policies on a table |

---

## Reading a real test: `004-transactions-tests.sql`

```sql
BEGIN;
SELECT plan(38);

-- Setup: users
SELECT tests.create_supabase_user('stats_user1@test.com');
SELECT tests.create_supabase_user('stats_user2@test.com');
SELECT tests.create_supabase_user('stats_anon@test.com');

SELECT tests.authenticate_as_service_role();

-- Wallets
INSERT INTO public.wallets (profile_id, balance, locked_balance, currency)
SELECT id, 5000.00, 0.00, 'BDT' FROM public.profiles
WHERE id = tests.get_supabase_uid('stats_user1@test.com');

-- Seed transactions covering different scenarios:
-- [A] credit / gift / one-time / completed → earned_one_time
INSERT INTO public.transactions (
  user_profile_id, service_type, reference_type, direction,
  amount, platform_fee, net_amount, balance_after, status, created_at
) VALUES (
  tests.get_supabase_uid('stats_user1@test.com'),
  'gift', 'one-time', 'credit',
  100.00, 10.00, 90.00, 1090,
  'completed', now() - interval '8 days'
);
-- ... more seed rows for other categories (subscriptions, debits, different statuses) ...

-- Then assertions, e.g.:
-- SELECT is(
--   (SELECT (public.get_transaction_stats(...) ->> 'earned_one_time')::numeric),
--   90.00,
--   'earned_one_time should equal sum of completed one-time gift credits'
-- );

SELECT * FROM finish();
ROLLBACK;
```

This test file builds a **deliberately varied dataset** — multiple users, multiple statuses, multiple time ranges — so the assertions can verify the stats RPC correctly filters and aggregates each category.

---

## RLS testing pattern

```sql
-- as user1, can they see their own wallet?
SELECT tests.authenticate_as('stats_user1@test.com');

SELECT is(
  (SELECT count(*)::int FROM public.wallets WHERE profile_id = tests.get_supabase_uid('stats_user1@test.com')),
  1,
  'user1 can see their own wallet'
);

-- as user2, can they see user1's wallet? (should be 0 due to RLS)
SELECT tests.authenticate_as('stats_user2@test.com');

SELECT is(
  (SELECT count(*)::int FROM public.wallets WHERE profile_id = tests.get_supabase_uid('stats_user1@test.com')),
  0,
  'user2 cannot see user1''s wallet'
);

SELECT tests.clear_authentication();
```

This is THE pattern for testing RLS — switch identity, run the same query, verify different results.

---

## Running tests

```bash
# run the entire suite
supabase test db

# run a single test file
supabase test db supabase/tests/004-transactions-tests.sql
```

Output shows `ok 1 - description`, `not ok 5 - description` for each assertion. All must be `ok` for the suite to pass.

---

## Numbering convention

Test files are numbered (`001_`, `002_`, ...) roughly in schema dependency order, but the number mostly just controls execution order for readability — pgTAP doesn't require a specific order since each file runs in its own transaction.

`000-setup-tests-hooks_test.sql` installs the pgTAP extension and the `basejump-supabase_test_helpers` package — this must run first (it's a one-time setup, not really a "test").

---

## Common pitfalls

1. **Forgetting `BEGIN`/`ROLLBACK`** — without these, your test data persists in the local DB and pollutes other tests.
2. **Wrong `plan(N)`** — if you add/remove assertions, update the count in `plan(N)` or the test framework reports a mismatch.
3. **Not calling `tests.clear_authentication()`** — leftover auth context can make subsequent assertions in the same file behave unexpectedly.
4. **Testing through `service_role`** when you meant to test RLS — `service_role` bypasses RLS entirely, so RLS bugs won't be caught.

---

## Exercises

1. Run `supabase test db` locally. Confirm all tests pass. How many test files are there? How long does the suite take?

2. Open `supabase/tests/003-wallets-tests.sql`. Find a test that checks the `balance_not_negative` constraint. What `throws_ok` or similar assertion does it use?

3. Pick any schema file you haven't deeply read yet (e.g., `reviews.sql`). Make a trivial, reversible change (e.g., add a `comment on column`). Run through the full workflow: `supabase db diff --local -f test_change` → review the migration → `supabase migration up` → `supabase test db`. Then decide whether to keep or discard your change.

4. Write a new pgTAP test that verifies: an authenticated user can SELECT their own profile, but cannot UPDATE another user's `role` column to `'admin'`. Use `tests.authenticate_as` and `throws_ok` or check the row is unchanged after a failed update.

5. Open `supabase/tests/001_verify_rls_enabled_on_all_schema_test.sql`. How does it enumerate "all schema tables"? What would happen if you added a new table without RLS — would this test catch it?

6. Read the "Schema → Docs Sync Rule" in `AGENTS.md`. Find the corresponding docs for `supabase/schemas/transactions.sql` in `libraries/docs/`. Are they up to date with the current schema? If you find a discrepancy, note it for your tech lead.

---

## Congratulations

You've completed the 15-day training program. You should now be able to:

- Read and write SQL confidently (SELECT, JOIN, aggregates, PL/pgSQL)
- Understand and audit RLS policies
- Read, write, and test Edge Functions
- Follow the schema → migration → test workflow for any change
- Navigate the project's RBAC, wallet, and feed systems

**Next steps:** pick up a small "good first issue" from the project's issue tracker, pair with a senior dev on your first PR, and keep this guide as a reference.
