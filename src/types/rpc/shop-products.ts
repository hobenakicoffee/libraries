import type { Enums, Json } from "../supabase";

type ApprovalStatus = Enums<"shop_approval_status_enum">;
type ProductType = Enums<"shop_product_type_enum">;

type VariantOptionValidationErrorCode =
  | "INVALID_OPTIONS"
  | "PRODUCT_HAS_NO_OPTION_AXES"
  | "OPTIONS_DO_NOT_COVER_ALL_AXES"
  | "UNKNOWN_OPTION_AXIS"
  | "INVALID_OPTION_VALUE";

export type UpsertUserAddressResult =
  | { success: true; address_id: string }
  | {
      success: false;
      error:
        | "UNAUTHENTICATED"
        | "INVALID_GEO_LOCATION"
        | "MISSING_REQUIRED_FIELDS"
        | "NOT_FOUND";
    };

export type DeleteUserAddressResult =
  | { success: true }
  | { success: false; error: "NOT_FOUND" };

export type UpsertShopCategoryResult =
  | { success: true; category_id: string }
  | {
      success: false;
      error: "UNAUTHENTICATED" | "MISSING_NAME" | "NOT_FOUND" | "SLUG_CONFLICT";
    };

export type DeleteShopCategoryResult =
  | { success: true }
  | { success: false; error: "NOT_FOUND" };

export type ReorderShopCategoriesResult =
  | { success: true }
  | { success: false; error: "UNAUTHENTICATED" };

export type ApproveShopCategoryResult =
  | { success: true }
  | { success: false; error: "UNAUTHORIZED" | "NOT_FOUND" };

export type RejectShopCategoryResult =
  | { success: true }
  | {
      success: false;
      error: "UNAUTHORIZED" | "REJECTION_REASON_REQUIRED" | "DRAFT_NOT_FOUND";
    };

export type DeleteShopProductResult =
  | { success: true; deleted: "soft" | "hard" }
  | { success: false; error: "NOT_FOUND" };

export type ReorderShopProductsResult =
  | { success: true }
  | { success: false; error: "UNAUTHENTICATED" };

export type EnsureShopProductDraftResult =
  | { success: true; draft_id: string; status: ApprovalStatus; created: false }
  | { success: true; draft_id: string; status: "draft"; created: true }
  | { success: false; error: "UNAUTHENTICATED" | "NOT_FOUND" };

