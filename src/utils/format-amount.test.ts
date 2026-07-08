import { describe, expect, test } from "bun:test";
import { formatAmount, formatSignedAmount } from "./format-amount";

const fmt = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

describe("formatAmount", () => {
  test("formats absolute number with currency symbol", () => {
    expect(formatAmount(-1234)).toBe(`৳${fmt.format(1234)}`);
  });

  test("preserves decimal places", () => {
    expect(formatAmount(123.45)).toBe(`৳${fmt.format(123.45)}`);
  });

  test("drops trailing zeros on whole numbers", () => {
    expect(formatAmount(100)).toBe(`৳${fmt.format(100)}`);
  });
});

describe("formatSignedAmount", () => {
  test("uses minus sign for debit", () => {
    expect(formatSignedAmount(2000, "debit")).toBe(`- ৳${fmt.format(2000)}`);
  });

  test("uses plus sign for credit and absolute value", () => {
    expect(formatSignedAmount(-2000, "credit")).toBe(`+ ৳${fmt.format(2000)}`);
  });

  test("preserves decimal places with sign", () => {
    expect(formatSignedAmount(456.78, "debit")).toBe(
      `- ৳${fmt.format(456.78)}`
    );
    expect(formatSignedAmount(-99.5, "credit")).toBe(`+ ৳${fmt.format(99.5)}`);
  });
});
