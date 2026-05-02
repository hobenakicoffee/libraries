# Shop Service

Constants for shop product configuration.

## Usage

```ts
import { MAX_PRODUCT_PRICE, ShopProductType } from "@hobenakicoffee/libraries/constants";
```

## Values

| Constant | Value | Description |
| -------- | ---- | ----------- |
| `MAX_PRODUCT_PRICE` | `9_999_999_999` | Maximum allowed product price |
| `ShopProductType.digital` | `"digital"` | Digital product (downloads, etc.) |
| `ShopProductType.physical` | `"physical"` | Physical product (shipped items) |

## Types

### ShopProductType

```ts
type ShopProductType = "digital" | "physical";
```

## Example

```ts
import { MAX_PRODUCT_PRICE, ShopProductType } from "@hobenakicoffee/libraries";

const maxPrice = MAX_PRODUCT_PRICE;
// => 9999999999

const productType = ShopProductType.digital;
// => "digital"

const physicalType = ShopProductType.physical;
// => "physical"
```

## Related

- [Constants Overview](./)