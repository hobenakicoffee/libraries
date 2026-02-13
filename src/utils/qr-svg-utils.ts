// Utility functions for QR code SVG download and print

import { toast } from "sonner";

/**
 * Downloads a QR code SVG as a PNG file.
 * @param svgMarkup - The SVG markup string
 * @param fileName - The file name for the PNG
 * @param onSuccess - Callback for success
 * @param onError - Callback for error
 */
export async function downloadQrSvgAsPng(
  svgMarkup: string,
  fileName: string,
  onSuccess?: () => void,
  onError?: () => void
): Promise<void> {
  try {
    const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.decoding = "async";

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("QR image failed to load"));
      image.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      URL.revokeObjectURL(svgUrl);
      throw new Error("Canvas context unavailable");
    }

    const exportScale = 8;
    const maxSize = 2400;
    const scaleFromMaxSize = maxSize / image.width;
    const scale = Math.min(exportScale, scaleFromMaxSize);

    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    URL.revokeObjectURL(svgUrl);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("PNG blob generation failed"));
          return;
        }
        resolve(blob);
      }, "image/png");
    });

    const pngUrl = URL.createObjectURL(pngBlob);
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = fileName;
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(pngUrl);
    }, 1000);

    onSuccess?.();
  } catch {
    toast.error("Download failed");
    onError?.();
  }
}

/**
 * Prints a QR code SVG markup.
 * @param svgMarkup - The SVG markup string
 * @param printTitle - The title for the print window
 * @param onError - Callback for error
 */
export function printQrSvg(
  svgMarkup: string,
  printTitle: string,
  onError?: () => void
): void {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", printTitle);
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";

  document.body.append(iframe);

  const cleanup = (): void => {
    iframe.remove();
  };

  const iframeWindow = iframe.contentWindow;
  const iframeDocument = iframeWindow?.document;

  if (!(iframeWindow && iframeDocument)) {
    cleanup();
    onError?.();
    return;
  }

  iframeWindow.addEventListener(
    "afterprint",
    () => {
      cleanup();
    },
    { once: true }
  );

  // Construct document structure using DOM methods
  const html = iframeDocument.createElement("html");
  const head = iframeDocument.createElement("head");
  const body = iframeDocument.createElement("body");

  const meta = iframeDocument.createElement("meta");
  meta.setAttribute("charset", "utf-8");

  const title = iframeDocument.createElement("title");
  title.textContent = printTitle;

  const style = iframeDocument.createElement("style");
  style.textContent = `
    @page { margin: 0; }
    html, body { height: 100%; }
    body {
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
    }
    svg { width: 70vmin; height: 70vmin; }
  `;

  head.append(meta, title, style);
  html.append(head, body);

  // Replace the existing document element
  iframeDocument.replaceChild(html, iframeDocument.documentElement);

  // Safely parse and insert SVG
  try {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgMarkup, "image/svg+xml");
    const svgElement = svgDoc.documentElement;

    if (svgElement.nodeName === "parsererror") {
      throw new Error("Invalid SVG markup");
    }

    body.appendChild(svgElement);
  } catch {
    toast.error("Failed to load QR code for printing");
    cleanup();
    onError?.();
    return;
  }

  try {
    iframeWindow.focus();
    iframeWindow.print();
  } catch {
    toast.error("Printing failed");
    cleanup();
    onError?.();
  }
}
