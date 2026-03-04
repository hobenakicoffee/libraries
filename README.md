# @hobenakicoffee/libraries

Framework-agnostic shared constants, utilities, types, UI components, and moderation tools for "হবে নাকি Coffee?" projects.

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

This package exposes multiple entry points:

```ts
// Main entry - constants and types
import { PaymentStatuses, ServiceTypes, Visibility } from "@hobenakicoffee/libraries";

// Constants only
import { SupporterPlatforms } from "@hobenakicoffee/libraries/constants";

// Utilities only
import { formatAmount, formatDate, getUserPageLink } from "@hobenakicoffee/libraries/utils";

// Types only
import type { Database, Tables } from "@hobenakicoffee/libraries/types";

// Moderation tools
import { moderateText } from "@hobenakicoffee/libraries/moderation";

// UI components
import { Button, Card, Dialog } from "@hobenakicoffee/libraries/components/ui/button";
import { ThemeProvider, useTheme } from "@hobenakicoffee/libraries/providers/theme-provider";

// Class merging utility
import { cn } from "@hobenakicoffee/libraries/lib/utils";
```

## Entry Points Overview

| Entrypoint | Description |
| ---------- | ----------- |
| `@hobenakicoffee/libraries` | Main entry - re-exports constants and types |
| `@hobenakicoffee/libraries/constants` | Constants and types |
| `@hobenakicoffee/libraries/utils` | Utility functions |
| `@hobenakicoffee/libraries/types` | TypeScript types (Supabase) |
| `@hobenakicoffee/libraries/moderation` | Content moderation tools |
| `@hobenakicoffee/libraries/providers/theme-provider` | Theme provider component |
| `@hobenakicoffee/libraries/lib/utils` | Class merging utility (`cn()`) |
| `@hobenakicoffee/libraries/components/ui/*` | UI components |

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
SupporterPlatforms.DEVTO      // "devto"
SupporterPlatforms.BEHANCE    // "behance"
SupporterPlatforms.DRIBBBLE   // "dribbble"
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

### getSocialUrl

Generates social sharing URLs with support for platform usernames.

```ts
import { getSocialUrl } from "@hobenakicoffee/libraries/utils";

// With our platform username
getSocialUrl("johndoe");
// "https://hobenakicoffee.com/@johndoe"

// With platform and supporter name
getSocialUrl(null, "instagram", "johndoe");
// "https://instagram.com/johndoe"
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

### moderateText

Local profanity detection for English and Bangla.

```ts
import { moderateText } from "@hobenakicoffee/libraries/moderation";

const result = moderateText("some bad word here");

result.isAllowed  // boolean
result.matched    // Array of matched words
```

### normalizeLeetspeak

Converts leetspeak to normal text (e.g., "h4x0r" -> "haxor").

```ts
import { normalizeLeetspeak } from "@hobenakicoffee/libraries/moderation";

normalizeLeetspeak("h4x0r");  // "haxor"
normalizeLeetspeak("p@ssw0rd"); // "password"
```

### normalizeUnicode

Normalizes Unicode characters (removes diacritics).

```ts
import { normalizeUnicode } from "@hobenakicoffee/libraries/moderation";

normalizeUnicode("café");  // "cafe"
```

### banglaBadWords

Array of Bangla profanity words (710+ words) for content moderation.

```ts
import { banglaBadWords } from "@hobenakicoffee/libraries/moderation";

console.log(banglaBadWords.length); // 710+
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

### Database Tables

- `activities` - User activity tracking
- `coffee_gifts` - Coffee gift transactions
- `conversation_participants` - Chat participants
- `conversations` - Chat conversations
- `follows` - User follow relationships
- `manager_role_permissions` - Manager role permissions
- `manager_user_roles` - Manager user role assignments
- `managers` - Manager profiles
- `messages` - Chat messages
- `messages_*` - Monthly partitioned message tables
- `payout_methods` - User payout methods
- `profiles` - User profiles
- `supporters` - Supporter records
- `transactions` - Payment transactions
- `wallets` - User wallets
- `withdrawal_requests` - Withdrawal requests

### Database Enums

- `manager_permission` - Manager permissions
- `manager_role` - Manager roles (super_admin, content_manager, etc.)
- `manager_status` - Manager account status
- `payment_status_enum` - Payment statuses
- `payout_provider` - Payout provider types
- `provider_enum` - Payment providers
- `reference_type_enum` - Transaction reference types
- `supporter_platform_enum` - Supporter platform types
- `transaction_direction_enum` - Debit/credit
- `user_role` - User roles
- `visibility_enum` - Public/private visibility
- `withdrawal_status` - Withdrawal request statuses

