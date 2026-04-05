export function getNewsletterPostLink(
  username: string,
  slug: string,
  baseUrl?: string
) {
  return baseUrl
    ? `${baseUrl}/@${username}/posts/${slug}`
    : `/@${username}/posts/${slug}`;
}
