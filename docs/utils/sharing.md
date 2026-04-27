# Social Sharing

Functions for sharing content to social media platforms.

## Usage

```ts
import { shareToFacebook, shareToInstagram, shareToLinkedIn, shareToX, toHumanReadable } from "@hobenakicoffee/libraries/utils";
```

## shareToFacebook

Shares a URL to Facebook.

```ts
shareToFacebook({
  url: "https://example.com",
  quote: "Check this out!",
  hashtag: "coffee",
  ref: "campaign123"
});
```

## shareToInstagram

Shares to Instagram (uses Web Share API or copies to clipboard).

```ts
shareToInstagram({
  url: "https://example.com",
  text: "Check this out!"
});
```

## shareToLinkedIn

Shares to LinkedIn.

```ts
shareToLinkedIn({
  url: "https://example.com",
  title: "My Title",
  summary: "Description here",
  source: "HobeNakiCoffee"
});
```

## shareToX (Twitter)

Shares to X (Twitter).

```ts
shareToX({
  text: "Hello from HobeNakiCoffee!",
  url: "https://example.com",
  hashtags: ["coffee", "support"],
  via: "hobenakicoffee"
});
```

## QR Code Utilities

### downloadQrSvgAsPng

Downloads a QR code SVG as PNG.

```ts
await downloadQrSvgAsPng(
  '<svg>...</svg>',
  "qr-code.png",
  () => console.log("Success"),
  () => console.log("Error")
);
```

### printQrSvg

Prints a QR code.

```ts
printQrSvg(
  '<svg>...</svg>',
  "QR Code Print",
  () => console.log("Error")
);
```

## toHumanReadable

Converts camelCase or snake_case strings to human-readable format.

```ts
toHumanReadable("camelCase");       // => "Camel Case"
toHumanReadable("snake_case");      // => "Snake Case"
toHumanReadable("CONSTANT_VALUE");  // => "CONSTANT VALUE"
toHumanReadable("HTTPResponseCode"); // => "HTTP Response Code"
```

## Related

- [Utils Index](../utils/index)