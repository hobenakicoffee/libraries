import { describe, expect, test } from "bun:test";
import type {
  ShopApprovalStatus as ShopApprovalStatusType,
  ShopPolicyType as ShopPolicyTypeType,
  ShopProductType as ShopProductTypeType,
} from "./shop-service";
import {
  MAX_PRODUCT_PRICE,
  ShopApprovalStatuses,
  ShopPolicyTypes,
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

describe("ShopPolicyTypes", () => {
  test("should contain all expected policy type keys", () => {
    const expectedKeys = [
      "return_refund",
      "digital_products",
      "shipping",
      "privacy",
      "terms_of_service",
    ];
    expect(Object.keys(ShopPolicyTypes)).toEqual(expectedKeys);
  });

  test("should have correct values for each policy type", () => {
    expect(ShopPolicyTypes.return_refund).toBe("return_refund");
    expect(ShopPolicyTypes.digital_products).toBe("digital_products");
    expect(ShopPolicyTypes.shipping).toBe("shipping");
    expect(ShopPolicyTypes.privacy).toBe("privacy");
    expect(ShopPolicyTypes.terms_of_service).toBe("terms_of_service");
  });

  test("should have 5 policy types", () => {
    expect(Object.keys(ShopPolicyTypes).length).toBe(5);
  });

  test("all values should be lowercase strings with underscores", () => {
    for (const type of Object.values(ShopPolicyTypes)) {
      expect(typeof type).toBe("string");
      expect(type).toMatch(/^[a-z_]+$/);
    }
  });
});

describe("ShopPolicyType type", () => {
  test("should accept 'return_refund' as a valid type", () => {
    const validType: ShopPolicyTypeType = "return_refund";
    expect(validType).toBe("return_refund");
  });

  test("should accept 'digital_products' as a valid type", () => {
    const validType: ShopPolicyTypeType = "digital_products";
    expect(validType).toBe("digital_products");
  });

  test("should accept 'shipping' as a valid type", () => {
    const validType: ShopPolicyTypeType = "shipping";
    expect(validType).toBe("shipping");
  });

  test("should accept 'privacy' as a valid type", () => {
    const validType: ShopPolicyTypeType = "privacy";
    expect(validType).toBe("privacy");
  });

  test("should accept 'terms_of_service' as a valid type", () => {
    const validType: ShopPolicyTypeType = "terms_of_service";
    expect(validType).toBe("terms_of_service");
  });
});
