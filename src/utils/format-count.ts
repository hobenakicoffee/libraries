import { formatNumber } from "./format-number";

export function formatCount(n: number) {
  if (n >= 1000) {
    const formatted = n / 1000;
    return Number.isInteger(formatted)
      ? `${formatted}k`
      : `${formatted.toFixed(1)}k`;
  }
  return formatNumber(n);
}
