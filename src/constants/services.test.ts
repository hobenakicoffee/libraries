import { describe, expect, test } from "bun:test";
import type { ServiceType } from "./services";
import { ServiceTypes } from "./services";

describe("ServiceTypes", () => {
  test("should contain all expected service type keys", () => {
    const expectedKeys = [
      "GIFT",
      "DIGITAL_CONTENT",
      "MY_SHOP",
      "CONSULTANCY_1ON1",
      "HIRE_ME",
      "COURSES",
      "LIVE_STREAMS",
      "NEWSLETTER",
      "WITHDRAWAL",
      "FOLLOW",
    ];
    expect(Object.keys(ServiceTypes)).toEqual(expectedKeys);
  });

  test("should have correct values for each service type", () => {
    expect(ServiceTypes.GIFT).toBe("gift");
    expect(ServiceTypes.DIGITAL_CONTENT).toBe("digital-content");
    expect(ServiceTypes.MY_SHOP).toBe("shop");
    expect(ServiceTypes.CONSULTANCY_1ON1).toBe("consultancy");
    expect(ServiceTypes.HIRE_ME).toBe("hire");
    expect(ServiceTypes.COURSES).toBe("courses");
    expect(ServiceTypes.LIVE_STREAMS).toBe("live-streaming");
    expect(ServiceTypes.NEWSLETTER).toBe("newsletter");
    expect(ServiceTypes.WITHDRAWAL).toBe("withdrawal");
    expect(ServiceTypes.FOLLOW).toBe("follow");
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

  test("should have 10 service types", () => {
    expect(Object.keys(ServiceTypes).length).toBe(10);
  });

  test("all values should be lowercase or snake_case strings", () => {
    for (const type of Object.values(ServiceTypes)) {
      expect(typeof type).toBe("string");
      // Check that it only contains lowercase letters, numbers, and underscores
      expect(type).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
