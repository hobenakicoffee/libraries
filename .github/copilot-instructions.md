---
applyTo: "**/*.{ts,tsx,js,jsx}"
---

# Library code instructions

Read and follow [AGENTS.md](../AGENTS.md) before editing. It is canonical.

- Use Bun and Ultracite; do not use `any`.
- Add colocated tests for behavior changes and run the relevant verification commands.
- Keep public entry points synchronized across `package.json` and the README.
- Treat `src/types/supabase.ts` as generated raw contract data; do not hand-edit it.
