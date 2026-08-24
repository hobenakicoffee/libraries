import type { Enums, Json } from "../../supabase";

export type RefundStatus = Enums<"refund_status_enum">;
export type RefundGatewayStatus = Enums<"refund_gateway_status_enum">;

export type UpsertReviewErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_ENTITY_TYPE"
  | "INVALID_RATING"
  | "ENTITY_NOT_FOUND"
  | "CANNOT_REVIEW_OWN_PRODUCT";

export type UpsertReviewResult =
  | { success: false; error: UpsertReviewErrorCode }
  | { success: true; review_id: string; is_verified_purchase: boolean };

export type DeleteReviewErrorCode = "UNAUTHENTICATED" | "NOT_FOUND";

export type DeleteReviewResult =
  | { success: false; error: DeleteReviewErrorCode }
  | { success: true };

export type HideReviewErrorCode = "UNAUTHORIZED" | "NOT_FOUND";

export type HideReviewResult =
  | { success: false; error: HideReviewErrorCode }
  | { success: true; already_hidden: true }
  | { success: true; review_id: string };

export type ShopReviewStatsDistribution = {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
};

export type GetShopReviewStatsResult =
  | { success: false; error: "UNAUTHENTICATED" }
  | {
      success: true;
      total_reviews: number;
      avg_rating: number | null;
      published_count: number;
      hidden_count: number;
      distribution: ShopReviewStatsDistribution;
    };

export type ReviewableProductItem = {
  product_id: string;
  product_title: string | null;
  product_type: string;
  cover_media_url: string | null;
  shop_name: string | null;
  shop_logo_url: string | null;
  purchased_at: string;
};

export type GetMyReviewableProductsResult =
  | { success: false; error: "UNAUTHENTICATED" }
  | {
      success: true;
      products: ReviewableProductItem[];
      has_more: boolean;
    };

export type MyReviewListItem = {
  review_id: string;
  rating: number;
  content: string | null;
  created_at: string;
  updated_at: string;
  product_id: string | null;
  product_title: string | null;
  cover_media_url: string | null;
  shop_name: string | null;
};

export type GetMyReviewsResult =
  | { success: false; error: "UNAUTHENTICATED" }
  | {
      success: true;
      reviews: MyReviewListItem[];
      has_more: boolean;
    };

export type GetMyReviewCountsResult =
  | { success: false; error: "UNAUTHENTICATED" }
  | {
      success: true;
      pending_count: number;
      reviewed_count: number;
    };

export type UpdateEmailNotificationsEnabledResult =
  | { success: false; error: "NOT_FOUND" }
  | { success: true };

export type SetNotificationPreferenceResult =
  | { success: false; error: "NOT_FOUND" }
  | { success: true };

export type NotificationPreferenceItem = {
  key: string;
  service: string;
  category: string;
  label: string;
  description: string | null;
  enabled: boolean;
};

export type NotificationPreferencesPayload = {
  email_notifications_enabled: boolean;
  preferences: NotificationPreferenceItem[];
};

export type GetNotificationPreferencesResult =
  NotificationPreferencesPayload | null;

export type ApplyUnsubscribeResult =
  | { success: false; error: "NOT_FOUND" }
  | { success: true };

export type ModerateUserErrorCode = "UNAUTHORIZED" | "NOT_FOUND";

export type ModerateUserResult =
  | { success: false; error: ModerateUserErrorCode }
  | { success: true };

export type AcceptCreatorAgreementErrorCode =
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "INVALID_VERSION";

export type AcceptCreatorAgreementResult =
  | { success: false; error: AcceptCreatorAgreementErrorCode }
  | { success: true; version: string };

export type ToggleFeedItemLikeResult = {
  liked: boolean;
  total_likes: number;
};

export type ToggleFeedItemBookmarkResult = {
  bookmarked: boolean;
};

export type ToggleFavoriteErrorCode = "UNAUTHENTICATED";

