---
outline: deep
---

# Scripts

Build utilities and environment helpers.

## Usage

```ts
import { checkEnvEncryption } from "@hobenakicoffee/libraries/scripts";
```

## Exports

| Function | Description |
| `checkEnvEncryption` | Check if environment variables are encrypted |

## checkEnvEncryption

Checks if environment variables are encrypted.

```ts
import { checkEnvEncryption } from "@hobenakicoffee/libraries/scripts";

const result = checkEnvEncryption();
// Returns encryption status
```

This is used for verifying that sensitive environment variables are properly encrypted before deployment.