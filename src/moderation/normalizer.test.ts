import { describe, expect, test } from "bun:test";
import { compact, normalizeLeetspeak, normalizeUnicode } from "./normalizer";

describe("normalizeLeetspeak", () => {
  test("converts number 0 to letter o", () => {
    expect(normalizeLeetspeak("h3ll0")).toBe("hello");
  });

  test("converts number 1 to letter i", () => {
    expect(normalizeLeetspeak("1nput")).toBe("input");
  });

  test("converts number 3 to letter e", () => {
    expect(normalizeLeetspeak("gr33t")).toBe("greet");
  });

  test("converts number 4 to letter a", () => {
    expect(normalizeLeetspeak("h4nd")).toBe("hand");
  });

  test("converts number 5 to letter s", () => {
    expect(normalizeLeetspeak("p455w0rd")).toBe("password");
  });

  test("converts number 7 to letter t", () => {
    expect(normalizeLeetspeak("l33t7hug")).toBe("leetthug");
  });

  test("converts @ to letter a", () => {
    expect(normalizeLeetspeak("h@ck3r")).toBe("hacker");
  });

  test("converts $ to letter s", () => {
    expect(normalizeLeetspeak("p@$$w0rd")).toBe("password");
  });

  test("handles mixed leetspeak characters", () => {
    expect(normalizeLeetspeak("p@$$w0rd1s3cur3")).toBe("passwordisecure");
  });

  test("preserves letters unchanged", () => {
    expect(normalizeLeetspeak("hello")).toBe("hello");
  });

  test("preserves unmapped characters", () => {
    expect(normalizeLeetspeak("hxllo2")).toBe("hxllo2");
  });

  test("handles empty string", () => {
    expect(normalizeLeetspeak("")).toBe("");
  });

  test("handles only special characters", () => {
    expect(normalizeLeetspeak("@$0714")).toBe("asotia");
  });

  test("handles uppercase and lowercase mixed", () => {
    expect(normalizeLeetspeak("H3LL0W0Rld")).toBe("HeLLoWoRld");
  });
});

describe("normalizeUnicode", () => {
  test("removes accents from Latin characters", () => {
    expect(normalizeUnicode("café")).toBe("cafe");
  });

  test("removes diacritics from extended Latin", () => {
    expect(normalizeUnicode("naïve")).toBe("naive");
  });

  test("handles umlauts", () => {
    expect(normalizeUnicode("Müller")).toBe("Muller");
  });

  test("handles cedill", () => {
    expect(normalizeUnicode("français")).toBe("francais");
  });

  test("handles combined diacritical marks", () => {
    expect(normalizeUnicode("résumé")).toBe("resume");
  });

  test("preserves ASCII characters", () => {
    expect(normalizeUnicode("hello")).toBe("hello");
  });

  test("preserves numbers", () => {
    expect(normalizeUnicode("test123")).toBe("test123");
  });

  test("preserves special characters", () => {
    expect(normalizeUnicode("hello!@#")).toBe("hello!@#");
  });

  test("handles empty string", () => {
    expect(normalizeUnicode("")).toBe("");
  });

  test("handles multiple accented characters", () => {
    expect(normalizeUnicode("àáâãäå")).toBe("aaaaaa");
  });

  test("handles mixed content with accents", () => {
    expect(normalizeUnicode("Chloe's café")).toBe("Chloe's cafe");
  });

  test("normalizes combining characters", () => {
    expect(normalizeUnicode("e\u0301")).toBe("e");
  });
});

describe("compact", () => {
  test("removes spaces", () => {
    expect(compact("hello world")).toBe("helloworld");
  });

  test("removes multiple spaces", () => {
    expect(compact("hello  world")).toBe("helloworld");
  });

  test("removes special characters", () => {
    expect(compact("hello!world")).toBe("helloworld");
  });

  test("removes various special characters", () => {
    expect(compact("hello@world#test!")).toBe("helloworldtest");
  });

  test("removes punctuation", () => {
    expect(compact("hello, world!")).toBe("helloworld");
  });

  test("removes underscores", () => {
    expect(compact("hello_world")).toBe("helloworld");
  });

  test("removes tabs and newlines", () => {
    expect(compact("hello\tworld\ntest")).toBe("helloworldtest");
  });

  test("preserves alphanumeric characters", () => {
    expect(compact("hello123world")).toBe("hello123world");
  });

  test("handles empty string", () => {
    expect(compact("")).toBe("");
  });

  test("handles only special characters", () => {
    expect(compact("!@#$%^&*()")).toBe("");
  });

  test("handles only spaces", () => {
    expect(compact("   ")).toBe("");
  });

  test("handles mixed content", () => {
    expect(compact("Test-Case_123!@#")).toBe("TestCase123");
  });

  test("removes hyphens", () => {
    expect(compact("hello-world")).toBe("helloworld");
  });

  test("handles email-like string", () => {
    expect(compact("test@example.com")).toBe("testexamplecom");
  });

  test("handles URL-like string", () => {
    expect(compact("https://example.com")).toBe("httpsexamplecom");
  });
});
