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

export const ShopPolicyTypes = {
  return_refund: "return_refund",
  digital_products: "digital_products",
  shipping: "shipping",
  privacy: "privacy",
  terms_of_service: "terms_of_service",
} as const;

export type ShopPolicyType =
  (typeof ShopPolicyTypes)[keyof typeof ShopPolicyTypes];
