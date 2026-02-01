export const PaymentTypes = {
  SUBSCRIPTION: "subscription",
  ONE_TIME: "one-time",
  PAYOUT: "payout",
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
