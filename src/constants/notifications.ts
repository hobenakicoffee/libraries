export const NotificationTypes = {
  GIFT_RECEIVED: "gift.received",
  NEW_FOLLOWER: "follow.new_follower",
  NEW_SUPPORTER: "supporter.new_supporter",
  NEW_MEMBER: "membership.new_member",
  MEMBERSHIP_EXPIRING: "membership.expiring",
  WITHDRAWAL_STATUS_CHANGED: "withdrawal.status_changed",
  PLATFORM_SUBSCRIPTION_EXPIRING: "platform_subscription.expiring",
  KYC_STATUS_CHANGED: "kyc.status_changed",
} as const;

export type NotificationType =
  (typeof NotificationTypes)[keyof typeof NotificationTypes];

export type NotificationCategory = "earnings" | "engagement" | "account";
