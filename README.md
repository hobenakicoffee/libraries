# @hobenakicoffee/libraries

Necessary public libraries for "হবে নাকি Coffee?" projects.

A framework-agnostic Bun library providing shared utilities and constants.

## Installation

```bash
bun install
```

## Development

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

## Building

```bash
# Build the library
bun run build

# Clean build artifacts
bun run clean
```

## Publishing

The library will automatically build before publishing:

```bash
npm publish
```

## Project Structure

```
src/
  index.ts          # Main entry point
  constants/        # Shared constants
    index.ts
```

This project was created using `bun init` in bun v1.2.15. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Resources

To generate supabase types, [follow this documentation](https://supabase.com/docs/guides/api/rest/generating-types)
