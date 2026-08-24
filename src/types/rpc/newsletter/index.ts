import type { Enums } from "../../supabase";

type PostStatus = Enums<"post_status_enum">;

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

export type NewsletterOverrides = {
  unpublish_newsletter_post: UnpublishNewsletterPostResult;
  update_newsletter_post_status: UpdateNewsletterPostStatusResult;
  approve_newsletter_post: ApproveNewsletterPostResult;
  reject_newsletter_post: RejectNewsletterPostResult;
  toggle_newsletter_post_like: ToggleNewsletterPostLikeResult;
  purchase_newsletter_post: PurchaseNewsletterPostResult;
  purchase_newsletter_membership: PurchaseNewsletterMembershipResult;
  collect_orphaned_post_images: CollectOrphanedPostImagesResult;
};
