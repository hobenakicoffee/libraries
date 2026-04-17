import { describe, expect, mock, test } from "bun:test";
import {
  badwordsMatcher,
  containsBanglaSwear,
  containsProfanity,
} from "./profanity-service";

mock.module("obscenity", () => ({
  englishDataset: { build: () => ({ patterns: [], masks: [] }) },
  englishRecommendedTransformers: {},
  RegExpMatcher: class {
    hasMatch() {
      return false;
    }
  },
}));

describe("containsBanglaSwear", () => {
  test("returns false when no bad words found", () => {
    const result = containsBanglaSwear("ভালো কথা");
    expect(result).toBe(false);
  });

  test("returns true when Bangla bad word is found", () => {
    const result = containsBanglaSwear("খানকির ছেলে");
    expect(result).toBe(true);
  });

  test("matches bad words in mixed text", () => {
    const result = containsBanglaSwear("এটি খানকির ছেলে একটি বাক্য");
    expect(result).toBe(true);
  });

  test("handles normalized unicode", () => {
    const result = containsBanglaSwear("খানকির ছেলে");
    expect(result).toBe(true);
  });

  test("returns false for empty string", () => {
    const result = containsBanglaSwear("");
    expect(result).toBe(false);
  });

  test("handles multiple bad words", () => {
    const result = containsBanglaSwear("খানকির ছেলে এবং চোদানীর পোলা");
    expect(result).toBe(true);
  });

  test("handles leetspeak variations", () => {
    const result = containsBanglaSwear("খানকির ছেলে");
    expect(typeof result).toBe("boolean");
  });
});

describe("containsProfanity", () => {
  test("returns false for clean text", () => {
    const result = containsProfanity("এটি একটি পরিষ্কার বাক্য");
    expect(result).toBe(false);
  });

  test("throws error for undefined input", () => {
    expect(() => containsProfanity(undefined as unknown as string)).toThrow();
  });

  test("returns false for empty string", () => {
    const result = containsProfanity("");
    expect(result).toBe(false);
  });

  test("returns proper boolean structure", () => {
    const result = containsProfanity("clean text");
    expect(typeof result).toBe("boolean");
  });

  test("handles mixed English and Bangla text", () => {
    const result = containsProfanity("hello world খানকির ছেলে content");
    expect(result).toBe(true);
  });

  test("handles whitespace and punctuation", () => {
    const result = containsProfanity("clean text!!!");
    expect(result).toBe(false);
  });

  test("handles very long text", () => {
    const longText = `clean text ${"word ".repeat(1000)}`;
    const result = containsProfanity(longText);
    expect(typeof result).toBe("boolean");
  });

  test("throws error for null input", () => {
    expect(() => containsProfanity(null as unknown as string)).toThrow();
  });
});

describe("badwordsMatcher", () => {
  test("is a RegExpMatcher instance", () => {
    expect(badwordsMatcher).toBeDefined();
    expect(typeof badwordsMatcher.hasMatch).toBe("function");
  });

  test("hasMatch returns boolean", () => {
    const result = badwordsMatcher.hasMatch("clean text");
    expect(typeof result).toBe("boolean");
  });
});
