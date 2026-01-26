import { describe, expect, test } from "bun:test";
import { SupporterPlatforms, PaymentStatuses, ServiceTypes } from "./index";
import type { SupporterPlatform, PaymentStatus, ServiceType } from "./index";

describe("SupporterPlatforms", () => {
  test("should contain all expected platform keys", () => {
    const expectedKeys = [
      "FACEBOOK",
      "X",
      "INSTAGRAM",
      "YOUTUBE",
      "GITHUB",
      "LINKEDIN",
      "TWITCH",
      "TIKTOK",
      "THREADS",
      "WHATSAPP",
      "TELEGRAM",
      "DISCORD",
      "REDDIT",
      "PINTEREST",
      "MEDIUM",
      "DEVTO",
      "BEHANCE",
      "DRIBBBLE",
    ];

    expect(Object.keys(SupporterPlatforms)).toEqual(expectedKeys);
  });

  test("should have correct values for each platform", () => {
    expect(SupporterPlatforms.FACEBOOK).toBe("facebook");
    expect(SupporterPlatforms.X).toBe("x");
    expect(SupporterPlatforms.INSTAGRAM).toBe("instagram");
    expect(SupporterPlatforms.YOUTUBE).toBe("youtube");
    expect(SupporterPlatforms.GITHUB).toBe("github");
    expect(SupporterPlatforms.LINKEDIN).toBe("linkedin");
    expect(SupporterPlatforms.TWITCH).toBe("twitch");
    expect(SupporterPlatforms.TIKTOK).toBe("tiktok");
    expect(SupporterPlatforms.THREADS).toBe("threads");
    expect(SupporterPlatforms.WHATSAPP).toBe("whatsapp");
    expect(SupporterPlatforms.TELEGRAM).toBe("telegram");
    expect(SupporterPlatforms.DISCORD).toBe("discord");
    expect(SupporterPlatforms.REDDIT).toBe("reddit");
    expect(SupporterPlatforms.PINTEREST).toBe("pinterest");
    expect(SupporterPlatforms.MEDIUM).toBe("medium");
    expect(SupporterPlatforms.DEVTO).toBe("devto");
    expect(SupporterPlatforms.BEHANCE).toBe("behance");
    expect(SupporterPlatforms.DRIBBBLE).toBe("dribbble");
  });

  test("should be read-only at compile time", () => {
    // TypeScript prevents modification at compile time with 'as const'
    // This test verifies the structure is correct
    expect(Object.isFrozen(SupporterPlatforms)).toBe(false);
    expect(typeof SupporterPlatforms).toBe("object");
  });

  test("SupporterPlatform type should accept valid platform values", () => {
    const validPlatform: SupporterPlatform = "facebook";
    expect(validPlatform).toBe("facebook");
  });

  test("should have 18 platforms", () => {
    expect(Object.keys(SupporterPlatforms).length).toBe(18);
  });
});

describe("PaymentStatuses", () => {
  test("should contain all expected status keys", () => {
    const expectedKeys = [
      "PENDING",
      "COMPLETED",
      "FAILED",
      "CANCELLED",
      "REFUNDED",
      "REVIEWING",
    ];

    expect(Object.keys(PaymentStatuses)).toEqual(expectedKeys);
  });

  test("should have correct values for each status", () => {
    expect(PaymentStatuses.PENDING).toBe("pending");
    expect(PaymentStatuses.COMPLETED).toBe("completed");
    expect(PaymentStatuses.FAILED).toBe("failed");
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

  test("should have 6 payment statuses", () => {
    expect(Object.keys(PaymentStatuses).length).toBe(6);
  });

  test("all values should be lowercase strings", () => {
    Object.values(PaymentStatuses).forEach((status) => {
      expect(status).toBe(status.toLowerCase() as PaymentStatus);
      expect(typeof status).toBe("string");
    });
  });
});

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
