# Link Utilities

Functions for generating user, product, and social media links.

## Usage

```ts
import { getUserPageLink, getProductLink, getNewsletterPostLink, getSocialLink, getSocialHandle, getInitials } from "@hobenakicoffee/libraries/utils";
```

## getUserPageLink

Generates a user profile page URL.

```ts
getUserPageLink("johndoe");
// => "https://hobenakicoffee.com/@johndoe"

getUserPageLink("johndoe", "https://custom.com");
// => "https://custom.com/@johndoe"
```

## getProductLink

Generates a product page URL.

```ts
getProductLink("johndoe", "my-product");
// => "https://hobenakicoffee.com/@johndoe/shop/products/my-product"

getProductLink("johndoe", "my-product", "https://custom.com");
// => "https://custom.com/@johndoe/shop/products/my-product"
```

## getNewsletterPostLink

Generates a newsletter post URL.

```ts
getNewsletterPostLink("johndoe", "my-post");
// => "/@johndoe/posts/my-post"

getNewsletterPostLink("johndoe", "my-post", "https://hobenakicoffee.com");
// => "https://hobenakicoffee.com/@johndoe/posts/my-post"
```

## getSocialLink

Generates a social media profile URL.

```ts
import { SupporterPlatforms } from "@hobenakicoffee/libraries/constants";

getSocialLink("johndoe", SupporterPlatforms.FACEBOOK);
// => "https://facebook.com/johndoe"

getSocialLink("johndoe", SupporterPlatforms.INSTAGRAM);
// => "https://instagram.com/johndoe"

getSocialLink("johndoe", SupporterPlatforms.GITHUB);
// => "https://github.com/johndoe"
```

## getSocialHandle

Extracts the handle/username from a social media URL.

```ts
getSocialHandle("https://twitter.com/johndoe"); // => "johndoe"
getSocialHandle("@johndoe");                     // => "johndoe"
getSocialHandle("johndoe");                     // => "johndoe"
```

## getInitials

Extracts initials from a name.

```ts
getInitials("John Doe");       // => "JD"
getInitials("John");           // => "J"
getInitials("John Michael");   // => "JM"
getInitials(null);             // => "?"
```

## openInNewWindow

Opens a URL in a new tab safely.

```ts
openInNewWindow("https://example.com");
// Opens in new tab with rel="noopener noreferrer"
```

## Related

- [Utils Overview](../utils/overview)
- [Constants - Platforms](../constants/platforms)