export const MAX_PRODUCT_PRICE = 9_999_999_999;

export const ShopProductType = {
  digital: "digital",
  physical: "physical",
} as const;

export type ShopProductType =
  (typeof ShopProductType)[keyof typeof ShopProductType];
