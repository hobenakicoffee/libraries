import { describe, expect, test } from "bun:test";
import type {
  ShopApprovalStatus as ShopApprovalStatusType,
  ShopProductType as ShopProductTypeType,
} from "./shop-service";
import {
  MAX_PRODUCT_PRICE,
  ShopApprovalStatuses,
  ShopProductTypes,
} from "./shop-service";

describe("MAX_PRODUCT_PRICE", () => {
  test("should be a positive number", () => {
    expect(MAX_PRODUCT_PRICE).toBeGreaterThan(0);
  });

  test("should have the expected value", () => {
    expect(MAX_PRODUCT_PRICE).toBe(9_999_999_999);
  });
});

describe("ShopProductType", () => {
  test("should contain all expected product type keys", () => {
    const expectedKeys = ["digital", "physical"];
    expect(Object.keys(ShopProductTypes)).toEqual(expectedKeys);
  });

  test("should have correct values for each product type", () => {
    expect(ShopProductTypes.digital).toBe("digital");
    expect(ShopProductTypes.physical).toBe("physical");
  });

  test("should have 2 product types", () => {
    expect(Object.keys(ShopProductTypes).length).toBe(2);
  });

  test("all values should be lowercase strings", () => {
    for (const type of Object.values(ShopProductTypes)) {
      expect(typeof type).toBe("string");
      expect(type).toMatch(/^[a-z]+$/);
    }
  });
});

describe("ShopProductType type", () => {
  test("should accept 'digital' as a valid type", () => {
    const validType: ShopProductTypeType = "digital";
    expect(validType).toBe("digital");
  });

  test("should accept 'physical' as a valid type", () => {
    const validType: ShopProductTypeType = "physical";
    expect(validType).toBe("physical");
  });
});

describe("ShopApprovalStatuses", () => {
  test("should contain all expected approval status keys", () => {
    const expectedKeys = ["pending", "approved", "rejected"];
    expect(Object.keys(ShopApprovalStatuses)).toEqual(expectedKeys);
  });

  test("should have correct values for each approval status", () => {
    expect(ShopApprovalStatuses.pending).toBe("pending");
    expect(ShopApprovalStatuses.approved).toBe("approved");
    expect(ShopApprovalStatuses.rejected).toBe("rejected");
  });

  test("should have 3 approval statuses", () => {
    expect(Object.keys(ShopApprovalStatuses).length).toBe(3);
  });

  test("all values should be lowercase strings", () => {
    for (const status of Object.values(ShopApprovalStatuses)) {
      expect(typeof status).toBe("string");
      expect(status).toMatch(/^[a-z]+$/);
    }
  });
});

describe("ShopApprovalStatus type", () => {
  test("should accept 'pending' as a valid status", () => {
    const validStatus: ShopApprovalStatusType = "pending";
    expect(validStatus).toBe("pending");
  });

  test("should accept 'approved' as a valid status", () => {
    const validStatus: ShopApprovalStatusType = "approved";
    expect(validStatus).toBe("approved");
  });

  test("should accept 'rejected' as a valid status", () => {
    const validStatus: ShopApprovalStatusType = "rejected";
    expect(validStatus).toBe("rejected");
  });
});
