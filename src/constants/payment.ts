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
  BKASH: "bkash",
  NAGAD: "nagad",
  ROCKET: "rocket",
  UPAY: "upay",
  SSLCOMMERZ: "sslcommerz",
  AAMARPAY: "aamarpay",
  PORTWALLET: "portwallet",
  TAP: "tap",
  OTHER: "other",
} as const;

export type PaymentProvider =
  (typeof PaymentProviders)[keyof typeof PaymentProviders];

export const PaymentDirections = {
  DEBIT: "debit",
  CREDIT: "credit",
} as const;

export type PaymentDirection =
  (typeof PaymentDirections)[keyof typeof PaymentDirections];
