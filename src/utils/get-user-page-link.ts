export function getUserPageLink(
  username: string,
  baseUrl = "https://hobenakicoffee.com"
) {
  const sanitizedUsername = encodeURIComponent(
    username.trim().replace(/\s+/g, "")
  );
  return `${baseUrl}/@${sanitizedUsername}`;
}
