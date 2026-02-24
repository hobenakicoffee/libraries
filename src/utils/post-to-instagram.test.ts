import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

mock.module("sonner", () => ({
  toast: {
    success: () => undefined,
    error: () => undefined,
  },
}));

describe("shareToInstagram", () => {
  const originalNavigator = (globalThis as any).navigator;
  const originalWindow = (globalThis as any).window;

  beforeEach(() => {
    (globalThis as any).window = {
      open: () => undefined,
    };
  });

  afterEach(() => {
    (globalThis as any).navigator = originalNavigator;
    (globalThis as any).window = originalWindow;
  });

  test("throws when url is missing", async () => {
    const { shareToInstagram } = await import("./post-to-instagram");

    expect(() => shareToInstagram({ url: "" })).toThrow(
      "Instagram share requires a URL"
    );
  });

  test("uses Web Share API when available", async () => {
    const shareCalls: unknown[] = [];

    (globalThis as any).navigator = {
      share: (payload: unknown) => {
        shareCalls.push(payload);
        return Promise.resolve();
      },
      clipboard: {
        writeText: () => Promise.resolve(),
      },
    };

    const { shareToInstagram } = await import("./post-to-instagram");

    shareToInstagram({ url: "https://example.com", text: "Look" });

    expect(shareCalls).toHaveLength(1);
    expect(shareCalls[0]).toEqual({
      title: "Look",
      url: "https://example.com",
    });
  });
});
