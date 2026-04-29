# Format Utilities

Functions for formatting amounts, dates, numbers, and counts.

## Usage

```ts
import { formatAmount, formatDate, formatNumber, formatCount, formatSignedAmount } from "@hobenakicoffee/libraries/utils";
```

## formatAmount

Formats a number as Bangladeshi Taka (৳).

```ts
formatAmount(1000);   // => "৳1,000"
formatAmount(-500);  // => "৳500" (absolute value)
```

## formatSignedAmount

Formats a number with a + or - sign based on direction.

```ts
formatSignedAmount(1000, "credit");  // => "+ ৳1,000"
formatSignedAmount(500, "debit");     // => "- ৳500"
```

## formatCount

Formats a number with appropriate suffixes.

```ts
formatCount(500);      // => "500"
formatCount(1000);     // => "1K"
formatCount(1500000);  // => "1.5M"
formatCount(1000000000); // => "1B"
```

## formatDate

Formats a date string to a readable format.

```ts
formatDate("2024-01-15T00:00:00Z");  // => "Jan 15, 2024"
formatDate("invalid");              // => "-"
```

## formatNumber

Formats a number with thousand separators.

```ts
formatNumber(1000000);  // => "1,000,000"
```

## formatToPlainText

Converts various data types to plain text.

```ts
formatToPlainText("hello");           // => "hello"
formatToPlainText(123);              // => "123"
formatToPlainText(true);             // => "Yes"
formatToPlainText(false);           // => "No"

formatToPlainText("some long text...", { maxStringLength: 10 });
// => "some lo..."

formatMetadataKey("supporterName");  // => "Supporter Name"
formatMetadataKey("is_monthly");     // => "Is monthly"
```

## Related

- [Utils Overview](../utils/overview)