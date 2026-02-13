import { afterEach, describe, expect, test } from "bun:test";
import { shareToX } from "./post-to-x";

describe("shareToX", () => {
  const originalWindow = (globalThis as any).window;

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  test("throws when text is missing", () => {
    expect(() => shareToX({ text: "" })).toThrow(
      "X share requires text content",
    );
  });

  test("opens x intent url with params", () => {
    const calls: unknown[][] = [];
    (globalThis as any).window = {
      open: (...args: unknown[]) => {
        calls.push(args);
      },
    };

    shareToX({
      text: "Hello",
      url: "https://example.com",
      hashtags: "coffee,shop",
      via: "hobenaki",
      related: "friend1,friend2",
    });

    const params = new URLSearchParams({ text: "Hello" });
    params.append("url", "https://example.com");
    params.append("hashtags", "coffee,shop");
    params.append("via", "hobenaki");
    params.append("related", "friend1,friend2");

    expect(calls[0]).toEqual([
      `https://twitter.com/intent/tweet?${params.toString()}`,
      "_blank",
      "noopener,noreferrer",
    ]);
  });
});
