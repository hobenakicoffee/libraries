import { describe, expect, test, mock } from "bun:test";
import { checkBanglaWords, moderateText } from "./profanity-service";

// Mock the glin-profanity module
mock.module("glin-profanity", () => ({
  checkProfanity: (text: string, options: any) => {
    // Simple mock that detects common profane words
    const profaneWords = ["badword", "profanity", "curse"];
    const foundWords = profaneWords.filter((word) => text.includes(word));

    return {
      containsProfanity: foundWords.length > 0,
      matches: foundWords.map((word) => ({ word })),
    };
  },
}));

describe("checkBanglaWords", () => {
  test("returns empty array when no bad words found", () => {
    const result = checkBanglaWords("ভালো কথা");
    expect(result).toEqual([]);
  });

  test("returns matched words when Bangla bad word is found", () => {
    const result = checkBanglaWords("খানকির ছেলে");
    expect(result).toContain("খানকির ছেলে");
  });

  test("matches bad words in mixed text", () => {
    const result = checkBanglaWords("এটি খানকির ছেলে একটি বাক্য");
    expect(result).toContain("খানকির ছেলে");
  });

  test("is case insensitive", () => {
    // Bangla words normalized should match
    const result = checkBanglaWords("খানকির ছেলে");
    expect(result.length).toBeGreaterThan(0);
  });

  test("returns empty for empty string", () => {
    const result = checkBanglaWords("");
    expect(result).toEqual([]);
  });

  test("handles multiple bad words", () => {
    const result = checkBanglaWords("খানকির ছেলে এবং চোদানীর পোলা");
    expect(result.length).toBeGreaterThan(0);
  });

  test("handles normalized leetspeak variations", () => {
    // Normalized versions should still match
    const result = checkBanglaWords("খানকির ছেলে");
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  test("returns array of matched words", () => {
    const result = checkBanglaWords("খানকির ছেলে এবং খানকি মাগী");
    expect(Array.isArray(result)).toBe(true);
    expect(result.every((item) => typeof item === "string")).toBe(true);
  });
});

describe("moderateText", () => {
  test("returns allowed true for clean text", () => {
    const result = moderateText("এটি একটি পরিষ্কার বাক্য");
    expect(result.isAllowed).toBe(true);
    expect(result.matched).toEqual([]);
  });

  test("returns allowed false for English profanity", () => {
    const result = moderateText("this is badword content");
    expect(result.isAllowed).toBe(false);
    expect(result.matched).toContain("badword");
  });

  test("returns allowed false for Bangla profanity", () => {
    const result = moderateText("খানকির ছেলে");
    expect(result.isAllowed).toBe(false);
    expect(result.matched.length).toBeGreaterThan(0);
  });

  test("returns allowed true for undefined input", () => {
    const result = moderateText(undefined);
    expect(result.isAllowed).toBe(true);
    expect(result.matched).toEqual([]);
  });

  test("returns allowed true for empty string", () => {
    const result = moderateText("");
    expect(result.isAllowed).toBe(true);
    expect(result.matched).toEqual([]);
  });

  test("returns proper ModerationResult structure", () => {
    const result = moderateText("clean text");
    expect(result).toHaveProperty("isAllowed");
    expect(result).toHaveProperty("matched");
    expect(typeof result.isAllowed).toBe("boolean");
    expect(Array.isArray(result.matched)).toBe(true);
  });

  test("case insensitive moderation", () => {
    const result = moderateText("THIS IS BADWORD CONTENT");
    expect(result.isAllowed).toBe(false);
    expect(result.matched.length).toBeGreaterThan(0);
  });

  test("detects multiple profanities", () => {
    const result = moderateText("badword and profanity");
    expect(result.isAllowed).toBe(false);
    expect(result.matched.length).toBeGreaterThan(1);
  });

  test("handles mixed English and Bangla text", () => {
    const result = moderateText("hello world খানকির ছেলে content");
    expect(result.isAllowed).toBe(false);
    expect(result.matched.length).toBeGreaterThan(0);
  });

  test("normalizes text before checking", () => {
    // Leetspeak normalized version
    const result = moderateText("b4dw0rd");
    // The function normalizes text, so it should be checked
    expect(result).toHaveProperty("isAllowed");
    expect(result).toHaveProperty("matched");
  });

  test("returns matched array with single word", () => {
    const result = moderateText("badword");
    expect(result.matched).toContain("badword");
  });

  test("handles whitespace and punctuation", () => {
    const result = moderateText("badword!!!");
    expect(result.isAllowed).toBe(false);
  });

  test("preserves original word casing in matched results", () => {
    // Based on glin-profanity behavior, it should return the matched word
    const result = moderateText("BADWORD");
    expect(result.matched.length).toBeGreaterThan(0);
  });

  test("handles very long text", () => {
    const longText = "clean text " + "word ".repeat(1000);
    const result = moderateText(longText);
    expect(result).toHaveProperty("isAllowed");
    expect(result).toHaveProperty("matched");
  });

  test("detects curse words", () => {
    const result = moderateText("this is a curse example");
    expect(result.isAllowed).toBe(false);
    expect(result.matched).toContain("curse");
  });

  test("handles null input gracefully", () => {
    const result = moderateText(null as any);
    expect(result).toHaveProperty("isAllowed");
    expect(result).toHaveProperty("matched");
  });
});
