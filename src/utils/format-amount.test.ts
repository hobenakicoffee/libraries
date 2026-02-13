import { describe, expect, test } from "bun:test";
import { formatAmount, formatSignedAmount } from "./format-amount";

describe("formatAmount", () => {
  test("formats absolute number with currency symbol", () => {
    const expected = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    }).format(1234);

    expect(formatAmount(-1234)).toBe(`৳${expected}`);
  });
});

describe("formatSignedAmount", () => {
  test("uses minus sign for debit", () => {
    const expected = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    }).format(2000);

    expect(formatSignedAmount(2000, "debit")).toBe(`- ৳${expected}`);
  });

  test("uses plus sign for credit and absolute value", () => {
    const expected = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    }).format(2000);

    expect(formatSignedAmount(-2000, "credit")).toBe(`+ ৳${expected}`);
  });
});
