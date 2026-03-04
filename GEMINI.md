# GEMINI.md - @hobenakicoffee/libraries

## Project Overview

`@hobenakicoffee/libraries` is a framework-agnostic shared library of constants, utilities, TypeScript types, UI components, and moderation tools designed for the "হবে নাকি Coffee?" ecosystem. It provides a centralized repository of core logic and UI elements to ensure consistency across multiple projects.

### Main Technologies
- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Frontend Framework:** [React](https://react.dev/) (v19)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4) with `@tailwindcss/vite`
- **UI Components:** [Radix UI](https://www.radix-ui.com/) and [Shadcn UI](https://ui.shadcn.com/) patterns
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Linting & Formatting:** [Biome](https://biomejs.dev/) (via [Ultracite](https://github.com/shamscorner/ultracite))
- **Testing:** [Bun Test](https://bun.sh/docs/test/runner)
- **External APIs:** [OpenAI](https://openai.com/) (for moderation)

## Building and Running

### Development
```bash
bun run dev          # Start Vite dev server (port 3000)
```

### Build
```bash
bun run build        # Build the library (runs tsc and vite build)
```

### Testing
```bash
bun run test         # Run all tests using Bun's test runner
bun run test:watch   # Run tests in watch mode
```

### Linting and Formatting
```bash
bun run check        # Check for linting/formatting issues (Ultracite)
bun run fix          # Automatically fix linting/formatting issues (Ultracite)
bun run typecheck    # Run TypeScript type checking
bun run lint         # Alias for typecheck
```

### Other Commands
```bash
bun run clean        # Remove dist directory
bun run preview      # Preview the built application (index.html)
```

## Architecture and Project Structure

The project is structured as a multi-entry-point library, allowing users to import specific sub-packages (e.g., `@hobenakicoffee/libraries/utils`).

- `src/components/ui/`: 30+ accessible UI components built on Radix UI.
- `src/constants/`: Shared constants like `Visibility`, `PaymentStatuses`, `SupporterPlatforms`, and `productInfo`.
- `src/utils/`: General utility functions for formatting (amount, date, number), social sharing, and common logic.
- `src/moderation/`: Content moderation tools, including a large Bangla profanity dataset and OpenAI moderation integration.
- `src/types/`: TypeScript definitions, including full Supabase database types.
- `src/hooks/`: Reusable React hooks (e.g., `use-mobile`).
- `src/providers/`: Context providers (e.g., `theme-provider`).
- `src/lib/`: Internal library utilities (e.g., `cn()` for Tailwind class merging).

## Development Conventions

### General
- **Use Bun:** Always prefer `bun` over `npm`, `yarn`, or `pnpm` for running scripts and installing dependencies.
- **Multi-Entry Points:** When adding new top-level features, ensure they are correctly exposed in the `package.json` `"exports"` field.
- **Path Aliases:** Use the `@/` alias to refer to the `src/` directory (configured in `vite.config.ts` and `tsconfig.json`).

### UI Components
- **Tailwind CSS v4:** Use Tailwind CSS v4 features. Components use `class-variance-authority` (CVA) for variant management.
- **Accessibility:** Ensure components follow Radix UI accessibility standards.

### Testing
- **Colocated Tests:** Test files MUST be colocated with the source files they test (e.g., `src/utils/format-amount.ts` and `src/utils/format-amount.test.ts`).
- **Comprehensive Coverage:** Add tests for all new utility functions and logic-heavy components.

### Linting & Style
- **Ultracite/Biome:** Adhere to the formatting and linting rules defined in `biome.jsonc` (extending `ultracite`). Run `bun run fix` before committing.
- **Naming:** Follow existing naming conventions (e.g., kebab-case for filenames, PascalCase for components).
