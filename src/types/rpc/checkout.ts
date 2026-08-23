import type { Enums, Json } from "../supabase";
import type { CouponValidateResult, ShopActiveEligibility } from "./primitives";

export type CheckoutDownloadToken = {
  file_name: string;
  token: string;
};

export type OrderPaymentSummary = {
  subtotal: number;
  shipping_total: number;
  gift_wrap_fee: number;
  billing_address: Json;
};

export type CartLine = {
  product_id: string;
  variant_id: string | null;
  product_title: string;
  product_type: Enums<"shop_product_type_enum">;
  variant_label: string | null;
  variant_options: Json | null;
  unit_price: number;
  shipping_cost: number;
  quantity: number;
  unit: string | null;
  platform_fee_rate: number;
  cover_media_url: string | null;
  processing_min_days: number | null;
  processing_max_days: number | null;
};

export type CartCalculationSuccess = {
  success: true;
  seller_profile_id: string;
  has_digital: boolean;
  has_physical: boolean;
  subtotal: number;
  shipping_total: number;
  gift_wrap_fee: number;
  bundle_discount: number;
  coupon_id: string | null;
  coupon_code: string | null;
  coupon_discount: number;
  total: number;
  platform_fee: number;
  platform_fee_rate: number | null;
  seller_net: number;
  digital_amount: number;
  physical_amount: number;
  items: CartLine[];
};

type CouponErrorBranch = Extract<CouponValidateResult, { success: false }>;

export type CartCalculationError =
  | { success: false; error: "EMPTY_CART" }
  | { success: false; error: "INVALID_QUANTITY" }
  | { success: false; error: "PRODUCT_NOT_FOUND"; product_id: string }
  | {
      success: false;
      error: "BELOW_MIN_ORDER_QUANTITY";
      product_id: string;
      min_order_quantity: number;
    }
  | { success: false; error: "MIXED_SELLERS" }
  | { success: false; error: "CANNOT_BUY_OWN_PRODUCT" }
  | { success: false; error: "GUEST_DIGITAL_NOT_ALLOWED"; product_id: string }
  | {
      success: false;
      error: "COD_NOT_ALLOWED_FOR_DIGITAL";
      product_id?: string;
    }
  | { success: false; error: "MIXED_COD_AND_NON_COD"; product_id: string }
  | { success: false; error: "VARIANT_NOT_FOUND" }
  | {
      success: false;
      error: "INSUFFICIENT_STOCK";
      product_id: string;
      available: number;
    }
  | { success: false; error: "GIFT_NOT_AVAILABLE" }
  | CouponErrorBranch
  | {
      success: false;
      error: "SELLER_COD_BLOCKED";
      eligibility: ShopActiveEligibility;
    }
  | { success: false; error: "SHIPPING_ADDRESS_REQUIRED" }
  | { success: false; error: "COUPON_MIN_ORDER_NOT_MET" }
  | { success: false; error: "COUPON_NO_ELIGIBLE_ITEMS" };

export type ShopCalculateCartResult =
  | CartCalculationSuccess
  | CartCalculationError;

export type EstimateShopCheckoutResult =
  | { success: false; error: "ADDRESS_NOT_FOUND" | "INVALID_GEO_LOCATION" }
  | (ShopCalculateCartResult & {
      area_type: "inside_dhaka" | "outside_dhaka" | null;
    });

export type InitiateShopCheckoutSuccess = {
  success: true;
  id: string;
  order_number: string;
  payment_method: Enums<"shop_payment_method_enum">;
  is_guest: boolean;
  gateway_email: string | null;
  subtotal: number;
  shipping_total: number;
  gift_wrap_fee: number;
  bundle_discount: number;
  coupon_id: string | null;
  coupon_code: string | null;
  coupon_discount: number;
  total: number;
  platform_fee: number;
  seller_net: number;
};

export type InitiateShopCheckoutError =
  | CartCalculationError
  | {
      success: false;
      error:
        | "UNAUTHORIZED"
        | "MISSING_GUEST_INFO"
        | "INVALID_GUEST_EMAIL"
        | "INVALID_GIFT_RECIPIENT"
        | "ADDRESS_NOT_FOUND"
        | "INVALID_GEO_LOCATION"
        | "BILLING_ADDRESS_REQUIRED";
    };

export type InitiateShopCheckoutResult =
  | InitiateShopCheckoutSuccess
  | InitiateShopCheckoutError;

export type HandleShopPaymentSuccessResult =
  | { success: false; error: "ORDER_NOT_FOUND" | "COD_ORDER_INVALID_PATH" }
  | { success: true; idempotent: true }
  | {
      success: true;
      order_number: string;
      has_digital: boolean;
      has_physical: boolean;
      download_tokens: CheckoutDownloadToken[];
      buyer_profile_id: string | null;
      seller_profile_id: string;
    };

export type GetShopOrderForPaymentResult =
  | {
      success: false;
      error:
        | "ORDER_NOT_FOUND"
        | "NOT_ORDER_OWNER"
        | "COD_ORDER_INVALID_PATH"
        | "ALREADY_PAID";
    }
  | ({ success: true } & OrderPaymentSummary);

export type RedeemShopDownloadTokenResult =
  | {
      success: false;
      error:
        | "INVALID_TOKEN"
        | "TOKEN_EXPIRED"
        | "DOWNLOAD_LIMIT_REACHED"
        | "FILE_NOT_FOUND";
    }
  | { success: true; storage_path: string };

export type CheckoutOverrides = {
  shop_calculate_cart: ShopCalculateCartResult;
  estimate_shop_checkout: EstimateShopCheckoutResult;
  initiate_shop_checkout: InitiateShopCheckoutResult;
  handle_shop_payment_success: HandleShopPaymentSuccessResult;
  get_shop_order_for_payment: GetShopOrderForPaymentResult;
  redeem_shop_download_token: RedeemShopDownloadTokenResult;
};
