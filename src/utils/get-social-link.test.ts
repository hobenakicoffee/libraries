import { describe, expect, test } from "bun:test";
import { SupporterPlatforms } from "../constants";
import { getSocialLink } from "./get-social-link";

describe("getSocialLink", () => {
  test("returns null when username or platform is missing", () => {
    expect(getSocialLink(undefined, SupporterPlatforms.FACEBOOK)).toBeNull();
    expect(getSocialLink("alice", undefined)).toBeNull();
    expect(getSocialLink()).toBeNull();
  });

  test("returns correct Facebook URL", () => {
    expect(getSocialLink("alice", SupporterPlatforms.FACEBOOK)).toBe(
      "https://facebook.com/alice"
    );
  });

  test("returns correct Instagram URL with spaces", () => {
    expect(getSocialLink(" john doe ", SupporterPlatforms.INSTAGRAM)).toBe(
      "https://instagram.com/johndoe"
    );
  });

  test("returns correct TikTok URL", () => {
    expect(getSocialLink("user123", SupporterPlatforms.TIKTOK)).toBe(
      "https://tiktok.com/@user123"
    );
  });

  test("returns correct YouTube URL", () => {
    expect(getSocialLink("Jane", SupporterPlatforms.YOUTUBE)).toBe(
      "https://youtube.com/Jane"
    );
  });

  test("returns correct X (Twitter) URL", () => {
    expect(getSocialLink("bob", SupporterPlatforms.X)).toBe(
      "https://x.com/bob"
    );
  });

  test("returns correct LinkedIn URL", () => {
    expect(getSocialLink("johnsmith", SupporterPlatforms.LINKEDIN)).toBe(
      "https://linkedin.com/in/johnsmith"
    );
  });

  test("returns correct GitHub URL", () => {
    expect(getSocialLink("octocat", SupporterPlatforms.GITHUB)).toBe(
      "https://github.com/octocat"
    );
  });

  test("returns null for unsupported platform", () => {
    expect(getSocialLink("alice", "MYSPACE" as any)).toBeNull();
  });

  test("sanitizes username with special characters", () => {
    expect(getSocialLink("user name!@#", SupporterPlatforms.FACEBOOK)).toBe(
      "https://facebook.com/username!%40%23"
    );
  });
});
