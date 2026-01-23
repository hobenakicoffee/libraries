# @hobenakicoffee/libraries

Framework-agnostic shared libraries for “হবে নাকি Coffee?” projects.

## Quick start

Install the package from npm:

```bash
npm install @hobenakicoffee/libraries
# or
pnpm add @hobenakicoffee/libraries
# or
yarn add @hobenakicoffee/libraries
# or
bun add @hobenakicoffee/libraries
```

Use it in your app:

```ts
import { SOME_CONSTANT } from "@hobenakicoffee/libraries";
```

## Local development

Install dependencies:

```bash
bun install
```

Common tasks:

```bash
# Run in watch mode during development
bun run dev

# Run type checking
bun run typecheck

# Run tests
bun run test

# Run tests in watch mode
bun run test:watch
```

Build artifacts:

```bash
# Build the library
bun run build

# Clean build artifacts
bun run clean
```

## Project structure

```
src/
  index.ts          # Main entry point
  constants/        # Shared constants
    index.ts
```

## Release & publish

Publishing is automated on push to the `main` branch via GitHub Actions. Ensure:

- `package.json` version is updated.
- `NPM_TOKEN` secret is set in the repo with publish permissions.

For local publish (if needed):

```bash
npm publish --access public
```

## Notes

- This project uses Bun for development and builds.
- To generate supabase types, follow https://supabase.com/docs/guides/api/rest/generating-types
