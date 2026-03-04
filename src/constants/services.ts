export const ServiceTypes = {
  GIFT: "gift",
  DIGITAL_CONTENT: "digital_content",
  MY_SHOP: "my_shop",
  CONSULTANCY_1ON1: "consultancy_1on1",
  HIRE_ME: "hire_me",
  COURSES: "courses",
  LIVE_STREAMS: "live_streams",
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
