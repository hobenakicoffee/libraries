import type { ServiceType } from "../constants";
import type { CheckoutOverrides } from "./rpc/checkout";
import type { OrdersOverrides } from "./rpc/orders";
import type { PaginationOverrides } from "./rpc/pagination";
import type { PlatformOverrides } from "./rpc/platform";
import type { ServiceOverrides } from "./rpc/service";
import type { ShopProductsOverrides } from "./rpc/shop-products";
import type { ShopSettingsOverrides } from "./rpc/shop-settings";
import type { StorefrontOverrides } from "./rpc/storefront";
import type { Database as GeneratedDatabase } from "./supabase";

export type TransactionMetadata = {
  supporter_name?: string;
  supporter_platform?: string;
  is_monthly?: boolean;
  message?: string;
  count?: number;
};

export type ActivityType =
  | "shop_draft_approved"
  | "shop_draft_rejected"
  | "category_approved"
  | "category_rejected"
  | "product_approved"
  | "product_rejected"
  | "post_gifted"
  | "post_gift_sent"
  | "post_approved"
  | "post_rejected"
  | "kyc_approved"
  | "kyc_resubmit_requested"
  | "kyc_rejected"
  | "report_status_updated"
  | "post_status_updated"
  | "order_item_shipped"
  | "order_item_delivered"
  | "order_item_cancelled";

export type ActivityMetadata = {
  type?: string;
  amount?: number;
  net_amount?: number;
  platform_fee?: number;
  price_at_purchase?: number;
  message?: string;
  item_name?: string;
  buyer_name?: string;
  buyer_platform?: string;
  commission_type?: string;
  requester_name?: string;
  coffee_count?: number;
  is_monthly?: boolean;
  supporter_id?: string;
  supporter_name?: string;
  supporter_platform?: string;
  supporter_anonymous?: boolean;
  identity_hash?: string;
  follower_name?: string;
  follower_username?: string;
  source?: string;
  post_id?: string;
  post_slug?: string;
  post_title?: string;
  plan_id?: string;
  plan_name?: string;
  service_type?: string;
  subscription_id?: string;
  membership_id?: string;
  creator_name?: string;
  creator_username?: string;
  billing_cycle?: string;
  activity_type?: ActivityType;
  period_end?: string;
  period_start?: string;
  rejection_reason?: string;
  category_id?: string;
  category_name?: string;
  grant_id?: string;
  gift_message?: string;
  product_id?: string;
  product_title?: string;
  draft_type?: "activation" | "featured_banners";
  shop_id?: string;
  shop_name?: string;
  submission_id?: string;
  report_id?: string;
  old_status?: string;
  new_status?: string;
  resolution_note?: string;
  notification_type?: string;
  order_id?: string;
  order_number?: string;
  carrier?: string;
  tracking_number?: string;
  tracking_url?: string;
  cancellation_reason?: string;
  action?: "follow" | "unfollow";
};

export type SupportersMetadata = {
  type?: ServiceType;
  amount?: number;
  message?: string;
  coffee_count?: number;
  is_monthly?: boolean;
  supporter_name?: string;
  supporter_platform?: string;
  supporter_anonymous?: boolean;
  follower_name?: string;
  follower_username?: string;
  action?: "follow" | "unfollow";
};

export type RpcOverrides = ShopProductsOverrides &
  ShopSettingsOverrides &
  StorefrontOverrides &
  CheckoutOverrides &
  OrdersOverrides &
  PaginationOverrides &
  PlatformOverrides &
  ServiceOverrides;

type GeneratedFunctions = GeneratedDatabase["public"]["Functions"];

type OverriddenFunctions = {
  [K in keyof GeneratedFunctions]: K extends keyof RpcOverrides
    ? Omit<GeneratedFunctions[K], "Args" | "Returns"> & {
        Args: GeneratedFunctions[K]["Args"];
        Returns: RpcOverrides[K];
      }
    : GeneratedFunctions[K];
};

// Compile-time guard: fails if any override key no longer matches a generated RPC.
type OrphanedRpcOverrides = Exclude<
  keyof RpcOverrides,
  keyof GeneratedFunctions
>;

export type AssertNoOrphans = [OrphanedRpcOverrides] extends [never]
  ? true
  : never;

export type Database = Omit<GeneratedDatabase, "public"> & {
  public: Omit<GeneratedDatabase["public"], "Functions"> & {
    Functions: OverriddenFunctions;
  };
};

export * from "./rpc/checkout";
export * from "./rpc/orders";
export * from "./rpc/pagination";
export * from "./rpc/platform";
export * from "./rpc/primitives";
export * from "./rpc/service";
export * from "./rpc/shop-products";
export * from "./rpc/shop-settings";
export * from "./rpc/storefront";
