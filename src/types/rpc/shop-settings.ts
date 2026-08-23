import type { Enums, Json } from "../supabase";
import type { ShopActiveEligibility, ShopProductPricing } from "./primitives";

type PolicyType = Enums<"shop_policy_type_enum">;
type ProductType = Enums<"shop_product_type_enum">;
type PaymentMethod = Enums<"shop_payment_method_enum">;

export type ShopActivationChecklist = {
  steps: {
    shop_name_customized: boolean;
    logo_uploaded: boolean;
    banner_uploaded: boolean;
    category_added: boolean;
    product_added: boolean;
    product_live: boolean;
  };
  counts: {
    categories: number;
    products: number;
    live_products: number;
  };
  all_done: boolean;
};

export type GetShopActivationChecklistResult =
  | { success: true; checklist: ShopActivationChecklist }
  | { success: false; error: "UNAUTHENTICATED" };

export type ShopReviewStatusCounts = {
  categories_pending: number;
  categories_rejected: number;
  products_pending: number;
  products_rejected: number;
};

export type ShopReviewAttentionItem =
  | {
      type: "category";
      id: string;
      name: string;
      rejection_reason: string | null;
    }
  | {
      type: "product";
      id: string;
      title: string;
      rejection_reason: string | null;
    }
  | {
      type: "featured_banners";
      rejection_reason: string | null;
    };

export type ShopReviewPendingItem =
  | { type: "category"; id: string; name: string }
  | { type: "product"; id: string; title: string }
  | { type: "featured_banners" }
  | { type: "activation" };

export type GetShopReviewStatusResult =
  | {
      success: true;
      overall_status: "attention_needed" | "in_review" | "clear";
      counts: ShopReviewStatusCounts;
      needs_attention: ShopReviewAttentionItem[];
      in_review: ShopReviewPendingItem[];
    }
  | { success: false; error: "UNAUTHENTICATED" };

export type CheckShopActiveEligibilityResult = ShopActiveEligibility;

export type UpsertShopSettingsResult =
  | { success: true; shop_id: string }
  | { success: false; error: "UNAUTHENTICATED" | "INVALID_PROCESSING_WINDOW" }
  | {
      success: false;
      error: "SHOP_INELIGIBLE";
      eligibility: ShopActiveEligibility;
    };

export type UpsertShopFeaturedBannersResult =
  | { success: true }
  | {
      success: false;
      error:
        | "UNAUTHENTICATED"
        | "INVALID_FEATURED_BANNERS"
        | "TOO_MANY_FEATURED_BANNERS";
    };

export type ApproveShopDraftResult =
  | { success: true }
  | { success: false; error: "UNAUTHORIZED" | "NOT_FOUND" };

export type RejectShopDraftResult =
  | { success: true }
  | {
      success: false;
      error: "UNAUTHORIZED" | "MISSING_REJECTION_REASON" | "NOT_FOUND";
    };

export type SetShopActiveByManagerResult =
  | { success: true }
  | { success: false; error: "UNAUTHORIZED" | "NOT_FOUND" };

export type UpsertShopPolicyResult =
  | { success: true; policy_id: string }
  | { success: false; error: "UNAUTHENTICATED" | "MISSING_CONTENT" };

export type DeleteShopPolicyResult = { success: true };

export type ShopPolicyRow = {
  policy_type: PolicyType;
  content: string;
  is_enabled: boolean;
  updated_at: string;
};

export type GetShopPoliciesResult =
  | { success: true; policies: ShopPolicyRow[] }
  | { success: false; error: "PROFILE_NOT_FOUND" };

export type UpsertShopCouponResult =
  | { success: true; id: string; code: string }
  | {
      success: false;
      error:
        | "INVALID_CODE"
        | "PRODUCTS_REQUIRED"
        | "PRODUCT_NOT_FOUND"
        | "COUPON_NOT_FOUND"
        | "COUPON_CODE_TAKEN";
    };

export type DeleteShopCouponResult =
  | { success: true }
  | { success: false; error: "COUPON_NOT_FOUND" | "COUPON_ALREADY_USED" };

export type ToggleShopFavoriteResult =
  | { success: true; favorited: boolean }
  | { success: false; error: "UNAUTHENTICATED" | "PRODUCT_NOT_FOUND" };

