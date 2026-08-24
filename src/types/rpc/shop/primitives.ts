import type { Enums } from "../../supabase";

export type ShopProductPricing = {
  is_on_sale: boolean;
  effective_price: number;
  strikethrough_price: number | null;
  discount_percent: number | null;
  sale_ends_at: string | null;
};

export type ShopEligibilityReason = "wallet_below_floor" | "cod_aging";

export type ShopActiveEligibility = {
  eligible: boolean;
  reasons: ShopEligibilityReason[];
  wallet_balance: number;
  cod_debt: number;
  wallet_floor: number;
  aged_cod_orders: number;
  settlement_max_days: number;
};

export type CouponErrorCode =
  | "COUPON_NOT_FOUND"
  | "COUPON_NOT_YET_ACTIVE"
  | "COUPON_EXPIRED"
  | "COUPON_LIMIT_REACHED"
  | "COUPON_MIN_ORDER_NOT_MET"
  | "COUPON_FIRST_TIME_ONLY";

export type CouponValidateOk = {
  success: true;
  id: string;
  code: string;
  discount_type: Enums<"coupon_discount_type_enum">;
  discount_value: number;
  applies_to: Enums<"coupon_applies_to_enum">;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  max_redemptions: number | null;
  max_redemptions_per_buyer: number;
  redemption_count: number;
};

export type CouponValidateResult =
  | CouponValidateOk
  | { success: false; error: CouponErrorCode };
