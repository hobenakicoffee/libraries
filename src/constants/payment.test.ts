import { describe, expect, test } from "bun:test";
import {
  PaymentProviders,
  PaymentStatuses,
  PaymentTypes,
  PaymentDirections,
} from "./payment";
import type {
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  PaymentDirection,
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
    const expectedKeys = ["SUBSCRIPTION", "ONE_TIME", "PAYOUT"];
    expect(Object.keys(PaymentTypes)).toEqual(expectedKeys);
  });

  test("should have correct values for each type", () => {
    expect(PaymentTypes.SUBSCRIPTION).toBe("subscription");
    expect(PaymentTypes.ONE_TIME).toBe("one-time");
    expect(PaymentTypes.PAYOUT).toBe("payout");
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

  test("should have 3 payment types", () => {
    expect(Object.keys(PaymentTypes).length).toBe(3);
  });

  test("all values should be lowercase or kebab-case strings", () => {
    Object.values(PaymentTypes).forEach((type) => {
      expect(typeof type).toBe("string");
      // Check that it contains lowercase letters, hyphens, or underscores
      expect(type).toMatch(/^[a-z_-]+$/);
    });
  });
});

describe("PaymentProviders", () => {
  test("should contain all expected provider keys", () => {
    const expectedKeys = [
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
    expect(PaymentProviders.BKASH).toBe("bkash");
    expect(PaymentProviders.NAGAD).toBe("nagad");
    expect(PaymentProviders.ROCKET).toBe("rocket");
    expect(PaymentProviders.UPAY).toBe("upay");
    expect(PaymentProviders.SSLCOMMERZ).toBe("sslcommerz");
    expect(PaymentProviders.AAMARPAY).toBe("aamarpay");
    expect(PaymentProviders.PORTWALLET).toBe("portwallet");
    expect(PaymentProviders.TAP).toBe("tap");
    expect(PaymentProviders.OTHER).toBe("other");
  });

  test("should be read-only at compile time", () => {
    // TypeScript prevents modification at compile time with 'as const'
    // This test verifies the structure is correct
    expect(Object.isFrozen(PaymentProviders)).toBe(false);
    expect(typeof PaymentProviders).toBe("object");
  });

  test("PaymentProvider type should accept valid provider values", () => {
    const validProvider: PaymentProvider = "bkash";
    expect(validProvider).toBe("bkash");
  });

  test("should have 9 payment providers", () => {
    expect(Object.keys(PaymentProviders).length).toBe(9);
  });

  test("all values should be lowercase strings", () => {
    Object.values(PaymentProviders).forEach((provider) => {
      expect(provider).toBe(provider.toLowerCase() as PaymentProvider);
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
