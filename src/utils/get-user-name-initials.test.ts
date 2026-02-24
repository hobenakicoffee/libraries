import { describe, expect, test } from "bun:test";
import { getInitials } from "./get-user-name-initials";

describe("getInitials", () => {
  test("returns initials for a full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Jane Ann Smith")).toBe("JS");
    expect(getInitials("Alice Bob Carol")).toBe("AC");
  });

  test("returns single initial for single name", () => {
    expect(getInitials("John")).toBe("J");
    expect(getInitials("A")).toBe("A");
  });

  test("handles extra spaces", () => {
    expect(getInitials("  John   Doe  ")).toBe("JD");
    expect(getInitials("   Alice   ")).toBe("A");
    expect(getInitials("   Alice   Bob   Carol   ")).toBe("AC");
  });

  test("returns ? for empty or undefined", () => {
    expect(getInitials("")).toBe("?");
    expect(getInitials("   ")).toBe("?");
    expect(getInitials(undefined)).toBe("?");
    expect(getInitials(null)).toBe("?");
  });

  test("handles non-ASCII and special characters", () => {
    expect(getInitials("Élodie Durand")).toBe("ÉD");
    expect(getInitials("李 小龙")).toBe("李小");
    expect(getInitials("O’Connor")).toBe("O");
  });
});
