# Platforms

Social media platform constants for supporter integration.

## Usage

```ts
import { SupporterPlatforms } from "@hobenakicoffee/libraries/constants";
```

## Values

| Constant | Value |
| `SupporterPlatforms.FACEBOOK` | `"facebook"` |
| `SupporterPlatforms.X` | `"x"` |
| `SupporterPlatforms.INSTAGRAM` | `"instagram"` |
| `SupporterPlatforms.YOUTUBE` | `"youtube"` |
| `SupporterPlatforms.GITHUB` | `"github"` |
| `SupporterPlatforms.LINKEDIN` | `"linkedin"` |
| `SupporterPlatforms.TWITCH` | `"twitch"` |
| `SupporterPlatforms.TIKTOK` | `"tiktok"` |
| `SupporterPlatforms.THREADS` | `"threads"` |
| `SupporterPlatforms.WHATSAPP` | `"whatsapp"` |
| `SupporterPlatforms.TELEGRAM` | `"telegram"` |
| `SupporterPlatforms.DISCORD` | `"discord"` |
| `SupporterPlatforms.REDDIT` | `"reddit"` |
| `SupporterPlatforms.PINTEREST` | `"pinterest"` |
| `SupporterPlatforms.MEDIUM` | `"medium"` |
| `SupporterPlatforms.DEVTO` | `"devto"` |
| `SupporterPlatforms.BEHANCE` | `"behance"` |
| `SupporterPlatforms.DRIBBBLE` | `"dribble"` |

## Example

```ts
import { SupporterPlatforms, getSocialLink } from "@hobenakicoffee/libraries";

getSocialLink("johndoe", SupporterPlatforms.FACEBOOK);
// => "https://facebook.com/johndoe"

getSocialLink("johndoe", SupporterPlatforms.INSTAGRAM);
// => "https://instagram.com/johndoe"
```

## Related

- [Constants](./index)
- [Utils - Links](../utils/links)