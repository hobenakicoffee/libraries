export function formatCount(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  const format = (divisor: number, suffix: string) => {
    const val = abs / divisor;
    // Show one decimal only if it's meaningful (e.g. 1.2k), not for whole numbers or large values
    const formatted =
      val >= 100 || Number.isInteger(val) ? Math.round(val) : val.toFixed(1);
    return `${sign}${formatted}${suffix}`;
  };

  if (abs >= 1_000_000_000) return format(1_000_000_000, "B");
  if (abs >= 1_000_000) return format(1_000_000, "M");
  if (abs >= 1000) return format(1000, "k");

  return `${sign}${abs}`;
}
