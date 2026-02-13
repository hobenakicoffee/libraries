import { describe, expect, test } from "bun:test";
import { formatDate } from "./format-date";

describe("formatDate", () => {
  test("returns dash for invalid date", () => {
    expect(formatDate("not-a-date")).toBe("-");
  });

  test("formats a valid date", () => {
    const input = "2026-02-13T00:00:00.000Z";
    const expected = new Date(input).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    expect(formatDate(input)).toBe(expected);
  });
});