export type ShopFavoriteCard = ShopProductPricing & {
  product_id: string;
  slug: string;
  title: string;
  cover_media_url: string | null;
  shop_name: string;
  shop_logo_url: string | null;
  rating_avg: number | null;
  rating_count: number;
  favorited_at: string;
};

export type GetMyShopFavoritesResult =
  | { success: true; favorites: ShopFavoriteCard[]; has_more: boolean }
  | { success: false; error: "UNAUTHENTICATED" };

export type ShopProductPricingResult = ShopProductPricing;

export type SetShopProductsSaleResult =
  | { success: true; product_ids: string[] }
  | {
      success: false;
      error:
        | "UNAUTHENTICATED"
        | "NO_PRODUCTS"
        | "NOT_FOUND"
        | "INVALID_DISCOUNT_PERCENT"
        | "SALE_WINDOW_REQUIRED"
        | "INVALID_SALE_WINDOW";
    };

export type ShopRevenueSparklinePoint = {
  day: string;
  value: number;
};

export type ShopOverviewRevenueBlock = {
  all_time: number;
  last_30_days: number;
  prev_30_days: number;
  sparkline: ShopRevenueSparklinePoint[];
};

export type ShopOverviewOrdersBlock = {
  all_time: number;
  last_30_days: number;
  prev_30_days: number;
};

export type ShopOverviewProductsBlock = {
  published: number;
  last_30_days: number;
  prev_30_days: number;
};

export type ShopOverviewTopSellingCard = {
  id: string;
  title: string;
  cover_media_url: string | null;
  product_type: ProductType;
  price: number;
  sales_count: number;
};

export type ShopOverviewRecentOrdersStatus =
  | "cancelled"
  | "refunded"
  | "processing"
  | "complete"
  | "partially_shipped";

export type ShopOverviewRecentOrdersCard = {
  order_number: string;
  created_at: string;
  item_count: number;
  subtotal: number;
  shipping_total: number;
  seller_net: number;
  payment_method: PaymentMethod;
  status: ShopOverviewRecentOrdersStatus;
};

export type GetShopOverviewResult =
  | {
      success: true;
      revenue: ShopOverviewRevenueBlock;
      orders: ShopOverviewOrdersBlock;
      products: ShopOverviewProductsBlock;
      pending_count: number;
      pending_last_30: number;
      pending_prev_30: number;
      cash_pending_count: number;
      top_selling: ShopOverviewTopSellingCard[];
      recent_orders: ShopOverviewRecentOrdersCard[];
      eligibility: ShopActiveEligibility;
    }
  | { success: false; error: "UNAUTHENTICATED" };

export type GetShopStatsResult = {
  success: true;
  total_views: number;
  total_sales: number;
  total_earnings: number;
  total_products: number;
};

export type AutoDeactivateIneligibleShopsResult = {
  success: true;
  shops_deactivated: number;
  ran_at: string;
};

export type CollectOrphanedShopStorageResult = {
  bucket: "shop-media" | "shop-product-files";
  paths: string[];
  finalize: Json;
};

export type ShopSettingsOverrides = {
  check_shop_active_eligibility: CheckShopActiveEligibilityResult;
  compute_shop_activation_checklist: ShopActivationChecklist;
  get_shop_activation_checklist: GetShopActivationChecklistResult;
  get_shop_review_status: GetShopReviewStatusResult;
  upsert_shop_settings: UpsertShopSettingsResult;
  upsert_shop_featured_banners: UpsertShopFeaturedBannersResult;
  approve_shop_draft: ApproveShopDraftResult;
  reject_shop_draft: RejectShopDraftResult;
  set_shop_active_by_manager: SetShopActiveByManagerResult;
  upsert_shop_policy: UpsertShopPolicyResult;
  delete_shop_policy: DeleteShopPolicyResult;
  get_shop_policies: GetShopPoliciesResult;
  upsert_shop_coupon: UpsertShopCouponResult;
  delete_shop_coupon: DeleteShopCouponResult;
  toggle_shop_favorite: ToggleShopFavoriteResult;
  get_my_shop_favorites: GetMyShopFavoritesResult;
  shop_product_pricing: ShopProductPricingResult;
  set_shop_products_sale: SetShopProductsSaleResult;
  get_shop_overview: GetShopOverviewResult;
  get_shop_stats: GetShopStatsResult;
  auto_deactivate_ineligible_shops: AutoDeactivateIneligibleShopsResult;
  collect_orphaned_shop_storage: CollectOrphanedShopStorageResult;
};
