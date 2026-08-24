import type { Enums, Json } from "../../supabase";
import type { ShopProductPricing } from "./primitives";

type ProductType = Enums<"shop_product_type_enum">;
type PolicyType = Enums<"shop_policy_type_enum">;

export type ShopProfileSummary = {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export type ShopStatsBlock = {
  total_products: number;
  total_sales: number;
  rating_avg: number | null;
  rating_count: number;
};

export type ShopFeaturedBanner = {
  media_url: string;
  link_url: string | null;
};

export type ShopSettingsPublicView = {
  shop_name: string;
  shop_description: string | null;
  hero_headline: string | null;
  hero_subtitle: string | null;
  logo_url: string | null;
  banner_url: string | null;
  featured_banners: ShopFeaturedBanner[];
  theme_config: Json;
  seo_title: string | null;
  seo_description: string | null;
  seo_custom_meta_tags: Json | null;
  cod_enabled: boolean;
  requires_shipping: boolean;
};

type ShopProductBaseCard = {
  id: string;
  title: string;
  slug: string;
  cover_media_url: string | null;
  product_type: ProductType;
  price: number;
  compare_at_price: number | null;
  unit: string;
  stock_count: number | null;
} & ShopProductPricing;

export type FeaturedProductCard = ShopProductBaseCard & {
  low_stock_threshold: number;
  allow_backorder: boolean;
  sales_count: number;
  rating_avg: number | null;
  rating_count: number;
  category_id: string | null;
  sort_order: number;
};

export type FlashSaleProductCard = Omit<FeaturedProductCard, "sort_order">;

export type FlashSaleInfo = {
  is_active: boolean;
  ends_at: string | null;
  max_discount_percent: number | null;
  products: FlashSaleProductCard[];
};

export type ProductGridCard = ShopProductBaseCard & {
  low_stock_threshold: number;
  min_order_quantity: number;
  allow_backorder: boolean;
  sales_count: number;
  rating_avg: number | null;
  rating_count: number;
  favorite_count: number;
  is_favorited: boolean;
  tags: string[];
  sort_order: number;
  category_id: string | null;
  created_at: string;
};

export type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  product_count: number;
};

export type StorefrontPolicyRow = {
  policy_type: PolicyType;
  content: string;
  is_enabled: boolean;
  updated_at: string;
};

export type TopSellerProductCard = {
  id: string;
  title: string;
  slug: string;
  cover_media_url: string | null;
  product_type: ProductType;
  price: number;
  compare_at_price: number | null;
  unit: string;
  stock_count: number | null;
  sales_count: number;
  rating_avg: number | null;
  rating_count: number;
};

export type ProductVariantRow = {
  id: string;
  options: Json;
  price_adjustment: number;
  stock_count: number | null;
  sku: string | null;
  media_url: string | null;
  sort_order: number;
};

export type ProductFileRow = {
  id: string;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  sort_order: number;
};

export type ShopProductsNextCursor = {
  sort: string;
  v: number | string | boolean | null;
  id: string;
};

export type GetShopByUsernameResult =
  | {
      success: true;
      shop: ShopSettingsPublicView;
      profile: ShopProfileSummary;
      stats: ShopStatsBlock | null;
      featured_products: FeaturedProductCard[];
    }
  | { success: false; error: "PROFILE_NOT_FOUND" | "SHOP_NOT_FOUND" };

export type GetShopCategoriesResult =
  | {
      success: true;
      total_product_count: number;
      categories: CategoryWithCount[];
    }
  | { success: false; error: "PROFILE_NOT_FOUND" | "SHOP_NOT_FOUND" };

export type GetShopFlashSaleResult =
  | {
      success: true;
      is_active: boolean;
      ends_at: string | null;
      max_discount_percent: number | null;
      products: FlashSaleProductCard[];
    }
  | { success: false; error: "PROFILE_NOT_FOUND" | "SHOP_NOT_FOUND" };

export type GetShopTopSellerProductResult =
  | {
      success: true;
      product: TopSellerProductCard | null;
    }
  | { success: false; error: "UNAUTHENTICATED" | "FORBIDDEN" };

export type GetShopProductsResult =
  | {
      success: true;
      products: ProductGridCard[];
      has_more: boolean;
      next_cursor: ShopProductsNextCursor | null;
    }
  | {
      success: false;
      error:
        | "PROFILE_NOT_FOUND"
        | "SHOP_NOT_FOUND"
        | "CATEGORY_NOT_FOUND"
        | "INVALID_SORT"
        | "CURSOR_SORT_MISMATCH"
        | "INVALID_CURSOR";
    };

export type SearchShopProductsResult =
  | {
      success: true;
      products: ProductGridCard[];
      has_more: boolean;
      next_offset: number | null;
    }
  | { success: false; error: "PROFILE_NOT_FOUND" | "SHOP_NOT_FOUND" };

export type GetProductBySlugResult =
  | {
      success: true;
      product: {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        cover_media_url: string | null;
        media: string[];
        video_url: string | null;
        product_type: ProductType;
        sku: string | null;
        price: number;
        compare_at_price: number | null;
        is_active: boolean;
        option_definitions: Json;
        weight_grams: number | null;
        shipping_fee_inside_dhaka: number;
        shipping_fee_outside_dhaka: number;
        processing_min_days: number | null;
        processing_max_days: number | null;
        requires_shipping: boolean;
        cod_enabled: boolean;
        max_downloads: number;
        unit: string;
        stock_count: number | null;
        low_stock_threshold: number;
        min_order_quantity: number;
        allow_backorder: boolean;
        return_window_days: number | null;
        warranty_days: number | null;
        sales_count: number;
        rating_avg: number | null;
        rating_count: number;
        favorite_count: number;
        is_favorited: boolean;
        tags: string[];
        category_id: string | null;
        category_name: string | null;
        category_slug: string | null;
        variants: ProductVariantRow[];
        files: ProductFileRow[];
      } & ShopProductPricing;
    }
  | { success: false; error: "PROFILE_NOT_FOUND" | "PRODUCT_NOT_FOUND" };

export type GetShopStorefrontResult =
  | (Extract<GetShopByUsernameResult, { success: true }> & {
      categories: CategoryWithCount[];
      total_product_count: number;
      flash_sale: FlashSaleInfo;
      products: ProductGridCard[];
      has_more: boolean;
      next_cursor: ShopProductsNextCursor | null;
      policies: StorefrontPolicyRow[] | null;
      promotions: Json;
      bestseller: TopSellerProductCard | null;
    })
  | { success: false; error: "PROFILE_NOT_FOUND" | "SHOP_NOT_FOUND" };

export type StorefrontOverrides = {
  get_shop_by_username: GetShopByUsernameResult;
  get_shop_categories: GetShopCategoriesResult;
  get_shop_flash_sale: GetShopFlashSaleResult;
  get_shop_top_seller_product: GetShopTopSellerProductResult;
  get_shop_products: GetShopProductsResult;
  search_shop_products: SearchShopProductsResult;
  get_product_by_slug: GetProductBySlugResult;
  get_shop_storefront: GetShopStorefrontResult;
};