export type ToggleFavoriteResult =
  | { success: false; error: ToggleFavoriteErrorCode }
  | { success: true; favorited: boolean };

export type FavoriteItem = {
  service_type: string;
  target_type: string;
  target_id: string;
  created_at: string;
};

export type ListFavoritesResult =
  | { success: false; error: "UNAUTHENTICATED" }
  | {
      success: true;
      favorites: FavoriteItem[];
      has_more: boolean;
      next_cursor: string | null;
    };

export type CloseAccountResult = {
  success: true;
  avatar_path: string | null;
  banner_path: string | null;
  kyc_paths: string[];
};

export type RequestRefundErrorCode =
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "REASON_REQUIRED"
  | "TRANSACTION_NOT_FOUND"
  | "FORBIDDEN"
  | "TRANSACTION_NOT_COMPLETED"
  | "INVALID_AMOUNT"
  | "REFUND_ALREADY_PENDING";

export type RequestRefundResult =
  | { success: false; error: RequestRefundErrorCode }
  | { success: true; refund_id: string };

export type AdminProcessRefundErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_STATUS"
  | "NOT_FOUND"
  | "ALREADY_FINALISED";

export type AdminProcessRefundResult =
  | { success: false; error: AdminProcessRefundErrorCode }
  | { success: true; refund_id: string; new_status: RefundStatus };

export type AdminRecordGatewayRefundResultErrorCode =
  | "NOT_FOUND"
  | "ALREADY_FINALISED";

export type AdminRecordGatewayRefundResultResult =
  | { success: false; error: AdminRecordGatewayRefundResultErrorCode }
  | { success: true; refund_id: string; gateway_status: RefundGatewayStatus };

export type FlagTransactionDisputedErrorCode = "UNAUTHORIZED" | "NOT_FOUND";

export type FlagTransactionDisputedResult =
  | { success: false; error: FlagTransactionDisputedErrorCode }
  | { success: true; transaction_id: string; is_disputed: boolean };

export type GetPlatformSettingJsonbResult = Json;

export type GetCompanyIdentityResult = { [key: string]: Json };

export type UpdateNotificationEmailTemplateErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND";

export type UpdateNotificationEmailTemplateResult =
  | { success: false; error: UpdateNotificationEmailTemplateErrorCode }
  | { success: true };

export type PlatformOverrides = {
  upsert_review: UpsertReviewResult;
  delete_review: DeleteReviewResult;
  hide_review: HideReviewResult;
  get_shop_review_stats: GetShopReviewStatsResult;
  get_my_reviewable_products: GetMyReviewableProductsResult;
  get_my_reviews: GetMyReviewsResult;
  get_my_review_counts: GetMyReviewCountsResult;
  update_email_notifications_enabled: UpdateEmailNotificationsEnabledResult;
  set_notification_preference: SetNotificationPreferenceResult;
  get_notification_preferences: GetNotificationPreferencesResult;
  get_notification_preferences_for_user: NotificationPreferencesPayload | null;
  apply_unsubscribe: ApplyUnsubscribeResult;
  moderate_user: ModerateUserResult;
  accept_creator_agreement: AcceptCreatorAgreementResult;
  toggle_feed_item_like: ToggleFeedItemLikeResult;
  toggle_feed_item_bookmark: ToggleFeedItemBookmarkResult;
  toggle_favorite: ToggleFavoriteResult;
  list_favorites: ListFavoritesResult;
  close_account: CloseAccountResult;
  request_refund: RequestRefundResult;
  admin_process_refund: AdminProcessRefundResult;
  admin_record_gateway_refund_result: AdminRecordGatewayRefundResultResult;
  flag_transaction_disputed: FlagTransactionDisputedResult;
  get_platform_setting_jsonb: GetPlatformSettingJsonbResult;
  get_company_identity: GetCompanyIdentityResult;
  update_notification_email_template: UpdateNotificationEmailTemplateResult;
};
