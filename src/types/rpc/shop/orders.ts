import type { Enums, Json } from "../../supabase";

export type OrderComputedStatus =
  | "cancelled"
  | "refunded"
  | "processing"
  | "complete"
  | "partially_shipped";

export type OrderDetailItem = {
  id: string;
  product_title: string;
  product_type: Enums<"shop_product_type_enum">;
  variant_label: string | null;
  variant_options: Json | null;
  unit_price: number;
  shipping_cost: number;
  quantity: number;
  unit: string;
  status: Enums<"shop_order_item_status_enum">;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cod_settled_at: string | null;
  cancellation_reason: string | null;
  processing_min_days: number | null;
  processing_max_days: number | null;
  return_window_days: number | null;
  cover_media_url: string | null;
};

export type OrderDownloadToken = {
  file_name: string;
  file_size_bytes: number;
  token: string;
  download_count: number;
  max_downloads: number;
  expires_at: string;
};

export type OrderDetail = {
  id: string;
  order_number: string;
  seller_username: string;
  shop_name: string;
  shop_logo_url: string | null;
  payment_method: Enums<"shop_payment_method_enum">;
  payment_status: Enums<"payment_status_enum"> | null;
  payment_status_label: string;
  status: OrderComputedStatus;
  has_digital: boolean;
  has_physical: boolean;
  subtotal: number;
  shipping_total: number;
  total: number;
  platform_fee: number;
  seller_net: number;
  shipping_address: Json | null;
  area_type: string | null;
  billing_address: Json | null;
  buyer_notes: string | null;
  seller_notes: string | null;
  cod_settled_at: string | null;
  created_at: string;
  confirmed_at: string;
  is_guest_order: boolean;
  guest_name: string | null;
  guest_email: string | null;
  is_gift: boolean;
  gift_recipient_name: string | null;
  gift_recipient_email: string | null;
  gift_message: string | null;
  gift_wrap_fee: number;
  bundle_discount: number;
  coupon_id: string | null;
  coupon_discount: number;
  items: OrderDetailItem[];
  download_tokens: OrderDownloadToken[];
};

export type OrderDetailSuccess = { success: true; order: OrderDetail };

export type ShopOrderDetailResult =
  | OrderDetailSuccess
  | { success: false; error: "NOT_FOUND" };

export type GetOrderByNumberResult =
  | OrderDetailSuccess
  | { success: false; error: "NOT_FOUND" };

export type GetGuestOrderResult =
  | OrderDetailSuccess
  | { success: false; error: "NOT_FOUND" };

export type OrderCardItem = {
  id: string;
  product_id: string;
  product_slug: string;
  product_title: string;
  product_type: Enums<"shop_product_type_enum">;
  variant_label: string | null;
  unit_price: number;
  quantity: number;
  unit: string;
  line_total: number;
  status: Enums<"shop_order_item_status_enum">;
  cover_media_url: string | null;
};

export type BuyerOrderCard = {
  order_number: string;
  payment_method: Enums<"shop_payment_method_enum">;
  status: OrderComputedStatus;
  has_digital: boolean;
  has_physical: boolean;
  subtotal: number;
  shipping_total: number;
  total: number;
  created_at: string;
  item_count: number;
  has_tracking: boolean;
  seller_username: string;
  shop_name: string;
  shop_logo_url: string | null;
  is_gift: boolean;
  gift_wrap_fee: number;
  bundle_discount: number;
  coupon_discount: number;
  items: OrderCardItem[];
};

export type GetBuyerOrdersResult =
  | { success: true; orders: BuyerOrderCard[]; has_more: boolean }
  | { success: false; error: "UNAUTHENTICATED" };

export type SellerOrderItem = {
  id: string;
  product_title: string;
  product_type: Enums<"shop_product_type_enum">;
  variant_label: string | null;
  variant_options: Json | null;
  unit_price: number;
  shipping_cost: number;
  quantity: number;
  unit: string;
  status: Enums<"shop_order_item_status_enum">;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cod_settled_at: string | null;
  cancellation_reason: string | null;
  cover_media_url: string | null;
};

export type SellerOrderBuyer = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export type SellerOrderCard = {
  order_number: string;
  payment_method: Enums<"shop_payment_method_enum">;
  created_at: string;
  subtotal: number;
  shipping_total: number;
  seller_net: number;
  has_digital: boolean;
  has_physical: boolean;
  shipping_address: Json | null;
  billing_address: Json | null;
  buyer_notes: string | null;
  cod_settled_at: string | null;
  is_gift: boolean;
  gift_recipient_name: string | null;
  gift_recipient_email: string | null;
  gift_message: string | null;
  gift_wrap_fee: number;
  bundle_discount: number;
  coupon_discount: number;
  buyer: SellerOrderBuyer;
  is_guest_order: boolean;
  guest_phone: string | null;
  guest_email: string | null;
  items: SellerOrderItem[];
};

