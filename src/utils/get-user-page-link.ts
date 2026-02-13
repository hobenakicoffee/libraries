export function getUserPageLink(username: string) {
  const sanitizedUsername = encodeURIComponent(
    username.trim().replace(/\s+/g, ""),
  );
  return `https://hobenakicoffee.com/@${sanitizedUsername}`;
}
