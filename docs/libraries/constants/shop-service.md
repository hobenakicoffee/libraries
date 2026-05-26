# Shop Service

Constants for shop product configuration, approval statuses, and policies.

## Usage

```ts
import { MAX_PRODUCT_PRICE, ShopProductTypes, ShopApprovalStatuses, ShopPolicyTypes } from "@hobenakicoffee/libraries/constants";
```

## Values

### MAX_PRODUCT_PRICE

| Constant | Value | Description |
| -------- | ---- | ----------- |
| `MAX_PRODUCT_PRICE` | `9_999_999_999` | Maximum allowed product price |

### ShopProductTypes

| Constant | Value | Description |
| -------- | ---- | ----------- |
| `ShopProductTypes.digital` | `"digital"` | Digital product (downloads, etc.) |
| `ShopProductTypes.physical` | `"physical"` | Physical product (shipped items) |

### ShopApprovalStatuses

| Constant | Value | Description |
| -------- | ---- | ----------- |
| `ShopApprovalStatuses.pending` | `"pending"` | Awaiting review |
| `ShopApprovalStatuses.approved` | `"approved"` | Approved |
| `ShopApprovalStatuses.rejected` | `"rejected"` | Rejected |

### ShopPolicyTypes

| Constant | Value | Description |
| -------- | ---- | ----------- |
| `ShopPolicyTypes.return_refund` | `"return_refund"` | Return and refund policy |
| `ShopPolicyTypes.digital_products` | `"digital_products"` | Digital products policy |
| `ShopPolicyTypes.shipping` | `"shipping"` | Shipping policy |
| `ShopPolicyTypes.privacy` | `"privacy"` | Privacy policy |
| `ShopPolicyTypes.terms_of_service` | `"terms_of_service"` | Terms of service |

## Types

### ShopProductType

```ts
type ShopProductType = "digital" | "physical";
```

### ShopApprovalStatus

```ts
type ShopApprovalStatus = "pending" | "approved" | "rejected";
```

### ShopPolicyType

```ts
type ShopPolicyType = "return_refund" | "digital_products" | "shipping" | "privacy" | "terms_of_service";
```

## Example

```ts
import { MAX_PRODUCT_PRICE, ShopProductTypes, ShopApprovalStatuses, ShopPolicyTypes } from "@hobenakicoffee/libraries";

const maxPrice = MAX_PRODUCT_PRICE;
// => 9999999999

const productType = ShopProductTypes.digital;
// => "digital"

const approvalStatus = ShopApprovalStatuses.pending;
// => "pending"

const policyType = ShopPolicyTypes.privacy;
// => "privacy"
```

## Related

- [Constants Overview](./)
