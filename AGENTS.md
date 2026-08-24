Bun 1.2.15, TypeScript, Ultracite (Biome-based), `@hobenakicoffee/libraries`

```bash
bun run test             # bun test
bun run typecheck        # tsc --noEmit
bun run format    			 # ultracite
bun run check:publish    # release gate: test, types, format, env
```

## Workflow
- Preserve unrelated worktree changes. Do not start a dev server or browser; leave live testing to the developer.
- Write or update colocated `*.test.ts` coverage for behavioral changes. Targeted runs: `bun test <file>` or `bun test --grep "<pattern>"`.
- After edits, run the relevant tests, `bun run typecheck`, and `bun run format:check`. Fix only touched files with `bun x ultracite fix <files>`; the pre-commit hook formats staged source files.
- `@/*` maps to `./src/*`. Never use `any`; use `unknown` and narrow it.

## Package boundary
- Keep `package.json` exports and README entry points synchronized: `.`, `./constants`, `./lib/utils`, `./moderation`, `./types`, `./types/supabase`, `./utils`, `./nuqs`, `./hooks`, `./scripts`.
- `src/types/supabase.ts` is the raw Supabase contract. Do not hand-edit it; regenerate it from the owning Supabase schema/workflow, then update the snapshot and its consumer types together.
