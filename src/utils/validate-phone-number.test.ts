import { describe, expect, test } from "bun:test";
import { validatePhoneNumber } from "./validate-phone-number";

describe("validatePhoneNumber", () => {
  test("returns true for valid Bangladeshi mobile numbers", () => {
    expect(validatePhoneNumber("01712345678")).toBe(true);
    expect(validatePhoneNumber("+8801712345678")).toBe(true);
    expect(validatePhoneNumber("8801712345678")).toBe(true);
  });

  test("normalizes spaces and dashes before validation", () => {
    expect(validatePhoneNumber("01 7123-45678")).toBe(true);
  });

  test("returns false for invalid operator prefix", () => {
    expect(validatePhoneNumber("01212345678")).toBe(false);
    expect(validatePhoneNumber("+8801212345678")).toBe(false);
  });

  test("returns false for invalid length", () => {
    expect(validatePhoneNumber("0171234567")).toBe(false);
    expect(validatePhoneNumber("017123456789")).toBe(false);
  });

  test("returns false for non-numeric input", () => {
    expect(validatePhoneNumber("abc01712345678")).toBe(false);
  });
});