import { SupporterPlatforms, type SupporterPlatform } from "../constants";

export function getSocialLink(username?: string, platform?: SupporterPlatform) {
  console.log("getSocialLink called with:", { username, platform });
  if (!username || !platform) return null;

  const sanitizedUsername = encodeURIComponent(
    username.trim().replace(/\s+/g, ""),
  );

  switch (platform) {
    case SupporterPlatforms.FACEBOOK:
      return `https://facebook.com/${sanitizedUsername}`;
    case SupporterPlatforms.INSTAGRAM:
      return `https://instagram.com/${sanitizedUsername}`;
    case SupporterPlatforms.TIKTOK:
      return `https://tiktok.com/@${sanitizedUsername}`;
    case SupporterPlatforms.YOUTUBE:
      return `https://youtube.com/${sanitizedUsername}`;
    case SupporterPlatforms.X:
      return `https://x.com/${sanitizedUsername}`;
    case SupporterPlatforms.LINKEDIN:
      return `https://linkedin.com/in/${sanitizedUsername}`;
    case SupporterPlatforms.GITHUB:
      return `https://github.com/${sanitizedUsername}`;
    default:
      return null;
  }
}
