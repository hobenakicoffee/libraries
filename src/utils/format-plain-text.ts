const CAPITALIZE_REGEX = /([A-Z])/g;
const SPACE_REPLACE_REGEX = /_/g;
const FIRST_LETTER_REGEX = /^\w/;

export function formatToPlainText(
  value: unknown,
  options?: {
    formatBooleans?: boolean;
    preserveNumbers?: boolean;
    maxStringLength?: number;
  }
): string {
  const formatBooleans = options?.formatBooleans ?? true;
  const preserveNumbers = options?.preserveNumbers ?? true;
  const maxStringLength = options?.maxStringLength ?? 100;

  // Handle null/undefined values
  if (value === null || value === undefined) {
    return "";
  }

  // Format based on type
  switch (typeof value) {
    case "boolean":
      return formatBooleans ? (value ? "Yes" : "No") : String(value);

    case "number":
      return preserveNumbers ? value.toString() : value.toString();

    case "string": {
      const stringValue = value as string;
      return maxStringLength && stringValue.length > maxStringLength
        ? `${stringValue.substring(0, maxStringLength - 3)}...`
        : stringValue;
    }

    case "object":
      if (Array.isArray(value)) {
        return JSON.stringify(value, null, 2);
      }
      return JSON.stringify(value, null, 2);

    default:
      return String(value);
  }
}

function capitalizeKey(keyToFormat: string): string {
  return keyToFormat
    .replace(CAPITALIZE_REGEX, " $1") // "supporterName" → "supporter Name"
    .replace(SPACE_REPLACE_REGEX, " ") // "is_monthly" → "is monthly"
    .replace(FIRST_LETTER_REGEX, (c) => c.toUpperCase()) // "supporter" → "Supporter"
    .trim();
}

export function formatMetadataKey(key: string): string {
  return capitalizeKey(key);
}
