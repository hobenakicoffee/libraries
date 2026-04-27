---
outline: deep
---

# Moderation

The moderation module provides content moderation tools for English and Bengali.

## Usage

```ts
import { moderateText, normalizeLeetspeak, normalizeUnicode, banglaBadWords } from "@hobenakicoffee/libraries/moderation";
```

## Exports

| Function | Description |
| -------- | ----------- |
| `moderateText` | Check text for profanity |
| `normalizeLeetspeak` | Convert leetspeak to normal text |
| `normalizeUnicode` | Normalize Unicode characters |
| `banglaBadWords` | Bengali profanity word list |

## Related

- [Normalizer](./normalizer)