---

## UI Components

The library includes 30+ accessible UI components built on Radix UI.

### Importing Components

```ts
// Individual imports (recommended for tree-shaking)
import { Button } from "@hobenakicoffee/libraries/components/ui/button";
import { Card } from "@hobenakicoffee/libraries/components/ui/card";
import { Dialog } from "@hobenakicoffee/libraries/components/ui/dialog";
import { Input } from "@hobenakicoffee/libraries/components/ui/input";

// All components available:
import { Alert } from "@hobenakicoffee/libraries/components/ui/alert";
import { AlertDialog } from "@hobenakicoffee/libraries/components/ui/alert-dialog";
import { Avatar } from "@hobenakicoffee/libraries/components/ui/avatar";
import { Badge } from "@hobenakicoffee/libraries/components/ui/badge";
import { Breadcrumb } from "@hobenakicoffee/libraries/components/ui/breadcrumb";
import { Button, ButtonGroup } from "@hobenakicoffee/libraries/components/ui/button";
import { Calendar } from "@hobenakicoffee/libraries/components/ui/calendar";
import { Card, Chart } from "@hobenakicoffee/libraries/components/ui/card";
import { Checkbox } from "@hobenakicoffee/libraries/components/ui/checkbox";
import { Dialog } from "@hobenakicoffee/libraries/components/ui/dialog";
import { Drawer } from "@hobenakicoffee/libraries/components/ui/drawer";
import { DropdownMenu } from "@hobenakicoffee/libraries/components/ui/dropdown-menu";
import { Empty, EmptyMinimal } from "@hobenakicoffee/libraries/components/ui/empty";
import { Field, Input, InputGroup, InputOtp } from "@hobenakicoffee/libraries/components/ui/input";
import { Item } from "@hobenakicoffee/libraries/components/ui/item";
import { Label } from "@hobenakicoffee/libraries/components/ui/label";
import { Popover } from "@hobenakicoffee/libraries/components/ui/popover";
import { RadioGroup } from "@hobenakicoffee/libraries/components/ui/radio-group";
import { Select } from "@hobenakicoffee/libraries/components/ui/select";
import { Separator } from "@hobenakicoffee/libraries/components/ui/separator";
import { Sheet } from "@hobenakicoffee/libraries/components/ui/sheet";
import { Sidebar } from "@hobenakicoffee/libraries/components/ui/sidebar";
import { Skeleton } from "@hobenakicoffee/libraries/components/ui/skeleton";
import { Sonner } from "@hobenakicoffee/libraries/components/ui/sonner";
import { Spinner } from "@hobenakicoffee/libraries/components/ui/spinner";
import { Table } from "@hobenakicoffee/libraries/components/ui/table";
import { Tabs } from "@hobenakicoffee/libraries/components/ui/tabs";
import { Textarea } from "@hobenakicoffee/libraries/components/ui/textarea";
import { Toggle, ToggleGroup } from "@hobenakicoffee/libraries/components/ui/toggle";
import { Tooltip } from "@hobenakicoffee/libraries/components/ui/tooltip";
```

### Component Variants

Components use `cva` (class-variance-authority) for variants:

```ts
import { Button } from "@hobenakicoffee/libraries/components/ui/button";
import { Badge } from "@hobenakicoffee/libraries/components/ui/badge";

// Button variants
<Button variant="default" />
<Button variant="destructive" />
<Button variant="outline" />
<Button variant="secondary" />
<Button variant="ghost" />
<Button variant="link" />

// Button sizes
<Button size="default" />
<Button size="sm" />
<Button size="lg" />
<Button size="icon" />

// Badge variants
<Badge variant="default" />
<Badge variant="secondary" />
<Badge variant="destructive" />
<Badge variant="outline" />
```

### Turnstile Captcha

```ts
import { TurnstileCaptcha } from "@hobenakicoffee/libraries/components/turnstile-captcha";

<TurnstileCaptcha
  siteKey="your-site-key"
  onSuccess={(token) => console.log(token)}
  onError={() => console.error("Error")}
  theme="auto"
/>
```

---

## Theme Provider (`@hobenakicoffee/libraries/providers/theme-provider`)

Dark/light mode theming with system preference support.

```tsx
import { ThemeProvider, useTheme } from "@hobenakicoffee/libraries/providers/theme-provider";

// Wrap your app
function App({ children }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="my-app-theme">
      {children}
    </ThemeProvider>
  );
}

// Use in components
function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </button>
  );
}
```

