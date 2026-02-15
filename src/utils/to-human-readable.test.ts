import { describe, expect, test } from "bun:test";
import { toHumanReadable } from "./to-human-readable";

describe("toHumanReadable", () => {
  test("returns empty string for blank input", () => {
    expect(toHumanReadable("   ")).toBe("");
  });

  test("normalizes separators and trims", () => {
    expect(toHumanReadable("  hello-world__again  ")).toBe("Hello World Again");
  });

  test("splits camelCase and title cases words", () => {
    expect(toHumanReadable("supporterName")).toBe("Supporter Name");
  });

  test("preserves uppercase acronyms and numbers", () => {
    expect(toHumanReadable("APIResponseV2")).toBe("API Response V2");
    expect(toHumanReadable("USER_ID_2")).toBe("USER ID 2");
  });

  test("handles mixed separators and spacing", () => {
    expect(toHumanReadable("foo__BAR-baz   QUX")).toBe("Foo BAR Baz QUX");
  });
});
