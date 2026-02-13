import { describe, expect, test } from "bun:test";
import { getSocialUrl } from "./get-social-handle";
import { getUserPageLink } from "./get-user-page-link";

describe("getSocialUrl", () => {
  test("returns our platform URL when username is provided", () => {
    expect(getSocialUrl("alice", "x", "ignored")).toBe(
      getUserPageLink("alice"),
    );
  });

  test("returns # when required fields are missing", () => {
    expect(getSocialUrl(undefined, "x", "")).toBe("#");
    expect(getSocialUrl(undefined, null, "name")).toBe("#");
  });

  test("builds social URL with sanitized handle", () => {
    expect(getSocialUrl(undefined, "instagram", " @john doe ")).toBe(
      "https://instagram.com/johndoe",
    );
  });

  test("uses platform-specific format for youtube", () => {
    expect(getSocialUrl(undefined, "youtube", "Jane")).toBe(
      "https://youtube.com/@Jane",
    );
  });

  test("returns # for unsupported platform", () => {
    expect(getSocialUrl(undefined, "myspace" as any, "Jane")).toBe("#");
  });
});
