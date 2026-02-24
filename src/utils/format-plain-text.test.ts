import { describe, expect, test } from "bun:test";
import { formatMetadataKey, formatToPlainText } from "./format-plain-text";

describe("formatToPlainText", () => {
  test("returns empty string for null and undefined", () => {
    expect(formatToPlainText(null)).toBe("");
    expect(formatToPlainText(undefined)).toBe("");
  });

  test("formats booleans to Yes/No by default", () => {
    expect(formatToPlainText(true)).toBe("Yes");
    expect(formatToPlainText(false)).toBe("No");
  });

  test("can keep raw boolean text", () => {
    expect(formatToPlainText(true, { formatBooleans: false })).toBe("true");
  });

  test("truncates long strings with ellipsis", () => {
    expect(formatToPlainText("abcdef", { maxStringLength: 5 })).toBe("ab...");
  });

  test("stringifies objects and arrays", () => {
    expect(formatToPlainText({ a: 1 })).toBe(JSON.stringify({ a: 1 }, null, 2));
    expect(formatToPlainText(["x", "y"])).toBe(
      JSON.stringify(["x", "y"], null, 2)
    );
  });
});

describe("formatMetadataKey", () => {
  test("formats camelCase and snake_case keys", () => {
    expect(formatMetadataKey("supporterName")).toBe("Supporter Name");
    expect(formatMetadataKey("is_monthly")).toBe("Is monthly");
  });
});