export type ShopProductDraftDetail = {
  id: string;
  product_id: string;
  profile_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  cover_media_url: string | null;
  media: string[];
  video_url: string | null;
  sku: string | null;
  unit: string;
  min_order_quantity: number;
  allow_backorder: boolean;
  price: number;
  compare_at_price: number | null;
  option_definitions: Json;
  weight_grams: number | null;
  shipping_fee_inside_dhaka: number;
  shipping_fee_outside_dhaka: number;
  processing_min_days: number | null;
  processing_max_days: number | null;
  requires_shipping: boolean;
  cod_enabled: boolean;
  max_downloads: number;
  download_expires_hours: number;
  stock_count: number | null;
  low_stock_threshold: number;
  return_window_days: number | null;
  warranty_days: number | null;
  is_featured: boolean;
  sort_order: number;
  tags: string[];
  approval_status: ApprovalStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type ShopProductDraftLiveInfo = {
  product_type: ProductType;
  is_active: boolean;
  rating_avg: number | null;
  rating_count: number;
  sales_count: number;
};

export type ShopProductDraftCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ShopProductDraftVariantItem = {
  id: number;
  source_variant_id: string | null;
  options: Json;
  price_adjustment: number;
  stock_count: number | null;
  sku: string | null;
  media_url: string | null;
  sort_order: number;
};

export type ShopProductDraftFileItem = {
  id: number;
  source_file_id: string | null;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  sort_order: number;
  created_at: string;
};

export type GetShopProductDraftResult =
  | {
      success: true;
      draft: ShopProductDraftDetail;
      live: ShopProductDraftLiveInfo;
      category: ShopProductDraftCategory | null;
      variants: ShopProductDraftVariantItem[];
      files: ShopProductDraftFileItem[];
    }
  | { success: false; error: "DRAFT_NOT_FOUND" };

export type DiscardShopProductDraftResult =
  | { success: true; staged_storage_paths: string[] }
  | {
      success: false;
      error: "UNAUTHENTICATED" | "DRAFT_NOT_FOUND" | "DRAFT_NOT_DISCARDABLE";
    };

export type UnpublishShopProductResult =
  | { success: true; changed: boolean }
  | { success: false; error: "UNAUTHENTICATED" | "NOT_FOUND" };

export type UpsertShopProductResult =
  | { success: true; product_id: string }
  | {
      success: false;
      error:
        | "UNAUTHENTICATED"
        | "INVALID_OPTION_DEFINITIONS"
        | "TOO_MANY_OPTION_AXES"
        | "MISSING_REQUIRED_FIELDS"
        | "INVALID_SLUG"
        | "COD_ONLY_FOR_PHYSICAL"
        | "NOT_FOUND"
        | "PRODUCT_TYPE_IMMUTABLE"
        | "SLUG_CONFLICT";
    }
  | {
      success: false;
      error: "DRAFT_NOT_EDITABLE";
      status: ApprovalStatus;
    };

export type SubmitShopProductForReviewResult =
  | { success: true }
  | {
      success: false;
      error:
        | "UNAUTHENTICATED"
        | "DRAFT_NOT_FOUND"
        | "ALREADY_PENDING"
        | "DRAFT_NOT_SUBMITTABLE";
    }
  | {
      success: false;
      error: "INVALID_VARIANT_DRAFT";
      draft_variant_id: number;
      detail: VariantOptionValidationErrorCode;
    };

export type ApproveShopProductResult =
  | { success: true }
  | { success: true; already_active: true }
  | {
      success: false;
      error:
        | "UNAUTHORIZED"
        | "NOT_FOUND"
        | "DRAFT_NOT_FOUND"
        | "INVALID_VARIANT_DRAFT";
    }
  | {
      success: false;
      error: "DRAFT_NOT_PENDING";
      status: ApprovalStatus;
    };

export type RejectShopProductResult =
  | { success: true }
  | {
      success: false;
      error: "UNAUTHORIZED" | "REJECTION_REASON_REQUIRED" | "DRAFT_NOT_FOUND";
    }
  | {
      success: false;
      error: "DRAFT_NOT_PENDING";
      status: ApprovalStatus;
    };

export type UpsertShopProductVariantDraftResult =
  | { success: true; draft_variant_id: number }
  | {
      success: false;
      error:
        | "UNAUTHENTICATED"
        | "MISSING_REQUIRED_FIELDS"
        | "NOT_FOUND"
        | "OPTIONS_IMMUTABLE"
        | VariantOptionValidationErrorCode
        | "VARIANT_COMBINATION_CONFLICT";
    }
  | {
      success: false;
      error: "DRAFT_NOT_EDITABLE";
      status: ApprovalStatus;
    };

export type DeleteShopProductVariantDraftResult =
  | { success: true }
  | {
      success: false;
      error: "NOT_FOUND" | "DRAFT_NOT_EDITABLE";
    };

export type AddShopProductFileDraftResult =
  | { success: true; draft_file_id: number }
  | {
      success: false;
      error:
        | "UNAUTHENTICATED"
        | "MISSING_REQUIRED_FIELDS"
        | "NOT_FOUND_OR_NOT_DIGITAL"
        | "DRAFT_NOT_EDITABLE"
        | "STORAGE_PATH_CONFLICT";
    };

export type UpdateShopProductFileDraftResult =
  | { success: true; draft_file_id: number }
  | {
      success: false;
      error: "NOT_FOUND" | "DRAFT_NOT_EDITABLE" | "INVALID_FILE_NAME";
    };

export type DeleteShopProductFileDraftResult =
  | { success: true; staged_storage_path: string | null }
  | {
      success: false;
      error: "NOT_FOUND" | "DRAFT_NOT_EDITABLE";
    };

export type UpsertShopProductVariantResult =
  | { success: true; draft_variant_id: number; variant_id: number }
  | { success: true; draft_variant_id: number; variant_id: string }
  | { success: true; variant_id: string }
  | {
      success: false;
      error:
        | "DRAFT_VARIANTS_ARE_ACTIVE"
        | "UNAUTHENTICATED"
        | "MISSING_REQUIRED_FIELDS"
        | "NOT_FOUND"
        | "OPTIONS_IMMUTABLE"
        | VariantOptionValidationErrorCode
        | "VARIANT_COMBINATION_CONFLICT";
    }
  | {
      success: false;
      error: "DRAFT_NOT_EDITABLE";
      status: ApprovalStatus;
    };

export type DeleteShopProductVariantResult =
  | { success: true }
  | {
      success: false;
      error: "NOT_FOUND" | "DRAFT_NOT_EDITABLE";
    };

export type AddShopProductFileResult =
  | { success: true; draft_file_id: number; file_id: number }
  | {
      success: false;
      error:
        | "UNAUTHENTICATED"
        | "MISSING_REQUIRED_FIELDS"
        | "NOT_FOUND_OR_NOT_DIGITAL"
        | "DRAFT_NOT_EDITABLE"
        | "STORAGE_PATH_CONFLICT";
    };

export type DeleteShopProductFileResult =
  | { success: true; staged_storage_path: string | null }
  | {
      success: false;
      error: "NOT_FOUND" | "DRAFT_NOT_EDITABLE";
    };

export type ShopProductsOverrides = {
  upsert_user_address: UpsertUserAddressResult;
  delete_user_address: DeleteUserAddressResult;
  upsert_shop_category: UpsertShopCategoryResult;
  delete_shop_category: DeleteShopCategoryResult;
  reorder_shop_categories: ReorderShopCategoriesResult;
  approve_shop_category: ApproveShopCategoryResult;
  reject_shop_category: RejectShopCategoryResult;
  delete_shop_product: DeleteShopProductResult;
  reorder_shop_products: ReorderShopProductsResult;
  ensure_shop_product_draft: EnsureShopProductDraftResult;
  get_shop_product_draft: GetShopProductDraftResult;
  discard_shop_product_draft: DiscardShopProductDraftResult;
  unpublish_shop_product: UnpublishShopProductResult;
  upsert_shop_product: UpsertShopProductResult;
  submit_shop_product_for_review: SubmitShopProductForReviewResult;
  approve_shop_product: ApproveShopProductResult;
  reject_shop_product: RejectShopProductResult;
  upsert_shop_product_variant_draft: UpsertShopProductVariantDraftResult;
  delete_shop_product_variant_draft: DeleteShopProductVariantDraftResult;
  add_shop_product_file_draft: AddShopProductFileDraftResult;
  update_shop_product_file_draft: UpdateShopProductFileDraftResult;
  delete_shop_product_file_draft: DeleteShopProductFileDraftResult;
  upsert_shop_product_variant: UpsertShopProductVariantResult;
  delete_shop_product_variant: DeleteShopProductVariantResult;
  add_shop_product_file: AddShopProductFileResult;
  delete_shop_product_file: DeleteShopProductFileResult;
};
