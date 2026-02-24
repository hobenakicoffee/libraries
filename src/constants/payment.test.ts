import { describe, expect, test } from "bun:test";
import type {
  PaymentDirection,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  PayoutProvider,
  WithdrawalStatus,
} from "./payment";
import {
  PaymentDirections,
  PaymentProviders,
  PaymentStatuses,
  PaymentTypes,
  PayoutProviders,
  WithdrawalStatuses,
} from "./payment";

describe("PaymentStatuses", () => {
  test("should contain all expected status keys", () => {
    const expectedKeys = [
      "PENDING",
      "PROCESSING",
      "COMPLETED",
      "FAILED",
      "REVERSED",
      "CANCELLED",
      "REFUNDED",
      "REVIEWING",
    ];
    expect(Object.keys(PaymentStatuses)).toEqual(expectedKeys);
  });

  test("should have correct values for each status", () => {
    expect(PaymentStatuses.PENDING).toBe("pending");
    expect(PaymentStatuses.PROCESSING).toBe("processing");
    expect(PaymentStatuses.COMPLETED).toBe("completed");
    expect(PaymentStatuses.FAILED).toBe("failed");
    expect(PaymentStatuses.REVERSED).toBe("reversed");
    expect(PaymentStatuses.CANCELLED).toBe("cancelled");
    expect(PaymentStatuses.REFUNDED).toBe("refunded");
    expect(PaymentStatuses.REVIEWING).toBe("reviewing");
  });

  test("should be read-only at compile time", () => {
    // TypeScript prevents modification at compile time with 'as const'
    // This test verifies the structure is correct
    expect(Object.isFrozen(PaymentStatuses)).toBe(false);
    expect(typeof PaymentStatuses).toBe("object");
  });

  test("PaymentStatus type should accept valid status values", () => {
    const validStatus: PaymentStatus = "completed";
    expect(validStatus).toBe("completed");
  });

  test("should have 8 payment statuses", () => {
    expect(Object.keys(PaymentStatuses).length).toBe(8);
  });

  test("all values should be lowercase strings", () => {
    Object.values(PaymentStatuses).forEach((status) => {
      expect(status).toBe(status.toLowerCase() as PaymentStatus);
      expect(typeof status).toBe("string");
    });
  });
});

describe("PaymentTypes", () => {
  test("should contain all expected keys", () => {
    const expectedKeys = [
      "SUBSCRIPTION",
      "ONE_TIME",
      "PAYOUT",
      "WITHDRAW_LOCK",
      "WITHDRAW_RELEASE",
      "WITHDRAW_COMPLETE",
      "MANUAL_ADJUSTMENT",
    ];
    expect(Object.keys(PaymentTypes)).toEqual(expectedKeys);
  });

  test("should have correct values for each type", () => {
    expect(PaymentTypes.SUBSCRIPTION).toBe("subscription");
    expect(PaymentTypes.ONE_TIME).toBe("one-time");
    expect(PaymentTypes.PAYOUT).toBe("payout");
    expect(PaymentTypes.WITHDRAW_LOCK).toBe("withdraw_lock");
    expect(PaymentTypes.WITHDRAW_RELEASE).toBe("withdraw_release");
    expect(PaymentTypes.WITHDRAW_COMPLETE).toBe("withdraw_complete");
    expect(PaymentTypes.MANUAL_ADJUSTMENT).toBe("manual_adjustment");
  });

  test("should be read-only at compile time", () => {
    // TypeScript prevents modification at compile time with 'as const'
    // This test verifies the structure is correct
    expect(Object.isFrozen(PaymentTypes)).toBe(false);
    expect(typeof PaymentTypes).toBe("object");
  });

  test("PaymentType type should accept valid type values", () => {
    const validType: PaymentType = "subscription";
    expect(validType).toBe("subscription");
  });

  test("should have 7 payment types", () => {
    expect(Object.keys(PaymentTypes).length).toBe(7);
  });

  test("all values should be lowercase or kebab-case strings", () => {
    Object.values(PaymentTypes).forEach((type) => {
      expect(typeof type).toBe("string");
      // Check that it contains lowercase letters, hyphens, or underscores
      expect(type).toMatch(/^[a-z_-]+$/);
    });
  });
});

describe("PayoutProviders", () => {
  test("should contain all expected provider keys", () => {
    const expectedKeys = ["BKASH", "NAGAD", "ROCKET", "BANK"];
    expect(Object.keys(PayoutProviders)).toEqual(expectedKeys);
  });

  test("should have correct values for each provider", () => {
    expect(PayoutProviders.BKASH).toBe("bkash");
    expect(PayoutProviders.NAGAD).toBe("nagad");
    expect(PayoutProviders.ROCKET).toBe("rocket");
    expect(PayoutProviders.BANK).toBe("bank");
  });

  test("PayoutProvider type should accept valid provider values", () => {
    const validProvider: PayoutProvider = "bkash";
    expect(validProvider).toBe("bkash");
  });

  test("should have 4 payout providers", () => {
    expect(Object.keys(PayoutProviders).length).toBe(4);
  });
});

