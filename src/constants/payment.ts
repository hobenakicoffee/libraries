export const PaymentTypes = {
  SUBSCRIPTION: "subscription",
  ONE_TIME: "one-time",
  PAYOUT: "payout",
  WITHDRAW_LOCK: "withdraw_lock",
  WITHDRAW_RELEASE: "withdraw_release",
  WITHDRAW_COMPLETE: "withdraw_complete",
  MANUAL_ADJUSTMENT: "manual_adjustment",
} as const;

export type PaymentType = (typeof PaymentTypes)[keyof typeof PaymentTypes];

export const PaymentStatuses = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  REVERSED: "reversed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  REVIEWING: "reviewing",
} as const;

export type PaymentStatus =
  (typeof PaymentStatuses)[keyof typeof PaymentStatuses];

export const PaymentProviders = {
  HOBENAKICOFFEE: "HobeNakiCoffee",
  BKASH: "Bkash",
  NAGAD: "Nagad",
  ROCKET: "Rocket",
  UPAY: "Upay",
  SSLCOMMERZ: "SSLCommerz",
  AAMARPAY: "Aamarpay",
  PORTWALLET: "Portwallet",
  TAP: "Tap",
  OTHER: "Other",
} as const;

export type PaymentProvider =
  (typeof PaymentProviders)[keyof typeof PaymentProviders];

export const PaymentDirections = {
  DEBIT: "debit",
  CREDIT: "credit",
} as const;

export type PaymentDirection =
  (typeof PaymentDirections)[keyof typeof PaymentDirections];

export const PayoutProviders = {
  BKASH: "bkash",
  NAGAD: "nagad",
  ROCKET: "rocket",
  BANK: "bank",
} as const;

export type PayoutProvider =
  (typeof PayoutProviders)[keyof typeof PayoutProviders];

export const WithdrawalStatuses = {
  REQUESTED: "requested",
  APPROVED: "approved",
  PROCESSING: "processing",
  PAID: "paid",
  REJECTED: "rejected",
  FAILED: "failed",
} as const;

export type WithdrawalStatus =
  (typeof WithdrawalStatuses)[keyof typeof WithdrawalStatuses];