export type GetSellerOrdersResult =
  | { success: true; orders: SellerOrderCard[]; has_more: boolean }
  | { success: false; error: "UNAUTHENTICATED" }
  | { success: false; error: "INVALID_STATUS_FILTER" };

export type UpdateOrderTrackingSuccess = {
  success: true;
  order_number: string;
  buyer_profile_id: string | null;
  product_title: string;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
};

export type UpdateOrderTrackingFailure =
  | { success: false; error: "NOT_FOUND" }
  | { success: false; error: "NOT_PHYSICAL_ITEM" }
  | {
      success: false;
      error: "INVALID_STATUS_TRANSITION";
      current: Enums<"shop_order_item_status_enum">;
    };

export type UpdateOrderTrackingResult =
  | UpdateOrderTrackingSuccess
  | UpdateOrderTrackingFailure;

export type UpdateOrderSellerNotesResult =
  | {
      success: true;
      order_number: string;
      seller_notes: string | null;
    }
  | { success: false; error: "NOT_FOUND" };

export type MarkOrderItemDeliveredSuccess = {
  success: true;
  order_number: string;
  buyer_profile_id: string | null;
  product_title: string;
  payment_method: Enums<"shop_payment_method_enum">;
  requires_cash_confirmation: boolean;
};

export type MarkOrderItemDeliveredFailure =
  | { success: false; error: "NOT_FOUND" }
  | { success: false; error: "NOT_PHYSICAL_ITEM" }
  | {
      success: false;
      error: "INVALID_STATUS_TRANSITION";
      current: Enums<"shop_order_item_status_enum">;
    };

export type MarkOrderItemDeliveredResult =
  | MarkOrderItemDeliveredSuccess
  | MarkOrderItemDeliveredFailure;

export type ConfirmCodCashReceivedResult =
  | {
      success: true;
      transaction_id: string;
      sale_reference_id: string;
      fee_amount: number;
      balance_debit: number;
      cod_debt_added: number;
      order_settled: boolean;
    }
  | { success: true; idempotent: true }
  | { success: false; error: "NOT_FOUND" }
  | { success: false; error: "NOT_COD_ORDER" }
  | {
      success: false;
      error: "INVALID_STATUS_TRANSITION";
      current: Enums<"shop_order_item_status_enum">;
    };

export type CancelCodOrderItemResult =
  | { success: true }
  | { success: false; error: "CANCELLATION_REASON_REQUIRED" }
  | { success: false; error: "NOT_FOUND" }
  | { success: false; error: "NOT_COD_ORDER" }
  | {
      success: false;
      error: "RETURN_REQUEST_PENDING";
      current: Enums<"shop_order_item_status_enum">;
    }
  | {
      success: false;
      error: "INVALID_STATUS_TRANSITION";
      current: Enums<"shop_order_item_status_enum">;
    }
  | { success: false; error: "ALREADY_SETTLED" };

export type RefundRequestFailure =
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "REASON_REQUIRED"
  | "TRANSACTION_NOT_FOUND"
  | "FORBIDDEN"
  | "TRANSACTION_NOT_COMPLETED"
  | "INVALID_AMOUNT"
  | "REFUND_ALREADY_PENDING";

export type RequestShopOrderRefundResult =
  | { success: true; refund_id: string }
  | { success: false; error: "REASON_REQUIRED" }
  | { success: false; error: "NOT_FOUND" }
  | {
      success: false;
      error: "INVALID_STATUS_TRANSITION";
      current: Enums<"shop_order_item_status_enum">;
    }
  | { success: false; error: "RETURN_WINDOW_EXPIRED" }
  | { success: false; error: "NO_PAYMENT_TRANSACTION" }
  | { success: false; error: RefundRequestFailure };

export type TopupSellerCodDebtResult =
  | { success: true; debt_paid: number; remaining: number }
  | { success: false; error: "INVALID_AMOUNT" };

export type RequestReturnResult =
  | { success: true; return_request_id: string }
  | { success: false; error: "UNAUTHENTICATED" }
  | { success: false; error: "UNAUTHORIZED" }
  | { success: false; error: "REASON_REQUIRED" }
  | { success: false; error: "NOT_FOUND" }
  | { success: false; error: "NOT_PHYSICAL_ITEM" }
  | { success: false; error: "RETURN_ALREADY_PENDING" }
  | {
      success: false;
      error: "INVALID_STATUS_TRANSITION";
      current: Enums<"shop_order_item_status_enum">;
    }
  | { success: false; error: "RETURN_WINDOW_EXPIRED" }
  | { success: false; error: "INVALID_QUANTITY" };

