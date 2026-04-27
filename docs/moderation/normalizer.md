# Normalizer Utilities

Utilities for normalizing text content.

## Usage

```ts
import { normalizeLeetspeak, normalizeUnicode } from "@hobenakicoffee/libraries/moderation";
```

## normalizeLeetspeak

Converts leetspeak to normal text (e.g., "h4x0r" → "haxor").

```ts
normalizeLeetspeak("h4x0r");    // => "haxor"
normalizeLeetspeak("p@ssw0rd"); // => "password"
normalizeLeetspeak("n1gg3r");  // => "nigger"
```

## normalizeUnicode

Normalizes Unicode characters (removes diacritics).

```ts
normalizeUnicode("café");  // => "cafe"
normalizeUnicode("naïve"); // => "naive"
normalizeUnicode("résumé"); // => "resume"
```

## banglaBadWords

Bengali profanity word list.

```ts
import { banglaBadWords } from "@hobenakicoffee/libraries/moderation";

console.log(banglaBadWords.length); // => word count
```

## Related

- [Moderation Overview](../moderation)