Props:
- `children` - React nodes
- `defaultTheme` - "light" | "dark" | "system" (default: "system")
- `storageKey` - localStorage key (default: "hobenakicoffee-app-ui-themes")

---

## Utils (`@hobenakicoffee/libraries/lib/utils`)

### cn

Class name merging utility combining `clsx` and `tailwind-merge`.

```ts
import { cn } from "@hobenakicoffee/libraries/lib/utils";

cn("px-2 py-1", "bg-red-500", condition && "text-white");
// Returns merged class string
```

---

## API Reference

### Constants and Types

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
| `formatDate` | Format date string |
| `formatNumber` | Format with thousand separators |
| `formatToPlainText` | Convert value to plain text |
| `formatMetadataKey` | Format metadata key to readable text |
| `getUserPageLink` | Generate user profile URL |
| `getInitials` | Get name initials |
| `getSocialLink` | Generate social profile URL |
| `getSocialUrl` | Generate social sharing URL |
| `openInNewWindow` | Open URL in new tab |
| `shareToFacebook` | Share to Facebook |
| `shareToInstagram` | Share to Instagram |
| `shareToLinkedIn` | Share to LinkedIn |
| `shareToX` | Share to X (Twitter) |
| `downloadQrSvgAsPng` | Download QR as PNG |
| `printQrSvg` | Print QR code |
| `toHumanReadable` | Convert camelCase/snake_case to readable |
| `validatePhoneNumber` | Validate Bangladeshi phone |
| `checkModeration` | Check text for profanity |

### Moderation

| Function | Description |
|----------|-------------|
| `moderateText` | Check text for profanity |
| `checkBanglaWords` | Check for Bangla bad words |
| `normalizeLeetspeak` | Convert leetspeak to normal |
| `normalizeUnicode` | Remove Unicode diacritics |
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

# Clean build artifacts
bun run clean
```

---

## Project Structure

```
src/
├── index.ts                 # Main entry
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
│   ├── format-date.ts
│   ├── format-number.ts
│   ├── format-plain-text.ts
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
│   │   ├── bn.ts           # Bangla bad words (710+)
│   │   └── index.ts
│   ├── normalizer.ts
│   ├── profanity-service.ts
│   └── index.ts            # Exports
├── types/
│   ├── supabase.ts         # Full Supabase types
│   └── index.ts
├── lib/
│   └── utils.ts            # cn() utility
├── providers/
│   └── theme-provider.tsx  # Theme provider
└── components/
    ├── turnstile-captcha.tsx
    └── ui/                 # 30+ UI components
        ├── alert.tsx
        ├── alert-dialog.tsx
        ├── avatar.tsx
        ├── badge.tsx
        ├── breadcrumb.tsx
        ├── button.tsx
        ├── button-group.tsx
        ├── calendar.tsx
        ├── card.tsx
        ├── chart.tsx
        ├── checkbox.tsx
        ├── dialog.tsx
        ├── drawer.tsx
        ├── dropdown-menu.tsx
        ├── empty.tsx
        ├── empty-minimal.tsx
        ├── field.tsx
        ├── input.tsx
        ├── input-group.tsx
        ├── input-otp.tsx
        ├── item.tsx
        ├── label.tsx
        ├── popover.tsx
        ├── radio-group.tsx
        ├── select.tsx
        ├── separator.tsx
        ├── sheet.tsx
        ├── sidebar.tsx
        ├── skeleton.tsx
        ├── sonner.tsx
        ├── spinner.tsx
        ├── table.tsx
        ├── tabs.tsx
        ├── textarea.tsx
        ├── toggle.tsx
        ├── toggle-group.tsx
        └── tooltip.tsx
```

---

## Dependencies

### Runtime

- `@fontsource-variable/noto-sans-bengali` - Bengali font
- `@hugeicons/core-free-icons` - Hugeicons
- `@hugeicons/react` - React icons
- `@marsidev/react-turnstile` - Turnstile captcha
- `@tailwindcss/vite` - Tailwind CSS
- `class-variance-authority` - Component variants
- `glin-profanity` - Profanity detection
- `input-otp` - OTP input
- `next-themes` - Theme provider
- `openai` - OpenAI API
- `radix-ui` - UI primitives
- `react` / `react-dom` - React
- `react-day-picker` - Calendar
- `recharts` - Charts
- `shadcn` - UI components
- `sonner` - Toast notifications
- `tailwind-merge` - Tailwind merge
- `tailwindcss` - Styling
- `tw-animate-css` - Animations
- `vaul` - Drawer

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
