import { afterEach, describe, expect, mock, test } from "bun:test";

mock.module("sonner", () => ({
  toast: {
    success: () => undefined,
    error: () => undefined,
  },
}));

describe("downloadQrSvgAsPng", () => {
  const originalImage = (globalThis as any).Image;

  afterEach(() => {
    (globalThis as any).Image = originalImage;
  });

  test("calls onError when image loading fails", async () => {
    class BrokenImage {
      public onload: (() => void) | null = null;
      public onerror: (() => void) | null = null;
      public decoding = "async";

      set src(_value: string) {
        this.onerror?.();
      }
    }

    (globalThis as any).Image = BrokenImage;

    const { downloadQrSvgAsPng } = await import("./qr-svg-utils");

    let failed = false;
    await downloadQrSvgAsPng("<svg></svg>", "test.png", undefined, () => {
      failed = true;
    });

    expect(failed).toBe(true);
  });
});

describe("printQrSvg", () => {
  const originalDocument = (globalThis as any).document;
  const originalDOMParser = (globalThis as any).DOMParser;

  afterEach(() => {
    (globalThis as any).document = originalDocument;
    (globalThis as any).DOMParser = originalDOMParser;
  });

  test("calls onError for invalid SVG markup", async () => {
    const createNode = () => ({
      style: {},
      textContent: "",
      setAttribute: () => undefined,
      append: () => undefined,
      appendChild: () => undefined,
    });

    const iframeDocument = {
      documentElement: {},
      createElement: () => createNode(),
      replaceChild: () => undefined,
    };

    const iframe = {
      style: {},
      contentWindow: {
        document: iframeDocument,
        addEventListener: () => undefined,
        focus: () => undefined,
        print: () => undefined,
      },
      setAttribute: () => undefined,
      remove: () => undefined,
    };

    (globalThis as any).document = {
      createElement: (tagName: string) =>
        tagName === "iframe" ? iframe : createNode(),
      body: {
        append: () => undefined,
      },
    };

    (globalThis as any).DOMParser = class {
      parseFromString() {
        return {
          documentElement: {
            nodeName: "parsererror",
          },
        };
      }
    };

    const { printQrSvg } = await import("./qr-svg-utils");

    let failed = false;
    printQrSvg("<svg", "QR Print", () => {
      failed = true;
    });

    expect(failed).toBe(true);
  });
});
