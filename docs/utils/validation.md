# Validation Utilities

Functions for validating phone numbers and checking content moderation.

## Usage

```ts
import { validatePhoneNumber, checkModeration } from "@hobenakicoffee/libraries/utils";
```

## validatePhoneNumber

Validates Bangladeshi mobile phone numbers.

```ts
validatePhoneNumber("01712345678");   // => true
validatePhoneNumber("+8801712345678"); // => true
validatePhoneNumber("8801712345678");  // => true
validatePhoneNumber("01512345678"); // => false (invalid prefix)
validatePhoneNumber("1234567890");  // => false
```

Supported prefixes:

| Prefix | Operator |
| `013` | Banglalion |
| `014` | Banglalion |
| `015` | Teletalk |
| `016` | Airtel |
| `017` | Grameenphone |
| `018` | Robi |
| `019` | Banglalink |

## checkModeration

Checks text for profanity using local word lists and OpenAI moderation API.

```ts
import { checkModeration } from "@hobenakicoffee/libraries/utils";
import OpenAI from "openai";

const openai = new OpenAI();

const result = await checkModeration(openai, "some text to check");

result.flagged;      // boolean - true if content is flagged
result.categories; // OpenAI categories if flagged
result.source;     // "profanity" | "openai" | null
result.profaneWords; // Array of matched words
result.error;       // Error if any
```

## Related

- [Utils Index](../utils/index)
- [Moderation](../moderation/index)