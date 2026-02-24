import { describe, expect, test } from "bun:test";
import type { Visibility as VisibilityType } from "./common";
import { Visibility } from "./common";

describe("Visibility", () => {
  test("should contain all expected keys", () => {
    const expectedKeys = ["PUBLIC", "PRIVATE"];
    expect(Object.keys(Visibility)).toEqual(expectedKeys);
  });

  test("should have correct values for each visibility", () => {
    expect(Visibility.PUBLIC).toBe("public");
    expect(Visibility.PRIVATE).toBe("private");
  });

  test("should be usable as Visibility type", () => {
    const pub: VisibilityType = "public";
    const priv: VisibilityType = "private";
    expect(pub).toBe("public");
    expect(priv).toBe("private");
  });

  test("should have 2 visibilities", () => {
    expect(Object.keys(Visibility).length).toBe(2);
  });

  test("all values should be lowercase strings", () => {
    Object.values(Visibility).forEach((v) => {
      expect(v).toBe(v.toLowerCase() as VisibilityType);
      expect(typeof v).toBe("string");
    });
  });
});
