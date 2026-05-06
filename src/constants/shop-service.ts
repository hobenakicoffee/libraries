export const MAX_PRODUCT_PRICE = 9_999_999_999;

export const ShopProductTypes = {
  digital: "digital",
  physical: "physical",
} as const;

export type ShopProductType =
  (typeof ShopProductTypes)[keyof typeof ShopProductTypes];

export const ShopApprovalStatuses = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
} as const;

export type ShopApprovalStatus =
  (typeof ShopApprovalStatuses)[keyof typeof ShopApprovalStatuses];
