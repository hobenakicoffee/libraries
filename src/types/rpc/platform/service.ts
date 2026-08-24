import type { Json } from "../../supabase";

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

export type PlatformServiceOverrides = {
  activate_creator_platform_subscription: ActivateCreatorPlatformSubscriptionResult;
  cancel_creator_platform_subscription: CancelCreatorPlatformSubscriptionResult;
  admin_grant_creator_subscription: AdminGrantCreatorSubscriptionResult;
  update_creator_report_status: UpdateCreatorReportStatusResult;
  collect_orphaned_kyc_documents: CollectOrphanedKycDocumentsResult;
  collect_reviewed_kyc_documents: CollectReviewedKycDocumentsResult;
  custom_access_token_hook: CustomAccessTokenHookResult;
};
