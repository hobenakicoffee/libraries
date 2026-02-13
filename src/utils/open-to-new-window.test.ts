import { afterEach, describe, expect, test } from "bun:test";
import { openInNewWindow } from "./open-to-new-window";

describe("openInNewWindow", () => {
  const originalWindow = (globalThis as any).window;

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  test("opens url in a new tab", () => {
    const calls: unknown[][] = [];
    (globalThis as any).window = {
      open: (...args: unknown[]) => {
        calls.push(args);
      },
    };

    openInNewWindow("https://example.com");

    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual([
      "https://example.com",
      "_blank",
      "noopener,noreferrer",
    ]);
  });

  test("does nothing when window is undefined", () => {
    (globalThis as any).window = undefined;

    expect(() => openInNewWindow("https://example.com")).not.toThrow();
  });
});
