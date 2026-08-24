import { expect, test } from "bun:test";

import type {
  ActivityMetadata,
  ActivityType,
  Database,
  RpcOverrides,
} from "./index";

type Assert<T extends true> = T;

test("shop draft activity metadata exposes shop review context", () => {
  const activityType: ActivityType = "shop_draft_rejected";
  const metadata: ActivityMetadata = {
    activity_type: activityType,
    draft_type: "featured_banners",
    shop_id: "00000000-0000-0000-0000-000000000001",
    shop_name: "Coffee House",
    rejection_reason: "Banner text is unreadable",
  };

  expect(metadata).toEqual({
    activity_type: "shop_draft_rejected",
    draft_type: "featured_banners",
    shop_id: "00000000-0000-0000-0000-000000000001",
    shop_name: "Coffee House",
    rejection_reason: "Banner text is unreadable",
  });
});

test("public types retain domain RPC overrides", () => {
  const hasExpectedDomainOverrides: Assert<
    "shop_calculate_cart" extends keyof RpcOverrides
      ? "purchase_newsletter_post" extends keyof RpcOverrides
        ? "process_service_payment" extends keyof RpcOverrides
          ? "custom_access_token_hook" extends keyof RpcOverrides
            ? true
            : false
          : false
        : false
      : false
  > = true;
  const databaseKeepsShopCheckoutOverride: Assert<
    Database["public"]["Functions"]["shop_calculate_cart"]["Returns"] extends RpcOverrides["shop_calculate_cart"]
      ? true
      : false
  > = true;

  expect(hasExpectedDomainOverrides).toBe(true);
  expect(databaseKeepsShopCheckoutOverride).toBe(true);
});
