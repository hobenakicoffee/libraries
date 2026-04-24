import { getUserPageLink } from "./get-user-page-link";

export function getProductLink(
  username: string,
  slug: string,
  baseUrl = "https://hobenakicoffee.com"
) {
  const sanitizedSlug = slug.trim().replace(/\s+/g, "-");
  return `${getUserPageLink(username, baseUrl)}/shops/products/${sanitizedSlug}`;
}