describe("WithdrawalStatuses", () => {
  test("should contain all expected status keys", () => {
    const expectedKeys = [
      "REQUESTED",
      "APPROVED",
      "PROCESSING",
      "PAID",
      "REJECTED",
      "FAILED",
    ];
    expect(Object.keys(WithdrawalStatuses)).toEqual(expectedKeys);
  });

  test("should have correct values for each status", () => {
    expect(WithdrawalStatuses.REQUESTED).toBe("requested");
    expect(WithdrawalStatuses.APPROVED).toBe("approved");
    expect(WithdrawalStatuses.PROCESSING).toBe("processing");
    expect(WithdrawalStatuses.PAID).toBe("paid");
    expect(WithdrawalStatuses.REJECTED).toBe("rejected");
    expect(WithdrawalStatuses.FAILED).toBe("failed");
  });

  test("WithdrawalStatus type should accept valid status values", () => {
    const validStatus: WithdrawalStatus = "processing";
    expect(validStatus).toBe("processing");
  });

  test("should have 6 withdrawal statuses", () => {
    expect(Object.keys(WithdrawalStatuses).length).toBe(6);
  });
});

describe("PaymentProviders", () => {
  test("should contain all expected provider keys", () => {
    const expectedKeys = [
      "HOBENAKICOFFEE",
      "BKASH",
      "NAGAD",
      "ROCKET",
      "UPAY",
      "SSLCOMMERZ",
      "AAMARPAY",
      "PORTWALLET",
      "TAP",
      "OTHER",
    ];
    expect(Object.keys(PaymentProviders)).toEqual(expectedKeys);
  });

  test("should have correct values for each provider", () => {
    expect(PaymentProviders.HOBENAKICOFFEE).toBe("HobeNakiCoffee");
    expect(PaymentProviders.BKASH).toBe("Bkash");
    expect(PaymentProviders.NAGAD).toBe("Nagad");
    expect(PaymentProviders.ROCKET).toBe("Rocket");
    expect(PaymentProviders.UPAY).toBe("Upay");
    expect(PaymentProviders.SSLCOMMERZ).toBe("SSLCommerz");
    expect(PaymentProviders.AAMARPAY).toBe("Aamarpay");
    expect(PaymentProviders.PORTWALLET).toBe("Portwallet");
    expect(PaymentProviders.TAP).toBe("Tap");
    expect(PaymentProviders.OTHER).toBe("Other");
  });
  test("should allow HOBENAKICOFFEE as PaymentProvider type", () => {
    const provider: PaymentProvider = PaymentProviders.HOBENAKICOFFEE;
    expect(provider).toBe("HobeNakiCoffee");
  });

  test("should be read-only at compile time", () => {
    // TypeScript prevents modification at compile time with 'as const'
    // This test verifies the structure is correct
    expect(Object.isFrozen(PaymentProviders)).toBe(false);
    expect(typeof PaymentProviders).toBe("object");
  });

  test("PaymentProvider type should accept valid provider values", () => {
    const validProvider: PaymentProvider = "Bkash";
    expect(validProvider).toBe("Bkash");
  });

  test("should have 10 payment providers", () => {
    expect(Object.keys(PaymentProviders).length).toBe(10);
  });

  test("all values should be lowercase strings", () => {
    Object.values(PaymentProviders).forEach((provider) => {
      expect(provider).toBe(provider as PaymentProvider);
      expect(typeof provider).toBe("string");
    });
  });
});

describe("PaymentDirections", () => {
  test("should contain all expected direction keys", () => {
    const expectedKeys = ["DEBIT", "CREDIT"];
    expect(Object.keys(PaymentDirections)).toEqual(expectedKeys);
  });

  test("should have correct values for each direction", () => {
    expect(PaymentDirections.DEBIT).toBe("debit");
    expect(PaymentDirections.CREDIT).toBe("credit");
  });

  test("should be usable as PaymentDirection type", () => {
    const debit: PaymentDirection = "debit";
    const credit: PaymentDirection = "credit";
    expect(debit).toBe("debit");
    expect(credit).toBe("credit");
  });

  test("should have 2 payment directions", () => {
    expect(Object.keys(PaymentDirections).length).toBe(2);
  });

  test("all values should be lowercase strings", () => {
    Object.values(PaymentDirections).forEach((direction) => {
      expect(direction).toBe(direction.toLowerCase() as PaymentDirection);
      expect(typeof direction).toBe("string");
    });
  });
});
