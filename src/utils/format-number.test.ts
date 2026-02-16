import { describe, expect, test } from "bun:test";
import { formatNumber } from "./format-number";

function digitsFromFormatted(formatted: string) {
  const digits = formatted.replace(/\D/g, "");
  return Number(digits);
}

describe("formatNumber", () => {
  test("formats positive numbers and rounds correctly", () => {
    expect(digitsFromFormatted(formatNumber(1234.56))).toBe(1235);
  });

  test("formats negative numbers using absolute value", () => {
    expect(digitsFromFormatted(formatNumber(-9876.5))).toBe(9877);
  });

  test("formats zero", () => {
    expect(digitsFromFormatted(formatNumber(0))).toBe(0);
  });

  test("rounds small fractional numbers to 0", () => {
    expect(digitsFromFormatted(formatNumber(-0.4))).toBe(0);
  });

  test("formats large numbers", () => {
    expect(digitsFromFormatted(formatNumber(1000000))).toBe(1000000);
  });
});
