# Payment Constants

Payment-related constants including types, statuses, providers, directions, and withdrawal statuses.

## Usage

```ts
import { PaymentTypes, PaymentStatuses, PaymentProviders, PaymentDirections, PayoutProviders, WithdrawalStatuses } from "@hobenakicoffee/libraries/constants";
```

## Payment Types

| Constant | Value |
| `PaymentTypes.SUBSCRIPTION` | `"subscription"` |
| `PaymentTypes.ONE_TIME` | `"one-time"` |
| `PaymentTypes.PAYOUT` | `"payout"` |
| `PaymentTypes.WITHDRAW_LOCK` | `"withdraw_lock"` |
| `PaymentTypes.WITHDRAW_RELEASE` | `"withdraw_release"` |
| `PaymentTypes.WITHDRAW_COMPLETE` | `"withdraw_complete"` |
| `PaymentTypes.MANUAL_ADJUSTMENT` | `"manual_adjustment"` |

## Payment Statuses

| Constant | Value |
| `PaymentStatuses.PENDING` | `"pending"` |
| `PaymentStatuses.PROCESSING` | `"processing"` |
| `PaymentStatuses.COMPLETED` | `"completed"` |
| `PaymentStatuses.FAILED` | `"failed"` |
| `PaymentStatuses.REVERSED` | `"reversed"` |
| `PaymentStatuses.CANCELLED` | `"cancelled"` |
| `PaymentStatuses.REFUNDED` | `"refunded"` |
| `PaymentStatuses.REVIEWING` | `"reviewing"` |

## Payment Providers

| Constant | Value |
| `PaymentProviders.HOBENAKICOFFEE` | `"HobeNakiCoffee"` |
| `PaymentProviders.BKASH` | `"Bkash"` |
| `PaymentProviders.NAGAD` | `"Nagad"` |
| `PaymentProviders.ROCKET` | `"Rocket"` |
| `PaymentProviders.UPAY` | `"Upay"` |
| `PaymentProviders.SSLCOMMERZ` | `"SSLCommerz"` |
| `PaymentProviders.AAMARPAY` | `"Aamarpay"` |
| `PaymentProviders.PORTWALLET` | `"Portwallet"` |
| `PaymentProviders.TAP` | `"Tap"` |
| `PaymentProviders.OTHER` | `"Other"` |

## Payment Directions

| Constant | Value |
| `PaymentDirections.DEBIT` | `"debit"` |
| `PaymentDirections.CREDIT` | `"credit"` |

## Payout Providers

| Constant | Value |
| `PayoutProviders.BKASH` | `"bkash"` |
| `PayoutProviders.NAGAD` | `"nagad"` |
| `PayoutProviders.ROCKET` | `"rocket"` |
| `PayoutProviders.BANK` | `"bank"` |

## Withdrawal Statuses

| Constant | Value |
| `WithdrawalStatuses.REQUESTED` | `"requested"` |
| `WithdrawalStatuses.APPROVED` | `"approved"` |
| `WithdrawalStatuses.PROCESSING` | `"processing"` |
| `WithdrawalStatuses.PAID` | `"paid"` |
| `WithdrawalStatuses.REJECTED` | `"rejected"` |
| `WithdrawalStatuses.FAILED` | `"failed"` |

## Related

- [Constants](./index)