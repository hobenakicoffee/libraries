import type { ServiceType } from "../constants";

export type TransactionMetadata = {
  supporter_name?: string;
  supporter_platform?: string;
  is_monthly?: boolean;
  message?: string;
  count?: number;
};

export type ActivityType =
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

export * from "./supabase";
