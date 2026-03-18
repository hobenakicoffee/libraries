import { describe, expect, test } from "bun:test";
import { formatCount } from "./format-count";

describe("formatCount", () => {
  test("formats numbers less than 1000 using formatNumber", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
  });

  test("formats numbers >= 1000 with k suffix", () => {
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(2000)).toBe("2k");
    expect(formatCount(10_000)).toBe("10k");
    expect(formatCount(1_000_000)).toBe("1000k");
  });

  test("shows decimal for non-round thousands", () => {
    expect(formatCount(1500)).toBe("1.5k");
    expect(formatCount(10_500)).toBe("10.5k");
  });
});
