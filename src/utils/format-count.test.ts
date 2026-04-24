import { describe, expect, test } from "bun:test";
import { formatCount } from "./format-count";

describe("formatCount", () => {
  test("formats zero and small numbers without suffix", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(7)).toBe("7");
    expect(formatCount(999)).toBe("999");
  });

  test("handles negative numbers", () => {
    expect(formatCount(-1000)).toBe("-1k");
    expect(formatCount(-1500)).toBe("-1.5k");
    expect(formatCount(-1_000_000)).toBe("-1M");
  });

  test("formats thousands with k suffix", () => {
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(10_000)).toBe("10k");
    expect(formatCount(100_000)).toBe("100k");
  });

  test("shows decimal for non-round thousands", () => {
    expect(formatCount(1500)).toBe("1.5k");
    expect(formatCount(10_500)).toBe("10.5k");
    expect(formatCount(15_500)).toBe("15.5k");
  });

  test("formats millions with M suffix", () => {
    expect(formatCount(1_000_000)).toBe("1M");
    expect(formatCount(10_000_000)).toBe("10M");
    expect(formatCount(100_000_000)).toBe("100M");
  });

  test("shows decimal for non-round millions", () => {
    expect(formatCount(1_500_000)).toBe("1.5M");
    expect(formatCount(10_500_000)).toBe("10.5M");
  });

  test("formats billions with B suffix", () => {
    expect(formatCount(1_000_000_000)).toBe("1B");
    expect(formatCount(10_000_000_000)).toBe("10B");
    expect(formatCount(100_000_000_000)).toBe("100B");
  });

  test("shows decimal for non-round billions", () => {
    expect(formatCount(1_500_000_000)).toBe("1.5B");
    expect(formatCount(2_100_000_000)).toBe("2.1B");
  });

  test("uses whole numbers for large round values", () => {
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(1_000_000)).toBe("1M");
    expect(formatCount(1_000_000_000)).toBe("1B");
  });
});
