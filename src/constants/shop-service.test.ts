import { describe, expect, test } from "bun:test";
import type { ShopProductType as ShopProductTypeType } from "./shop-service";
import { MAX_PRODUCT_PRICE, ShopProductTypes } from "./shop-service";

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