export type CancelReturnRequestResult =
  | { success: true }
  | { success: false; error: "UNAUTHENTICATED" }
  | { success: false; error: "UNAUTHORIZED" }
  | { success: false; error: "NOT_FOUND" }
  | {
      success: false;
      error: "ALREADY_FINALISED";
      current: Enums<"return_request_status_enum">;
    };

export type ReturnRequestItem = {
  id: string;
  product_title: string;
  product_type: Enums<"shop_product_type_enum">;
  variant_label: string | null;
  unit_price: number;
  quantity: number;
  unit: string;
  line_total: number;
  status: Enums<"shop_order_item_status_enum">;
  cover_media_url: string | null;
};

export type BuyerReturnRow = {
  return_request_id: string;
  status: Enums<"return_request_status_enum">;
  reason: string;
  quantity: number;
  seller_note: string | null;
  responded_at: string | null;
  created_at: string;
  order_number: string;
  seller_username: string;
  shop_name: string;
  shop_logo_url: string | null;
  item: ReturnRequestItem;
};

export type GetBuyerReturnsResult =
  | { success: true; returns: BuyerReturnRow[]; has_more: boolean }
  | { success: false; error: "UNAUTHENTICATED" };

export type SellerReturnRowBuyer = {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export type SellerReturnRow = {
  return_request_id: string;
  status: Enums<"return_request_status_enum">;
  reason: string;
  quantity: number;
  seller_note: string | null;
  responded_at: string | null;
  created_at: string;
  order_number: string;
  buyer: SellerReturnRowBuyer;
  item: ReturnRequestItem;
};

export type GetSellerReturnRequestsResult =
  | { success: true; returns: SellerReturnRow[]; has_more: boolean }
  | { success: false; error: "UNAUTHENTICATED" }
  | { success: false; error: "INVALID_STATUS_FILTER" };

export type RespondToReturnRequestResult =
  | { success: true; status: "rejected" }
  | { success: true; status: "approved"; refund_id: string }
  | { success: false; error: "UNAUTHENTICATED" }
  | { success: false; error: "UNAUTHORIZED" }
  | { success: false; error: "INVALID_STATUS_TRANSITION" }
  | { success: false; error: "NOT_FOUND" }
  | {
      success: false;
      error: "ALREADY_FINALISED";
      current: Enums<"return_request_status_enum">;
    }
  | { success: false; error: "NO_PAYMENT_TRANSACTION" }
  | { success: false; error: RefundRequestFailure };

/**
 * Opened from either side of an order — the buyer and the seller converge on the
 * same thread. `GUEST_ORDER` covers guest checkout, which has no profile to
 * thread with; `NOT_FOUND` covers both a missing order and one the caller is
 * neither party to.
 */
export type GetOrCreateOrderConversationResult =
  | { success: true; conversation_id: string }
  | {
      success: false;
      error:
        | "UNAUTHENTICATED"
        | "NOT_FOUND"
        | "GUEST_ORDER"
        | "CANNOT_CHAT_WITH_SELF";
    };

export type GetBuyerPurchaseCountsResult =
  | {
      success: true;
      orders_count: number;
      returns_count: number;
      cancelled_count: number;
    }
  | { success: false; error: "UNAUTHENTICATED" };

export type OrdersOverrides = {
  shop_order_detail: ShopOrderDetailResult;
  get_order_by_number: GetOrderByNumberResult;
  get_guest_order: GetGuestOrderResult;
  get_buyer_orders: GetBuyerOrdersResult;
  get_seller_orders: GetSellerOrdersResult;
  update_order_tracking: UpdateOrderTrackingResult;
  update_order_seller_notes: UpdateOrderSellerNotesResult;
  mark_order_item_delivered: MarkOrderItemDeliveredResult;
  confirm_cod_cash_received: ConfirmCodCashReceivedResult;
  cancel_cod_order_item: CancelCodOrderItemResult;
  request_shop_order_refund: RequestShopOrderRefundResult;
  topup_seller_cod_debt: TopupSellerCodDebtResult;
  request_return: RequestReturnResult;
  cancel_return_request: CancelReturnRequestResult;
  get_buyer_returns: GetBuyerReturnsResult;
  get_seller_return_requests: GetSellerReturnRequestsResult;
  respond_to_return_request: RespondToReturnRequestResult;
  get_buyer_purchase_counts: GetBuyerPurchaseCountsResult;
  get_or_create_order_conversation: GetOrCreateOrderConversationResult;
};
