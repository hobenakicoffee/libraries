export function getUserPageLink(username: string) {
  const sanitizedUsername = encodeURIComponent(
    username.trim().replace(/\s+/g, "")
  );
  return `${import.meta.env.VITE_MARKETING_SITE_URL}/@${sanitizedUsername}`;
}
