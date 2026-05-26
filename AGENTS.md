# AGENTS.md - Libraries

## Stack
Bun, TypeScript, Ultracite (Biome-based) libraries project

## Commands
```bash
bun run build    # Build (tsc + vite)
bun run test     # Run tests
bun run format   # Fix with Ultracite
```

## Rules
- `@/*` for imports (maps to `./src/*`)
- No `any` - use `unknown` instead
- Use `cn()` from `@/lib/utils`
- Run `bun run format` before committing
- Tests: `bun test`, `bun test <file>`, `bun test --grep "<pattern>"`
- always write tests to verify
