import { expect, test } from "bun:test";

import type { ActivityMetadata, ActivityType } from "./index";

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
