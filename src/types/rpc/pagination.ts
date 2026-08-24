import type { Enums, Json } from "../supabase";

export type PaginationPayload<T> = { items: T[]; has_more: boolean };

export type PostsPageItem = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  is_members_only: boolean;
  is_pay_per_post: boolean;
  price: number | null;
  tags: string[] | null;
  view_count: number;
  like_count: number;
  click_count: number;
  purchase_count: number;
  revenue_total: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  draft_count: number;
  reject_reason: string | null;
};

export type ReaderFeedItem = {
  post_id: string;
  profile_id: string;
  author_display_name: string | null;
  author_username: string | null;
  author_avatar_url: string | null;
  title: string;
  slug: string;
  subtitle: string | null;
  cover_image_url: string | null;
  excerpt: string | null;
  is_members_only: boolean;
  is_pay_per_post: boolean;
  price: number | null;
  tags: string[] | null;
  reading_time_minutes: number | null;
  view_count: number;
  like_count: number;
  published_at: string;
  is_liked: boolean;
  has_access: boolean;
  access_badge: string | null;
};

export type TransactionPageItem = {
  id: string;
  supporter_id: string | null;
  service_type: string;
  metadata: Json;
  net_amount: number;
  platform_fee: number;
  status: Enums<"payment_status_enum">;
  created_at: string;
  reference_type: Enums<"reference_type_enum">;
  provider: Enums<"provider_enum"> | null;
  provider_transaction_id: string | null;
  direction: Enums<"transaction_direction_enum">;
  invoice_number: number | null;
};

export type WithdrawalRequestPageItem = {
  id: string;
  profile_id: string;
  wallet_id: string;
  payout_method_id: string | null;
  amount: number;
  fee: number;
  net_amount: number;
  status: Enums<"withdrawal_status">;
  requested_at: string;
  processed_at: string | null;
  completed_at: string | null;
  failure_reason: string | null;
  payout_snapshot: Json | null;
};

export type ProductReviewPageItem = {
  review_id: string;
  rating: number;
  content: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  reviewer_username: string | null;
  reviewer_avatar_url: string | null;
};

export type ShopReviewPageItem = ProductReviewPageItem & {
  is_hidden: boolean;
  product_id: string;
  product_title: string;
  product_cover_media_url: string | null;
};

export type PaginationOverrides = {
  get_posts_page: PaginationPayload<PostsPageItem>;
  get_reader_feed: PaginationPayload<ReaderFeedItem>;
  get_transactions_page: PaginationPayload<TransactionPageItem>;
  get_withdrawal_requests_page: PaginationPayload<WithdrawalRequestPageItem>;
  get_product_reviews: PaginationPayload<ProductReviewPageItem>;
  get_shop_reviews: PaginationPayload<ShopReviewPageItem>;
};
