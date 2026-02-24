# AGENTS.md - Code Standards & Guidelines

This document provides essential information for agents working in this repository.

## Project Overview

This is a TypeScript/JavaScript monorepo containing shared libraries for the Hobenakicoffee project. It uses Bun as the runtime and includes utilities, constants, types, and moderation features.

---

## Build, Lint & Test Commands

### Quick Reference

| Command | Description |
|---------|-------------|
| `bun run build` | Build the library (TypeScript + Vite) |
| `bun run test` | Run all tests |
| `bun run test:watch` | Run tests in watch mode |
| `bun test <file>` | Run a single test file |
| `bun test --grep "<pattern>"` | Run tests matching a pattern |
| `bun run lint` | Run typecheck (`tsc --noEmit`) |
| `bun run format` | Format code with Ultracite |
| `bun run format:check` | Check formatting without fixing |
| `bun run typecheck` | TypeScript type checking |
| `bun run clean` | Remove build artifacts |

### Running a Single Test

```bash
# Run specific test file
bun test src/utils/format-number.test.ts

# Run tests matching a name pattern
bun test --grep "formatNumber"
```

---

## Code Style Guidelines

This project uses **Ultracite** (Biome-based) for formatting and linting. Most issues are auto-fixable.

### Formatting & Imports

- Run `bun run format` before committing
- Use path aliases: `@/*` maps to `./src/*`
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use `verbatimModuleSyntax` - import with explicit extensions when needed

### Type Safety

- **Strict mode enabled** in tsconfig.json
- Use explicit types for function parameters and return values
- Prefer `unknown` over `any` when type is genuinely unknown
- Use `as const` for immutable values and literal types
- Leverage TypeScript type narrowing instead of assertions
- Enable `noUncheckedIndexedAccess` for array access safety

### Naming Conventions

- Use **PascalCase** for: Types, Interfaces, Classes, Components, Enums
- Use **camelCase** for: variables, functions, methods, props
- Use **SCREAMING_SNAKE_CASE** for: constants, enum values
- Use meaningful variable names - avoid magic numbers
- Prefix booleans with `is`, `has`, `should`, `can`

### Modern JavaScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Prefer template literals over string concatenation
- Use destructuring for object/array assignments
- Use `const` by default, `let` only for reassignment, never `var`

### Async & Error Handling

- Always `await` promises in async functions
- Use `async/await` over promise chains
- Handle errors with meaningful try-catch blocks
- Throw `Error` objects with descriptive messages, not strings
- Prefer early returns over nested conditionals

---

## React & JSX Guidelines

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays
- Use unique IDs for `key` prop, not array indices
- Nest children between tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes

---

## Testing Guidelines

- Tests use Bun's built-in test runner (`bun:test`)
- Use `describe`, `test`, and `expect` from `bun:test`
- Write assertions inside `it()` or `test()` blocks
- Use async/await for async tests
- Don't use `.only` or `.skip` in committed code

---

## Framework-Specific

**Next.js:** Use `<Image>` component, App Router metadata API, Server Components

**React 19+:** Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:** Use `class` and `for` attributes (not `className`/`htmlFor`)

---

## Security

- Add `rel="noopener"` when using `target="_blank"`
- Avoid `dangerouslySetInnerHTML` unless necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

---

## Performance

- Avoid spread syntax in loop accumulators
- Use top-level regex literals instead of creating in loops
- Use proper image components (Next.js `<Image>`)

---

## When Biome Can't Help

Focus on what automated tools cannot catch:

1. **Business logic correctness** - Validate algorithms manually
2. **Meaningful naming** - Use descriptive names
3. **Architecture decisions** - Component structure, data flow
4. **Edge cases** - Boundary conditions and error states
5. **User experience** - Accessibility, performance
6. **Documentation** - Add comments for complex logic
