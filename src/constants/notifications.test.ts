import { describe, expect, test } from "bun:test";
import type { NotificationType } from "./notifications";
import { NotificationTypes } from "./notifications";

describe("NotificationTypes", () => {
  test("should contain all expected notification type keys", () => {
    const expectedKeys = [
      "GIFT_RECEIVED",
      "NEW_FOLLOWER",
      "NEW_SUPPORTER",
      "NEW_MEMBER",
      "MEMBERSHIP_EXPIRING",
      "WITHDRAWAL_STATUS_CHANGED",
      "PLATFORM_SUBSCRIPTION_EXPIRING",
      "KYC_STATUS_CHANGED",
    ];
    expect(Object.keys(NotificationTypes)).toEqual(expectedKeys);
  });

  test("should have correct values matching notification_types seed keys", () => {
    expect(NotificationTypes.GIFT_RECEIVED).toBe("gift.received");
    expect(NotificationTypes.NEW_FOLLOWER).toBe("follow.new_follower");
    expect(NotificationTypes.NEW_SUPPORTER).toBe("supporter.new_supporter");
    expect(NotificationTypes.NEW_MEMBER).toBe("membership.new_member");
    expect(NotificationTypes.MEMBERSHIP_EXPIRING).toBe("membership.expiring");
    expect(NotificationTypes.WITHDRAWAL_STATUS_CHANGED).toBe(
      "withdrawal.status_changed"
    );
    expect(NotificationTypes.PLATFORM_SUBSCRIPTION_EXPIRING).toBe(
      "platform_subscription.expiring"
    );
    expect(NotificationTypes.KYC_STATUS_CHANGED).toBe("kyc.status_changed");
  });

  test("NotificationType type should accept valid notification type values", () => {
    const validType: NotificationType = "gift.received";
    expect(validType).toBe("gift.received");
  });

  test("should have 8 notification types", () => {
    expect(Object.keys(NotificationTypes).length).toBe(8);
  });

  test("all values should be dot-separated lowercase snake_case strings", () => {
    for (const type of Object.values(NotificationTypes)) {
      expect(typeof type).toBe("string");
      expect(type).toMatch(/^[a-z0-9_]+\.[a-z0-9_]+$/);
    }
  });
});
