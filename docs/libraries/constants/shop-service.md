# Shop Service

Constants for shop product configuration.

## Usage

```ts
import { MAX_PRODUCT_PRICE, ShopProductTypes } from "@hobenakicoffee/libraries/constants";
```

## Values

| Constant | Value | Description |
| -------- | ---- | ----------- |
| `MAX_PRODUCT_PRICE` | `9_999_999_999` | Maximum allowed product price |
| `ShopProductTypes.digital` | `"digital"` | Digital product (downloads, etc.) |
| `ShopProductTypes.physical` | `"physical"` | Physical product (shipped items) |

## Types

### ShopProductType

```ts
type ShopProductType = "digital" | "physical";
```

## Example

```ts
import { MAX_PRODUCT_PRICE, ShopProductTypes } from "@hobenakicoffee/libraries";

const maxPrice = MAX_PRODUCT_PRICE;
// => 9999999999

const productType = ShopProductTypes.digital;
// => "digital"

const physicalType = ShopProductTypes.physical;
// => "physical"
```

## Related

- [Constants Overview](./)
