export const ServiceTypes = {
  GIFT: "gift",
  EXCLUSIVE_CONTENT: "exclusive_content",
  WITHDRAWAL: "withdrawal",
  FOLLOW: "follow",
} as const;

export type ServiceType = (typeof ServiceTypes)[keyof typeof ServiceTypes];
