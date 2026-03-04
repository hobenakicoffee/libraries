# AGENTS.md - Libraries

## Stack
Bun, TypeScript, Vite, React 19, Ultracite (Biome-based)

## Commands
```bash
bun run build    # Build (tsc + vite)
bun run test     # Run tests
bun run test:watch
bun run typecheck
bun run lint     # alias for typecheck
bun run format   # Fix with Ultracite
bun run format:check
bun run clean
```

## Rules
- `@/*` for imports (maps to `./src/*`)
- No `any` - use `unknown` instead
- Use `cn()` from `@/lib/utils`
- Run `bun run format` before committing
- Tests: `bun test`, `bun test <file>`, `bun test --grep "<pattern>"`
