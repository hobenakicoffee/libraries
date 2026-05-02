export const MAX_PRODUCT_PRICE = 9_999_999_999;

export const ShopProductTypes = {
  digital: "digital",
  physical: "physical",
} as const;

export type ShopProductType =
  (typeof ShopProductTypes)[keyof typeof ShopProductTypes];
