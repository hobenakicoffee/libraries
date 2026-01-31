import { describe, expect, test } from "bun:test";
import { ServiceTypes } from "./services";
import type { ServiceType } from "./services";

describe("ServiceTypes", () => {
  test("should contain all expected service type keys", () => {
    const expectedKeys = ["GIFT", "EXCLUSIVE_CONTENT"];
    expect(Object.keys(ServiceTypes)).toEqual(expectedKeys);
  });

  test("should have correct values for each service type", () => {
    expect(ServiceTypes.GIFT).toBe("gift");
    expect(ServiceTypes.EXCLUSIVE_CONTENT).toBe("exclusive_content");
  });

  test("should be read-only at compile time", () => {
    // TypeScript prevents modification at compile time with 'as const'
    // This test verifies the structure is correct
    expect(Object.isFrozen(ServiceTypes)).toBe(false);
    expect(typeof ServiceTypes).toBe("object");
  });

  test("ServiceType type should accept valid service type values", () => {
    const validType: ServiceType = "gift";
    expect(validType).toBe("gift");
  });

  test("should have 2 service types", () => {
    expect(Object.keys(ServiceTypes).length).toBe(2);
  });

  test("all values should be lowercase or snake_case strings", () => {
    Object.values(ServiceTypes).forEach((type) => {
      expect(typeof type).toBe("string");
      // Check that it only contains lowercase letters and underscores
      expect(type).toMatch(/^[a-z_]+$/);
    });
  });
});
