# Error Handling — Frontend Guide

## EdgeFunctionError

Custom error class located in `src/lib/parse-supabase-function-error.ts`:

```tsx
export class EdgeFunctionError extends Error {
  constructor(
    public code: string,
    public details: unknown,
    public displayMessage: string
  ) {
    super(displayMessage)
    this.name = 'EdgeFunctionError'
  }
}
```

## parseSupabaseFunctionError

Parses HTTP errors from Supabase Edge Function calls into structured `EdgeFunctionError` instances:

```tsx
export function parseSupabaseFunctionError(error: unknown): EdgeFunctionError {
  if (error instanceof FunctionsHttpError) {
    const { code, details, displayMessage } = JSON.parse(error.message)
    return new EdgeFunctionError(code, details, displayMessage)
  }

  // Fallback for unknown errors
  return new EdgeFunctionError(
    'UNKNOWN_ERROR',
    error,
    'An unexpected error occurred. Please try again.'
  )
}
```

## Error Shape

All Edge Functions return errors in a consistent shape:

```json
{
  "code": "SUBMISSION_ALREADY_ACTIVE",
  "details": {},
  "displayMessage": "You already have an active submission."
}
```

## Error Code Mapping

Known error codes used across features:

| Code | HTTP Status | Description |
|---|---|---|
| `SUBMISSION_ALREADY_ACTIVE` | 409 | Duplicate or conflicting submission |
| `INVALID_SESSION` | 400 | Session token is invalid |
| `SESSION_EXPIRED` | 400 | Session has expired |
| `INVALID_NID_FORMAT` | 400 | NID number format is invalid |
| `MISSING_FILES` | 400 | Required file uploads are missing |
| `UNAUTHORIZED` | 401 | Missing or invalid authorization |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `RATE_LIMITED` | 429 | Too many requests |

## Displaying Errors

Errors are shown to users via `sonner` toast:

```tsx
import { toast } from 'sonner'

try {
  await submitKyc(supabase, params)
  toast.success('KYC submitted successfully')
} catch (error) {
  const parsed = parseSupabaseFunctionError(error)
  toast.error(parsed.displayMessage)
}
```

## Best Practices

- Never expose raw Supabase errors or SQL errors to users
- Always map errors through typed error codes
- Use `parseSupabaseFunctionError` in `catch` blocks after Edge Function calls
- For non-Edge-Function Supabase errors, check `error.code` against known Postgres error codes
- Log the full error to the console/telemetry for debugging, but show only `displayMessage` to the user
