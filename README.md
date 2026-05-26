# @hobenakicoffee/libraries

Framework-agnostic shared constants, utilities, types, and moderation tools for "হবে নাকি Coffee?" projects.
**Version: 4.1.1**

![GitHub Stars](https://www.shieldcn.dev/github/stars/hobenakicoffee/libraries.svg?variant=secondary&size=sm)
![GitHub Forks](https://www.shieldcn.dev/github/forks/hobenakicoffee/libraries.svg?variant=secondary&size=sm)
![Watchers](https://www.shieldcn.dev/github/watchers/hobenakicoffee/libraries.svg?variant=secondary&size=sm)
![Branches](https://www.shieldcn.dev/github/branches/hobenakicoffee/libraries.svg?variant=ghost&size=sm)
![Contributors](https://www.shieldcn.dev/github/contributors/hobenakicoffee/libraries.svg?theme=emerald&size=sm)
![Last commit](https://www.shieldcn.dev/github/last-commit/hobenakicoffee/libraries.svg?variant=secondary&size=sm)
![Commits](https://www.shieldcn.dev/github/commits/hobenakicoffee/libraries.svg?variant=secondary&size=sm)
![Open issues](https://www.shieldcn.dev/github/open-issues/hobenakicoffee/libraries.svg?variant=secondary&size=sm)
![Closed issues](https://www.shieldcn.dev/github/closed-issues/hobenakicoffee/libraries.svg?variant=ghost&size=sm)
![Open PRs](https://www.shieldcn.dev/github/open-prs/hobenakicoffee/libraries.svg?variant=secondary&size=sm)
![Closed PRs](https://www.shieldcn.dev/github/closed-prs/hobenakicoffee/libraries.svg?variant=ghost&size=sm)
![Merged PRs](https://www.shieldcn.dev/github/merged-prs/hobenakicoffee/libraries.svg?variant=ghost&size=sm)
![Release](https://www.shieldcn.dev/github/release/hobenakicoffee/libraries.svg?size=sm)
![CI](https://www.shieldcn.dev/github/ci/hobenakicoffee/libraries.svg?variant=secondary&size=sm)
![License](https://www.shieldcn.dev/github/license/hobenakicoffee/libraries.svg?variant=ghost&size=sm)
![npm Version](https://www.shieldcn.dev/npm/@hobenakicoffee/libraries.svg?variant=secondary&size=sm)
![npm Weekly Downloads](https://www.shieldcn.dev/npm/dw/@hobenakicoffee/libraries.svg?size=sm)
![npm Monthly Downloads](https://www.shieldcn.dev/npm/dm/@hobenakicoffee/libraries.svg?variant=ghost&size=sm)
![npm Total Downloads](https://www.shieldcn.dev/npm/dt/@hobenakicoffee/libraries.svg?variant=secondary&size=sm)
![npm Dependents](https://www.shieldcn.dev/npm/dependents/@hobenakicoffee/libraries.svg?variant=secondary&size=sm)
![npm Types](https://www.shieldcn.dev/npm/types/@hobenakicoffee/libraries.svg?theme=blue&size=sm)
![npm Node](https://www.shieldcn.dev/npm/node/@hobenakicoffee/libraries.svg?variant=secondary&size=sm)
![npm License](https://www.shieldcn.dev/npm/license/@hobenakicoffee/libraries.svg?variant=ghost&size=sm)
![Package mgr · Bun](https://www.shieldcn.dev/badge/Package_mgr-Bun-000000.svg?logo=bun&variant=branded&size=sm)
![Language · TypeScript](https://www.shieldcn.dev/badge/Language-TypeScript-3178C6.svg?logo=typescript&variant=branded&size=sm)
![Bundler · Vite](https://www.shieldcn.dev/badge/Bundler-Vite-646CFF.svg?logo=vite&variant=branded&size=sm)
![OpenAI](https://www.shieldcn.dev/badge/Stack-OpenAI-412991.svg?logo=openai&variant=branded&size=sm)
![React](https://www.shieldcn.dev/badge/Stack-React-61DAFB.svg?logo=react&variant=branded&size=sm)
![Tailwind CSS](https://www.shieldcn.dev/badge/Stack-Tailwind_CSS-06B6D4.svg?logo=tailwindcss&variant=branded&size=sm)
![Zod](https://www.shieldcn.dev/badge/Stack-Zod-3E67B1.svg?logo=zod&variant=branded&size=sm)
![Biome](https://www.shieldcn.dev/badge/Stack-Biome-60A5FA.svg?logo=biome&variant=branded&size=sm)
![VitePress](https://www.shieldcn.dev/badge/Stack-VitePress-5E72E4.svg?logo=vitepress&variant=branded&size=sm)
![ESM only](https://www.shieldcn.dev/badge/ESM-only-16a34a.svg?variant=secondary&size=sm)
![Agent-friendly AGENTS.md](https://www.shieldcn.dev/badge/Agent--friendly-AGENTS.md-D97757.svg?variant=secondary&size=sm)

## Installation

```bash
npm install @hobenakicoffee/libraries
# or
pnpm add @hobenakicoffee/libraries
# or
yarn add @hobenakicoffee/libraries
# or
bun add @hobenakicoffee/libraries
```

## Usage

This package exposes multiple entry points. You can import from the main entry or specific submodules.

```ts
// Main entry - constants
import { PaymentStatuses, ServiceTypes, Visibility } from "@hobenakicoffee/libraries";

// Constants only
import { SupporterPlatforms } from "@hobenakicoffee/libraries/constants";

// Utilities only
import { formatAmount, formatDate, getUserPageLink } from "@hobenakicoffee/libraries/utils";

// Types only
import type { Database, Tables } from "@hobenakicoffee/libraries/types";

// Moderation tools
import { containsProfanity, containsBanglaSwear } from "@hobenakicoffee/libraries/moderation";

// URL state management
import { parseAsSortOrder } from "@hobenakicoffee/libraries/nuqs";

// Scripts
import { checkEnvEncryption } from "@hobenakicoffee/libraries/scripts";

// Hooks
import { useIsMobile } from "@hobenakicoffee/libraries/hooks";
```

## Entry Points Overview

| Entrypoint | Description |
| ---------- | ----------- |
| `@hobenakicoffee/libraries` | Main entry - re-exports constants |
| `@hobenakicoffee/libraries/constants` | All constants |
| `@hobenakicoffee/libraries/utils` | Utility functions |
| `@hobenakicoffee/libraries/types` | TypeScript types (custom + Supabase) |
| `@hobenakicoffee/libraries/moderation` | Content moderation tools |
| `@hobenakicoffee/libraries/nuqs` | URL state management parsers |
| `@hobenakicoffee/libraries/scripts` | Build/utility scripts |
| `@hobenakicoffee/libraries/hooks` | React hooks |

---

## Constants (`@hobenakicoffee/libraries/constants`)

### Visibility

```ts
import { Visibility } from "@hobenakicoffee/libraries";

Visibility.PUBLIC  // "public"
Visibility.PRIVATE // "private"
```

### productInfo

Product metadata for "হবে নাকি Coffee?":

```ts
import { productInfo } from "@hobenakicoffee/libraries";

productInfo.name        // "হবে নাকি Coffee?"
productInfo.domain      // "https://www.hobenakicoffee.com"
productInfo.twitterHandle // "@hobenakicoffee"
productInfo.title       // Platform tagline
productInfo.description // Full description
productInfo.keywords    // SEO keywords
productInfo.socials     // Social media links object
```

### companyInfo

Company contact and legal information:

```ts
import { companyInfo } from "@hobenakicoffee/libraries";

companyInfo.name           // "Shamscorner LLC"
companyInfo.contactEmail   // "mail@shamscorner.com"
companyInfo.contactPhone   // "+1(817) 973-7285"
companyInfo.contactLocation // Full address
companyInfo.domain         // "https://www.shamscorner.com"
companyInfo.postalAddress  // Postal address object
```

### Payment Constants

```ts
import { PaymentTypes, PaymentStatuses, PaymentProviders, PaymentDirections, PayoutProviders, WithdrawalStatuses } from "@hobenakicoffee/libraries";

// Payment Types
PaymentTypes.SUBSCRIPTION       // "subscription"
PaymentTypes.ONE_TIME           // "one-time"
PaymentTypes.PAYOUT             // "payout"
PaymentTypes.WITHDRAW_LOCK      // "withdraw_lock"
PaymentTypes.WITHDRAW_RELEASE   // "withdraw_release"
PaymentTypes.WITHDRAW_COMPLETE // "withdraw_complete"
PaymentTypes.MANUAL_ADJUSTMENT  // "manual_adjustment"

// Payment Statuses
PaymentStatuses.PENDING      // "pending"
PaymentStatuses.PROCESSING  // "processing"
PaymentStatuses.COMPLETED   // "completed"
PaymentStatuses.FAILED      // "failed"
PaymentStatuses.REVERSED    // "reversed"
PaymentStatuses.CANCELLED   // "cancelled"
PaymentStatuses.REFUNDED     // "refunded"
PaymentStatuses.REVIEWING    // "reviewing"

// Payment Providers
PaymentProviders.HOBENAKICOFFEE // "HobeNakiCoffee"
PaymentProviders.BKASH         // "Bkash"
PaymentProviders.NAGAD         // "Nagad"
PaymentProviders.ROCKET        // "Rocket"
PaymentProviders.UPAY          // "Upay"
PaymentProviders.SSLCOMMERZ    // "SSLCommerz"
PaymentProviders.AAMARPAY      // "Aamarpay"
PaymentProviders.PORTWALLET    // "Portwallet"
PaymentProviders.TAP           // "Tap"
PaymentProviders.OTHER         // "Other"

// Payment Directions
PaymentDirections.DEBIT  // "debit"
PaymentDirections.CREDIT // "credit"

// Payout Providers
PayoutProviders.BKASH   // "bkash"
PayoutProviders.NAGAD   // "nagad"
PayoutProviders.ROCKET // "rocket"
PayoutProviders.BANK   // "bank"

// Withdrawal Statuses
WithdrawalStatuses.REQUESTED  // "requested"
WithdrawalStatuses.APPROVED   // "approved"
WithdrawalStatuses.PROCESSING // "processing"
WithdrawalStatuses.PAID       // "paid"
WithdrawalStatuses.REJECTED   // "rejected"
WithdrawalStatuses.FAILED     // "failed"
```

### Supporter Platforms

```ts
import { SupporterPlatforms } from "@hobenakicoffee/libraries";

SupporterPlatforms.FACEBOOK   // "facebook"
SupporterPlatforms.X          // "x"
SupporterPlatforms.INSTAGRAM  // "instagram"
SupporterPlatforms.YOUTUBE   // "youtube"
SupporterPlatforms.GITHUB     // "github"
SupporterPlatforms.LINKEDIN  // "linkedin"
SupporterPlatforms.TWITCH     // "twitch"
SupporterPlatforms.TIKTOK     // "tiktok"
SupporterPlatforms.THREADS    // "threads"
SupporterPlatforms.WHATSAPP   // "whatsapp"
SupporterPlatforms.TELEGRAM   // "telegram"
SupporterPlatforms.DISCORD    // "discord"
SupporterPlatforms.REDDIT     // "reddit"
SupporterPlatforms.PINTEREST  // "pinterest"
SupporterPlatformS.MEDIUM     // "medium"
SupporterPlatformS.DEVTO      // "devto"
SupporterPlatformS.BEHANCE    // "behance"
SupporterPlatformS.DRIBBBLE   // "dribbble"
```

### Service Types

```ts
import { ServiceTypes } from "@hobenakicoffee/libraries";

ServiceTypes.GIFT              // "gift"
ServiceTypes.EXCLUSIVE_CONTENT // "exclusive_content"
ServiceTypes.WITHDRAWAL        // "withdrawal"
ServiceTypes.FOLLOW            // "follow"
```

---

## Utilities (`@hobenakicoffee/libraries/utils`)

### formatAmount

Formats a number as Bangladeshi Taka (৳).

```ts
import { formatAmount, formatSignedAmount } from "@hobenakicoffee/libraries/utils";

formatAmount(1000);    // "৳1,000"
formatAmount(-500);    // "৳500" (absolute value)

// With direction sign
formatSignedAmount(1000, "credit");  // "+ ৳1,000"
formatSignedAmount(500, "debit");   // "- ৳500"
```

### formatCount

Formats a count with appropriate suffixes (K, M, B).

```ts
import { formatCount } from "@hobenakicoffee/libraries/utils";

formatCount(500);    // "500"
formatCount(1000);   // "1K"
formatCount(1500000); // "1.5M"
```

### formatDate

Formats a date string to a readable format.

```ts
import { formatDate } from "@hobenakicoffee/libraries/utils";

formatDate("2024-01-15T00:00:00Z"); // "Jan 15, 2024"
formatDate("invalid");                // "-"
```

### formatNumber

Formats a number with thousand separators.

```ts
import { formatNumber } from "@hobenakicoffee/libraries/utils";

formatNumber(1000000); // "1,000,000"
```

### formatToPlainText

Converts various data types to plain text.

```ts
import { formatToPlainText, formatMetadataKey } from "@hobenakicoffee/libraries/utils";

// Basic usage
formatToPlainText("hello");           // "hello"
formatToPlainText(123);              // "123"
formatToPlainText(true);             // "Yes"
formatToPlainText(false);            // "No"

// With options
formatToPlainText("some long text...", { maxStringLength: 10 });
// "some lo..."

formatToPlainText({ key: "value" });
// JSON stringified

formatMetadataKey("supporterName");  // "Supporter Name"
formatMetadataKey("is_monthly");     // "Is monthly"
```

### getUserPageLink

Generates a user profile page URL.

```ts
import { getUserPageLink } from "@hobenakicoffee/libraries/utils";

getUserPageLink("johndoe");
// "https://hobenakicoffee.com/@johndoe"

getUserPageLink("johndoe", "https://custom.com");
// "https://custom.com/@johndoe"
```

### getProductLink

Generates a product page URL.

```ts
import { getProductLink } from "@hobenakicoffee/libraries/utils";

getProductLink("johndoe", "my-product");
// "https://hobenakicoffee.com/@johndoe/shop/products/my-product"

getProductLink("johndoe", "my-product", "https://custom.com");
// "https://custom.com/@johndoe/shop/products/my-product"
```

### getNewsletterPostLink

Generates a newsletter post URL.

```ts
import { getNewsletterPostLink } from "@hobenakicoffee/libraries/utils";

getNewsletterPostLink("johndoe", "my-post");
// "/@johndoe/posts/my-post"

getNewsletterPostLink("johndoe", "my-post", "https://hobenakicoffee.com");
// "https://hobenakicoffee.com/@johndoe/posts/my-post"
```

### getUserNameInitials

Extracts initials from a name.

```ts
import { getInitials } from "@hobenakicoffee/libraries/utils";

getInitials("John Doe");      // "JD"
getInitials("John");          // "J"
getInitials("John Michael");  // "JM"
getInitials(null);            // "?"
```

### getSocialLink

Generates social media profile URLs.

```ts
import { getSocialLink, SupporterPlatforms } from "@hobenakicoffee/libraries";

getSocialLink("johndoe", SupporterPlatforms.FACEBOOK);
// "https://facebook.com/johndoe"

getSocialLink("johndoe", SupporterPlatforms.INSTAGRAM);
// "https://instagram.com/johndoe"

getSocialLink("johndoe", SupporterPlatforms.GITHUB);
// "https://github.com/johndoe"
```

### getSocialHandle

Extracts the handle/username from a social media URL.

```ts
import { getSocialHandle } from "@hobenakicoffee/libraries/utils";

getSocialHandle("https://twitter.com/johndoe"); // "johndoe"
getSocialHandle("@johndoe");                     // "johndoe"
getSocialHandle("johndoe");                     // "johndoe"
```

### openInNewWindow

Opens a URL in a new tab safely.

```ts
import { openInNewWindow } from "@hobenakicoffee/libraries/utils";

openInNewWindow("https://example.com");
// Opens in new tab with rel="noopener noreferrer"
```

### Social Sharing Functions

```ts
import { shareToFacebook, shareToInstagram, shareToLinkedIn, shareToX } from "@hobenakicoffee/libraries/utils";

// Facebook
shareToFacebook({
  url: "https://example.com",
  quote: "Check this out!",
  hashtag: "coffee",
  ref: "campaign123"
});

// Instagram (uses Web Share API or copies to clipboard)
shareToInstagram({
  url: "https://example.com",
  text: "Check this out!"
});

// LinkedIn
shareToLinkedIn({
  url: "https://example.com",
  title: "My Title",
  summary: "Description here",
  source: "HobeNakiCoffee"
});

// X (Twitter)
shareToX({
  text: "Hello from HobeNakiCoffee!",
  url: "https://example.com",
  hashtags: "coffee,support",
  via: "hobenakicoffee"
});
```

### QR Code Utilities

```ts
import { downloadQrSvgAsPng, printQrSvg } from "@hobenakicoffee/libraries/utils";

// Download QR as PNG
await downloadQrSvgAsPng(
  '<svg>...</svg>',
  "qr-code.png",
  () => console.log("Success"),
  () => console.log("Error")
);

// Print QR
printQrSvg(
  '<svg>...</svg>',
  "QR Code Print",
  () => console.log("Error")
);
```

### toHumanReadable

Converts camelCase or snake_case strings to human-readable format.

```ts
import { toHumanReadable } from "@hobenakicoffee/libraries/utils";

toHumanReadable("camelCase");       // "Camel Case"
toHumanReadable("snake_case");      // "Snake Case"
toHumanReadable("CONSTANT_VALUE");  // "CONSTANT VALUE"
toHumanReadable("HTTPResponseCode"); // "HTTP Response Code"
```

### validatePhoneNumber

Validates Bangladeshi mobile phone numbers.

```ts
import { validatePhoneNumber } from "@hobenakicoffee/libraries/utils";

validatePhoneNumber("01712345678");  // true
validatePhoneNumber("+8801712345678"); // true
validatePhoneNumber("8801712345678");  // true
validatePhoneNumber("01512345678");   // false (invalid prefix)
validatePhoneNumber("1234567890");    // false
```

### checkModeration

Checks text for profanity using both local Bangla word lists and OpenAI moderation API.

```ts
import { checkModeration } from "@hobenakicoffee/libraries/utils";
import OpenAI from "openai";

const openai = new OpenAI();

const result = await checkModeration(openai, "some text to check");

result.flagged      // boolean - true if content is flagged
result.categories   // OpenAI categories if flagged
result.source      // "profanity" | "openai" | null
result.profaneWords // Array of matched profanity words (if from profanity check)
result.error        // Error if any
```

---

## Moderation (`@hobenakicoffee/libraries/moderation`)

### containsProfanity / containsBanglaSwear

Local profanity detection for English and Bangla.

```ts
import { containsProfanity, containsBanglaSwear, badwordsMatcher } from "@hobenakicoffee/libraries/moderation";

const hasProfanity = containsProfanity("some bad word here");
const hasBanglaProfanity = containsBanglaSwear("কিছু খারাপ শব্দ");
```

---

## Types (`@hobenakicoffee/libraries/types`)

Full Supabase database types with Row, Insert, and Update types for each table.

```ts
import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from "@hobenakicoffee/libraries/types";

// Database type
type DB = Database;

// Table row types
type Profile = Tables<"profiles">;
type Transaction = Tables<"transactions">;
type Supporter = Tables<"supporters">;

// Insert types
type NewProfile = TablesInsert<"profiles">;
type NewTransaction = TablesInsert<"transactions">;

// Update types
type ProfileUpdate = TablesUpdate<"profiles">;

// Enum types
type PaymentStatus = Enums<"payment_status_enum">;
type SupporterPlatform = Enums<"supporter_platform_enum">;
```

### Custom Types

The library also exports custom types for common data structures:

```ts
import type { TransactionMetadata, ActivityMetadata, SupportersMetadata } from "@hobenakicoffee/libraries/types";
```

---

## Nuqs (`@hobenakicoffee/libraries/nuqs`)

URL state management parsers using nuqs and zod.

```ts
import { parseAsSortOrder, parseAsDateRange, parseAsLastTimeRange } from "@hobenakicoffee/libraries/nuqs";

// Sort order
parseAsSortOrder.parse("asc"); // "asc"
parseAsSortOrder.parse("invalid"); // throws

// Date range
parseAsDateRange.parse({ from: new Date(), to: new Date() });

// Last time range
parseAsLastTimeRange.parse("last_7_days");
parseAsLastTimeRange.parse("last_30_days");
parseAsLastTimeRange.parse("last_90_days");
parseAsLastTimeRange.parse("last_180_days");
parseAsLastTimeRange.parse("last_year");
```

---

## Hooks

### useIsMobile

React hook to detect if the viewport is mobile-sized.

```ts
import { useIsMobile } from "@hobenakicoffee/libraries/hooks";

function MyComponent() {
  const isMobile = useIsMobile();
  
  return <div>{isMobile ? "Mobile" : "Desktop"}</div>;
}
```

---

## API Reference

### Constants

| Export | Type | Description |
|--------|------|-------------|
| `Visibility` | `object` | PUBLIC, PRIVATE constants |
| `Visibility` | `type` | Type for visibility values |
| `productInfo` | `object` | Product metadata |
| `companyInfo` | `object` | Company information |
| `PaymentTypes` | `object` | Payment type constants |
| `PaymentType` | `type` | Type for payment types |
| `PaymentStatuses` | `object` | Payment status constants |
| `PaymentStatus` | `type` | Type for payment statuses |
| `PaymentProviders` | `object` | Payment provider constants |
| `PaymentProvider` | `type` | Type for payment providers |
| `PaymentDirections` | `object` | Payment direction constants |
| `PaymentDirection` | `type` | Type for payment directions |
| `PayoutProviders` | `object` | Payout provider constants |
| `PayoutProvider` | `type` | Type for payout providers |
| `WithdrawalStatuses` | `object` | Withdrawal status constants |
| `WithdrawalStatus` | `type` | Type for withdrawal statuses |
| `SupporterPlatforms` | `object` | Social platform constants |
| `SupporterPlatform` | `type` | Type for supporter platforms |
| `ServiceTypes` | `object` | Service type constants |
| `ServiceType` | `type` | Type for service types |

### Utilities

| Function | Description |
|----------|-------------|
| `formatAmount` | Format number as ৳ currency |
| `formatSignedAmount` | Format with + or - sign |
| `formatCount` | Format count with K, M, B suffixes |
| `formatDate` | Format date string |
| `formatNumber` | Format with thousand separators |
| `formatToPlainText` | Convert value to plain text |
| `formatMetadataKey` | Format metadata key to readable text |
| `getUserPageLink` | Generate user profile URL |
| `getProductLink` | Generate product page URL |
| `getNewsletterPostLink` | Generate newsletter post URL |
| `getInitials` | Get name initials |
| `getSocialLink` | Generate social profile URL |
| `getSocialHandle` | Extract handle from social URL |
| `openToNewWindow` | Open URL in new tab |
| `postToFacebook` | Share to Facebook |
| `postToInstagram` | Share to Instagram |
| `postToLinkedIn` | Share to LinkedIn |
| `postToX` | Share to X (Twitter) |
| `downloadQrSvgAsPng` | Download QR as PNG |
| `printQrSvg` | Print QR code |
| `toHumanReadable` | Convert camelCase/snake_case to readable |
| `validatePhoneNumber` | Validate Bangladeshi phone |
| `checkModeration` | Check text for profanity |

### Moderation

| Function | Description |
|----------|-------------|
| `containsProfanity` | Check text for profanity (English + Bangla) |
| `containsBanglaSwear` | Check text for Bangla profanity |
| `badwordsMatcher` | English profanity matcher (obscenity) |
| `banglaBadWords` | Bangla profanity word list |

---

## Local Development

Install dependencies:

```bash
bun install
```

Available scripts:

```bash
# Build the library
bun run build

# Run in watch mode during development
bun run dev

# Run tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run type checking
bun run typecheck

# Alias for typecheck
bun run lint

# Format code
bun run format

# Check formatting
bun run format:check

# Check formatting issues
bun run format:doctor

# Clean build artifacts
bun run clean
```

---

## Project Structure

```
src/
├── index.ts                 # Main entry (re-exports constants)
├── constants/
│   ├── common.ts           # Visibility
│   ├── legal.ts            # productInfo, companyInfo
│   ├── payment.ts          # Payment constants
│   ├── platforms.ts        # SupporterPlatforms
│   ├── services.ts         # ServiceTypes
│   └── index.ts            # Exports
├── utils/
│   ├── check-moderation.ts
│   ├── format-amount.ts
│   ├── format-count.ts
│   ├── format-date.ts
│   ├── format-number.ts
│   ├── format-plain-text.ts
│   ├── get-newsletter-post-link.ts
│   ├── get-product-link.ts
│   ├── get-social-handle.ts
│   ├── get-social-link.ts
│   ├── get-user-name-initials.ts
│   ├── get-user-page-link.ts
│   ├── open-to-new-window.ts
│   ├── post-to-facebook.ts
│   ├── post-to-instagram.ts
│   ├── post-to-linkedin.ts
│   ├── post-to-x.ts
│   ├── qr-svg-utils.ts
│   ├── to-human-readable.ts
│   ├── validate-phone-number.ts
│   └── index.ts            # Exports
├── moderation/
│   ├── datasets/
│   │   ├── bn.ts           # Bangla bad words
│   │   └── index.ts
│   ├── profanity-service.ts
│   └── index.ts            # Exports
├── types/
│   ├── supabase.ts         # Full Supabase types
│   └── index.ts            # Exports + custom types
├── nuqs/
│   ├── common.ts           # URL state parsers
│   └── index.ts            # Exports
├── hooks/
│   └── use-mobile.ts       # Mobile detection hook
└── scripts/
    ├── check-env-encryption.ts
    └── index.ts            # Exports
```

---

## Dependencies

### Runtime

- `@fontsource-variable/noto-sans-bengali` - Bengali font
- `class-variance-authority` - Component variants
- `clsx` - Class name utility
- `nuqs` - URL state management
- `obscenity` - Profanity detection
- `openai` - OpenAI API
- `react` / `react-dom` - React
- `tailwind-merge` - Tailwind merge
- `tailwindcss` - Styling
- `tw-animate-css` - Animations
- `zod` - Schema validation

### Dev

- `@biomejs/biome` - Linting/formatting
- `ultracite` - Ultracite CLI
- `vite` - Build tool

---

## Release & Publish

Publishing is automated on push to the `main` branch via GitHub Actions. Ensure:

- `package.json` version is updated.
- `NPM_TOKEN` secret is configured with publish permissions.

For local publish (if needed):

```bash
npm publish --access public
```
