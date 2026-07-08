export function formatAmount(value: number) {
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  return `৳${formatted}`;
}

export function formatSignedAmount(
  value: number,
  direction: "debit" | "credit"
) {
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  const sign = direction === "debit" ? "-" : "+";
  return `${sign} ৳${formatted}`;
}
