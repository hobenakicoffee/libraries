import type { ServiceType } from "../constants";

export type TransactionMetadata = {
  supporter_name?: string;
  supporter_platform?: string;
  is_monthly?: boolean;
  message?: string;
  count?: number;
};

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
  billing_cycle?: string;
  period_end?: string;
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
