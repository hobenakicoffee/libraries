import { describe, expect, test } from "bun:test";
import { getUserPageLink } from "./get-user-page-link";

describe("getUserPageLink", () => {
  test("builds user page link with sanitized username", () => {
    const result = getUserPageLink(" @john doe ");
    expect(result.endsWith("/@%40johndoe")).toBe(true);
  });
});
