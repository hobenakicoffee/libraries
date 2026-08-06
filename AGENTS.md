# AGENTS.md - Libraries

## Stack
Bun, TypeScript, Ultracite (Biome-based), `@hobenakicoffee/libraries`

## Commands
```bash
bun run test        # Run tests (bun test)
bun run typecheck   # tsc --noEmit
bun run format      # ultracite fix
bun run format:check # ultracite check
```

## Rules
- `@/*` maps to `./src/*`
- No `any` — use `unknown`
- Run `bun run format` before committing (enforced by lefthook pre-commit)
- Tests: `bun test`, `bun test <file>`, `bun test --grep "<pattern>"`
- Always write tests to verify
- Package exports: `.`, `./constants`, `./moderation`, `./types`, `./utils`, `./nuqs`, `./hooks`, `./scripts`
