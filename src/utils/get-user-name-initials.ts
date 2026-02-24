const regexPattern = /\s+/;

export function getInitials(name?: string | null) {
  const parts = name?.trim().split(regexPattern).filter(Boolean) ?? [];
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}
