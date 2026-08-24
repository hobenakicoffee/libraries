import type { Enums } from "../../supabase";
import type { CouponValidateResult } from "../shop/primitives";

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

export type PaymentsOverrides = {
  handle_successful_payment: HandleSuccessfulPaymentResult;
  process_service_payment: ProcessServicePaymentResult;
  perform_coffee_gift: PerformCoffeeGiftResult;
  validate_coupon: ValidateCouponResult;
  reserve_coupon_redemption: ReserveCouponRedemptionResult;
  process_withdrawal: ProcessWithdrawalResult;
};
