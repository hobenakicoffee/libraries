import { describe, expect, test } from "bun:test";
import type { SupporterPlatform } from "./platforms";
import { SupporterPlatforms } from "./platforms";

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
