export const NotificationTypes = {
  GIFT_RECEIVED: "gift.received",
  NEW_FOLLOWER: "follow.new_follower",
  NEW_SUPPORTER: "supporter.new_supporter",
  NEW_MEMBER: "membership.new_member",
  MEMBERSHIP_EXPIRING: "membership.expiring",
  WITHDRAWAL_STATUS_CHANGED: "withdrawal.status_changed",
  PLATFORM_SUBSCRIPTION_EXPIRING: "platform_subscription.expiring",
  PLATFORM_SUBSCRIPTION_ACTIVATED: "platform_subscription.activated",
  KYC_STATUS_CHANGED: "kyc.status_changed",
  NEWSLETTER_POST_STATUS: "newsletter.post_status",
  SHOP_PRODUCT_STATUS: "shop.product_status",
  SHOP_CATEGORY_STATUS: "shop.category_status",
  SHOP_ORDER_SHIPPED: "shop.order_shipped",
  SHOP_ORDER_DELIVERED: "shop.order_delivered",
  SHOP_ORDER_CANCELLED: "shop.order_cancelled",
} as const;

export type NotificationType =
  (typeof NotificationTypes)[keyof typeof NotificationTypes];

export type NotificationCategory =
  | "earnings"
  | "engagement"
  | "account"
  | "orders";
