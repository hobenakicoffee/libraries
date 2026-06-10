# Developer Training Program — HobenaKICoffee Backend

A 4-week, 21-day training path for developers joining the project. Every session is grounded in the actual codebase — no toy examples.

## Who this is for

Developers who are new to SQL, PostgreSQL, and Supabase. You do not need prior database experience. By the end you will be able to read, write, and maintain schema files, migrations, and edge functions in this project.

## How to use this

- One session per working day (each is ~2–4 hours of focused work)
- Read the session doc, follow all links, then do the hands-on exercises at the bottom of each doc
- Ask your tech lead to review your exercise output before moving on

---

## Schedule

### Week 1 — SQL Language Foundations

| Day | Topic | File |
|-----|-------|------|
| 1 | SQL basics — what it is, SELECT, data types | [day-01-sql-basics.md](day-01-sql-basics.md) |
| 2 | Writing data — INSERT, UPDATE, DELETE | [day-02-sql-crud.md](day-02-sql-crud.md) |
| 3 | Joining tables — relationships and foreign keys | [day-03-sql-joins.md](day-03-sql-joins.md) |
| 4 | Functions and aggregates — COUNT, SUM, GROUP BY | [day-04-sql-functions-aggregates.md](day-04-sql-functions-aggregates.md) |
| 5 | Constraints, indexes, and enums | [day-05-sql-constraints-indexes-enums.md](day-05-sql-constraints-indexes-enums.md) |

### Week 2 — PostgreSQL & Supabase Core

| Day | Topic | File |
|-----|-------|------|
| 6 | PL/pgSQL — stored functions and triggers | [day-06-plpgsql-triggers.md](day-06-plpgsql-triggers.md) |
| 7 | Supabase overview — Auth, client SDK, local dev | [day-07-supabase-auth.md](day-07-supabase-auth.md) |
| 8 | Row Level Security (RLS) — the heart of the project | [day-08-row-level-security.md](day-08-row-level-security.md) |
| 9 | Edge Functions — Deno + TypeScript serverless | [day-09-edge-functions.md](day-09-edge-functions.md) |
| 10 | Storage buckets + storage RLS | [day-10-storage.md](day-10-storage.md) |

### Week 3 — Project-Specific Patterns

| Day | Topic | File |
|-----|-------|------|
| 11 | Project schema walkthrough — profiles, common, managers | [day-11-schema-walkthrough.md](day-11-schema-walkthrough.md) |
| 12 | RBAC and custom JWT claims | [day-12-rbac-jwt.md](day-12-rbac-jwt.md) |
| 13 | Wallets, transactions, and withdrawal flow | [day-13-wallets-transactions.md](day-13-wallets-transactions.md) |
| 14 | Edge Functions deep-dive — real functions in this project | [day-14-edge-functions-deepdive.md](day-14-edge-functions-deepdive.md) |
| 15 | Testing with pgTAP + the migration workflow | [day-15-testing-migrations.md](day-15-testing-migrations.md) |

### Week 4 — Advanced SQL Patterns Used in This Project

| Day | Topic | File |
|-----|-------|------|
| 16 | CTEs, subqueries, and CASE expressions | [day-16-cte-subqueries-case.md](day-16-cte-subqueries-case.md) |
| 17 | Transactions, row locking & concurrency control | [day-17-transactions-locking.md](day-17-transactions-locking.md) |
| 18 | Error handling & custom exceptions in PL/pgSQL | [day-18-error-handling-plpgsql.md](day-18-error-handling-plpgsql.md) |
| 19 | Full-text search with tsvector/tsquery | [day-19-full-text-search.md](day-19-full-text-search.md) |
| 20 | Table partitioning & scaling patterns | [day-20-table-partitioning.md](day-20-table-partitioning.md) |
| 21 | Scheduled jobs (pg_cron), JSON aggregation, and privilege grants | [day-21-cron-aggregation-grants.md](day-21-cron-aggregation-grants.md) |

---

## Tools you need installed before Day 1

- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) — `brew install supabase/tap/supabase`
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — required for local Supabase
- [Bun](https://bun.sh/) — `curl -fsSL https://bun.sh/install | bash`
- A SQL client: [TablePlus](https://tableplus.com/) (free tier is fine) or [DBeaver](https://dbeaver.io/)
- [VS Code](https://code.visualstudio.com/) with the [PostgreSQL extension](https://marketplace.visualstudio.com/items?itemName=ckolkman.vscode-postgres)
- Deno: `curl -fsSL https://deno.land/install.sh | sh`

## Running the local environment

```bash
# start the full local supabase stack
supabase start

# run all pgTAP tests
supabase test db

# stop when done
supabase stop
```
