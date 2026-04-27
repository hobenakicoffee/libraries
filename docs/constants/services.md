# Service Types

Constants for different supporter service types.

## Usage

```ts
import { ServiceTypes } from "@hobenakicoffee/libraries/constants";
```

## Values

| Constant | Value | Description |
| -------- | ---- | ----------- |
| `ServiceTypes.GIFT` | `"gift"` | Coffee/tip gift |
| `ServiceTypes.EXCLUSIVE_CONTENT` | `"exclusive_content"` | Premium content access |
| `ServiceTypes.WITHDRAWAL` | `"withdrawal"` | Payout request |
| `ServiceTypes.FOLLOW` | `"follow"` | Follow subscription |

## Example

```ts
import { ServiceTypes } from "@hobenakicoffee/libraries";

const isGift = ServiceTypes.GIFT;
// => "gift"

const isExclusive = ServiceTypes.EXCLUSIVE_CONTENT;
// => "exclusive_content"
```

## Related

- [Constants Overview](./overview)