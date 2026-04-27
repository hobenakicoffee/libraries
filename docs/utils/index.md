---
outline: deep
---

# Utilities

The utilities module provides helper functions for formatting, validation, and link generation.

## Usage

```ts
import { formatAmount, formatDate, getUserPageLink } from "@hobenakicoffee/libraries/utils";
```

## Exports

| Function | Description |
| `formatAmount` | Format number as Bangladeshi Taka (৳) |
| `formatCount` | Format count with K, M, B suffixes |
| `formatDate` | Format date string |
| `formatNumber` | Format number with separators |
| `formatToPlainText` | Convert value to plain text |
| `getUserPageLink` | Generate user profile URL |
| `getProductLink` | Generate product page URL |
| `getNewsletterPostLink` | Generate newsletter URL |
| `getInitials` | Get name initials |
| `getSocialLink` | Generate social profile URL |
| `getSocialHandle` | Extract handle from URL |
| `openInNewWindow` | Open URL safely |
| `shareToFacebook` | Share to Facebook |
| `shareToInstagram` | Share to Instagram |
| `shareToLinkedIn` | Share to LinkedIn |
| `shareToX` | Share to X (Twitter) |
| `downloadQrSvgAsPng` | Download QR as PNG |
| `toHumanReadable` | Convert camelCase/snake_case |
| `validatePhoneNumber` | Validate Bangladeshi phone |
| `checkModeration` | Check text for profanity |

## Related

- [Format](./format)
- [Validation](./validation)
- [Links](./links)
- [Sharing](./sharing)