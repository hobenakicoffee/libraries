import { afterEach, describe, expect, test } from "bun:test";
import { shareToLinkedIn } from "./post-to-linkedin";

describe("shareToLinkedIn", () => {
  const originalWindow = (globalThis as any).window;

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  test("throws when url is missing", () => {
    expect(() => shareToLinkedIn({ url: "" })).toThrow(
      "LinkedIn share requires a URL",
    );
  });

  test("opens linkedin share url with params", () => {
    const calls: unknown[][] = [];
    (globalThis as any).window = {
      open: (...args: unknown[]) => {
        calls.push(args);
      },
    };

    shareToLinkedIn({
      url: "https://example.com",
      title: "Title",
      summary: "Summary",
      source: "Source",
    });

    const params = new URLSearchParams({ url: "https://example.com" });
    params.append("title", "Title");
    params.append("summary", "Summary");
    params.append("source", "Source");

    expect(calls[0]).toEqual([
      `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`,
      "_blank",
      "noopener,noreferrer",
    ]);
  });
});
