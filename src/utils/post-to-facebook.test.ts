import { afterEach, describe, expect, test } from "bun:test";
import { shareToFacebook } from "./post-to-facebook";

describe("shareToFacebook", () => {
  const originalWindow = (globalThis as any).window;

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  test("throws when url is missing", () => {
    expect(() => shareToFacebook({ url: "" })).toThrow(
      "Facebook share requires a URL"
    );
  });

  test("opens facebook share url with params", () => {
    const calls: unknown[][] = [];
    (globalThis as any).window = {
      open: (...args: unknown[]) => {
        calls.push(args);
      },
    };

    shareToFacebook({
      url: "https://example.com",
      quote: "Hello",
      hashtag: "#coffee",
      ref: "campaign",
    });

    const params = new URLSearchParams({ u: "https://example.com" });
    params.append("quote", "Hello");
    params.append("hashtag", "#coffee");
    params.append("ref", "campaign");

    expect(calls[0]).toEqual([
      `https://www.facebook.com/sharer/sharer.php?${params.toString()}`,
      "_blank",
      "noopener,noreferrer",
    ]);
  });
});
