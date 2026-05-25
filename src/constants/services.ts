export const ServiceTypes = {
  GIFT: "gift",
  DIGITAL_CONTENT: "digital-content",
  MY_SHOP: "shop",
  CONSULTANCY_1ON1: "consultancy",
  HIRE_ME: "hire",
  COURSES: "courses",
  LIVE_STREAMS: "live-streaming",
  NEWSLETTER: "newsletter",
  WITHDRAWAL: "withdrawal",
  FOLLOW: "follow",
} as const;

export type ServiceType = (typeof ServiceTypes)[keyof typeof ServiceTypes];

export type ServiceCategory =
  | "monetization"
  | "content"
  | "engagement"
  | "service"
  | "community";
