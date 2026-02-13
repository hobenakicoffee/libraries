import type { SupporterPlatform } from "@hobenakicoffee/libraries";
import { getUserPageLink } from "./get-user-page-link";

const patternsToRemove = /^@/;

const sanitizeHandle = (value: string) =>
  encodeURIComponent(
    value.trim().replace(patternsToRemove, "").replace(/\s+/g, "")
  );

export const getSocialUrl = (
  ourPlatformUsername?: string | null,
  platform?: SupporterPlatform | null,
  supporterName?: string | null
) => {
  if (ourPlatformUsername) {
    return getUserPageLink(ourPlatformUsername);
  }

  if (!(platform && supporterName?.trim())) {
    return "#";
  }

  const handle = sanitizeHandle(supporterName);

  switch (platform) {
    case "facebook":
      return `https://facebook.com/${handle}`;
    case "x":
      return `https://x.com/${handle}`;
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "youtube":
      return `https://youtube.com/@${handle}`;
    case "github":
      return `https://github.com/${handle}`;
    case "linkedin":
      return `https://www.linkedin.com/in/${handle}`;
    case "twitch":
      return `https://twitch.tv/${handle}`;
    case "tiktok":
      return `https://www.tiktok.com/@${handle}`;
    case "threads":
      return `https://www.threads.net/@${handle}`;
    case "whatsapp":
      return `https://wa.me/${handle}`;
    case "telegram":
      return `https://t.me/${handle}`;
    case "discord":
      return `https://discord.com/users/${handle}`;
    case "reddit":
      return `https://reddit.com/u/${handle}`;
    case "pinterest":
      return `https://pinterest.com/${handle}`;
    case "medium":
      return `https://medium.com/@${handle}`;
    case "devto":
      return `https://dev.to/${handle}`;
    case "behance":
      return `https://www.behance.net/${handle}`;
    case "dribbble":
      return `https://dribbble.com/${handle}`;
    default:
      return "#";
  }
};
