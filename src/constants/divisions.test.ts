import { describe, expect, test } from "bun:test";
import type { Tables } from "../types";
import { divisions } from "./divisions";

describe("divisions", () => {
  test("should have 8 divisions", () => {
    expect(divisions.length).toBe(8);
  });

  test("should contain all expected divisions in correct order", () => {
    const expected = [
      "Chattagram",
      "Rajshahi",
      "Khulna",
      "Barisal",
      "Sylhet",
      "Dhaka",
      "Rangpur",
      "Mymensingh",
    ];
    expect(divisions.map((d) => d.name)).toEqual(expected);
  });

  test("each division should have all required fields", () => {
    for (const division of divisions) {
      expect(division).toHaveProperty("id");
      expect(division).toHaveProperty("name");
      expect(division).toHaveProperty("bn_name");
      expect(division).toHaveProperty("url");
    }
  });

  test("each division should have a positive integer id", () => {
    for (const division of divisions) {
      expect(Number.isInteger(division.id)).toBe(true);
      expect(division.id).toBeGreaterThan(0);
    }
  });

  test("ids should be unique", () => {
    const ids = divisions.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("each division should have a non-empty name", () => {
    for (const division of divisions) {
      expect(division.name.length).toBeGreaterThan(0);
    }
  });

  test("each division should have a non-empty bn_name", () => {
    for (const division of divisions) {
      expect(division.bn_name.length).toBeGreaterThan(0);
    }
  });

  test("each division should have a valid url", () => {
    for (const division of divisions) {
      expect(division.url).toMatch(/^www\.[a-z]+div\.gov\.bd$/);
    }
  });

  test("should satisfy the Tables<'divisions'> type", () => {
    const _typeCheck: Tables<"divisions">[] = divisions;
    expect(_typeCheck).toBe(divisions);
  });

  test("should be a read-only array (not frozen at runtime)", () => {
    expect(Object.isFrozen(divisions)).toBe(false);
  });
});
