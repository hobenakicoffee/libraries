import type { Enums, Json } from "../supabase";
import type { CouponValidateResult } from "./primitives";

type PostStatus = Enums<"post_status_enum">;
type WithdrawalStatus = Enums<"withdrawal_status">;

export type PaymentOrchestrationSuccess = {
  success: true;
  reference_id: string;
  supporter_transaction_id: string | null;
  creator_transaction_id: string;
  supporter_balance_after: number | null;
  creator_balance_after: number;
};

export type HandleSuccessfulPaymentResult = PaymentOrchestrationSuccess;

export type ProcessServicePaymentResult = PaymentOrchestrationSuccess & {
  supporter_id: string;
};

export type PerformCoffeeGiftResult = ProcessServicePaymentResult;

export type ValidateCouponResult = CouponValidateResult;

export type ReserveCouponRedemptionResult =
  | { success: true; reserved: false }
  | { success: false; error: "COUPON_LIMIT_REACHED" }
  | { success: true; reserved: true; id: string }
  | {
      success: true;
      reserved: true;
      id: null;
      already_redeemed: true;
    };

export type UnpublishNewsletterPostResult =
  | { success: false; error: "POST_NOT_FOUND" | "FORBIDDEN" | "NOT_PUBLISHED" }
  | {
      success: false;
      error: "DRAFT_LIMIT_REACHED";
      draft_count: number;
      message: string;
    }
  | { success: true; draft_count: number };

export type UpdateNewsletterPostStatusResult =
  | { success: false; error: "POST_NOT_FOUND" | "FORBIDDEN" }
  | {
      success: false;
      error: "INVALID_STATUS_TRANSITION";
      current: PostStatus;
    }
  | {
      success: false;
      error: "DRAFT_LIMIT_REACHED";
      draft_count: number;
      message: string;
    }
  | { success: true; old_status: PostStatus; new_status: PostStatus };

export type ApproveNewsletterPostResult =
  | {
      success: false;
      error: "UNAUTHORIZED" | "NOT_FOUND" | "NOT_IN_REVIEW";
    }
  | { success: true };

export type RejectNewsletterPostResult =
  | {
      success: false;
      error:
        | "UNAUTHORIZED"
        | "REJECTION_REASON_REQUIRED"
        | "NOT_FOUND"
        | "NOT_IN_REVIEW";
    }
  | { success: true };

export type ToggleNewsletterPostLikeResult = {
  liked: boolean;
  like_count: number;
};

export type PurchaseNewsletterPostResult = {
  success: true;
  grant_id: string;
  reference_id: string;
  supporter_id: string;
  supporter_transaction_id: string | null;
  creator_transaction_id: string;
  creator_balance_after: string;
};

export type PurchaseNewsletterMembershipResult = {
  success: true;
  membership_id: string;
  period_end: string;
  reference_id: string;
  supporter_id: string;
  supporter_transaction_id: string | null;
  creator_transaction_id: string;
  creator_balance_after: string;
};

export type CollectOrphanedPostImagesResult = {
  bucket: string;
  paths: string[];
  finalize: never[];
};

export type ActivateCreatorPlatformSubscriptionResult = {
  success: true;
  subscription_id: number;
  service_type: string;
  period_start: string;
  period_end: string;
};

export type CancelCreatorPlatformSubscriptionResult =
  | { success: false; error: "UNAUTHENTICATED" | "NO_ACTIVE_SUBSCRIPTION" }
  | { success: true; subscription_id: number };

export type AdminGrantCreatorSubscriptionResult = {
  success: true;
  subscription_id: number;
  service_type: string;
  period_end: string;
};

export type UpdateCreatorReportStatusResult =
  | {
      success: false;
      error:
        | "FORBIDDEN"
        | "INVALID_STATUS"
        | "REPORT_NOT_FOUND"
        | "ALREADY_RESOLVED";
    }
  | {
      success: true;
      report_id: string;
      old_status: string;
      new_status: string;
    };

export type ProcessWithdrawalResult =
  | { success: false; error: "UNAUTHORIZED" | "INVALID_STATUS" | "NOT_FOUND" }
  | {
      success: false;
      error: "ALREADY_TERMINAL";
      current_status: WithdrawalStatus;
    }
  | {
      success: false;
      error: "INVALID_TRANSITION";
      current_status: WithdrawalStatus;
    }
  | { success: true; new_status: WithdrawalStatus };

export type CollectOrphanedKycDocumentsResult = {
  bucket: string;
  paths: string[];
  finalize: never[];
};

export type CollectReviewedKycDocumentsFinalizeItem = {
  id: number;
  nid_front_path: string | null;
  nid_back_path: string | null;
  selfie_path: string | null;
  updated_at: string;
};

export type CollectReviewedKycDocumentsResult = {
  bucket: string;
  paths: string[];
  finalize: CollectReviewedKycDocumentsFinalizeItem[];
};

export type CustomAccessTokenHookResult = Json;

export type ServiceOverrides = {
  handle_successful_payment: HandleSuccessfulPaymentResult;
  process_service_payment: ProcessServicePaymentResult;
  perform_coffee_gift: PerformCoffeeGiftResult;
  validate_coupon: ValidateCouponResult;
  reserve_coupon_redemption: ReserveCouponRedemptionResult;
  unpublish_newsletter_post: UnpublishNewsletterPostResult;
  update_newsletter_post_status: UpdateNewsletterPostStatusResult;
  approve_newsletter_post: ApproveNewsletterPostResult;
  reject_newsletter_post: RejectNewsletterPostResult;
  toggle_newsletter_post_like: ToggleNewsletterPostLikeResult;
  purchase_newsletter_post: PurchaseNewsletterPostResult;
  purchase_newsletter_membership: PurchaseNewsletterMembershipResult;
  collect_orphaned_post_images: CollectOrphanedPostImagesResult;
  activate_creator_platform_subscription: ActivateCreatorPlatformSubscriptionResult;
  cancel_creator_platform_subscription: CancelCreatorPlatformSubscriptionResult;
  admin_grant_creator_subscription: AdminGrantCreatorSubscriptionResult;
  update_creator_report_status: UpdateCreatorReportStatusResult;
  process_withdrawal: ProcessWithdrawalResult;
  collect_orphaned_kyc_documents: CollectOrphanedKycDocumentsResult;
  collect_reviewed_kyc_documents: CollectReviewedKycDocumentsResult;
  custom_access_token_hook: CustomAccessTokenHookResult;
};
