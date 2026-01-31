export const SupporterPlatforms = {
  FACEBOOK: "facebook",
  X: "x",
  INSTAGRAM: "instagram",
  YOUTUBE: "youtube",
  GITHUB: "github",
  LINKEDIN: "linkedin",
  TWITCH: "twitch",
  TIKTOK: "tiktok",
  THREADS: "threads",
  WHATSAPP: "whatsapp",
  TELEGRAM: "telegram",
  DISCORD: "discord",
  REDDIT: "reddit",
  PINTEREST: "pinterest",
  MEDIUM: "medium",
  DEVTO: "devto",
  BEHANCE: "behance",
  DRIBBBLE: "dribbble",
} as const;

export type SupporterPlatform =
  (typeof SupporterPlatforms)[keyof typeof SupporterPlatforms];
