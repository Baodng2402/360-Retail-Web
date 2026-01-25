/**
 * Subscription Plan - from GET /saas/subscriptions/plans
 */
export interface Plan {
  id: string;
  planName: string;
  price: number;
  durationDays: number;
  description?: string;
  features?: string[];
  isPopular?: boolean;
}

/**
 * Purchase Plan Request - POST /saas/subscriptions/purchase
 */
export interface PurchasePlanRequest {
  planId: string;
}

/**
 * Purchase Response - from POST /saas/subscriptions/purchase
 */
export interface PurchaseResponse {
  paymentId: string;
  paymentUrl: string;
  amount: number;
  planName: string;
  planId?: string;
}

/**
 * Subscription Status - from GET /identity/subscription/status
 */
export interface SubscriptionStatus {
  status: "Registered" | "Active" | "Trial" | "Inactive" | "Suspended";
  hasStore: boolean;
  storeId: string | null;
  trialStartDate: string | null;
  trialEndDate: string | null;
  daysRemaining: number | null;
  planName: string | null;
  planId?: string | null;
  subscriptionEndDate?: string | null;
  isTrialExpired?: boolean;
}

/**
 * My Subscription - from GET /saas/subscriptions/my
 */
export interface MySubscription {
  subscriptionId?: string;
  planName: string | null;
  price?: number;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  daysRemaining: number | null;
}

/**
 * Payment Initiation - from GET /saas/payments/initiate
 */
export interface PaymentInitiation {
  paymentId: string;
  paymentUrl: string;
  amount: number;
  description?: string;
}

/**
 * VNPay Return Query params (parsed)
 */
export interface VnpayReturnParams {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

/**
 * Check if payment was successful
 */
export const isPaymentSuccess = (responseCode: string): boolean => {
  return responseCode === "00";
};

/**
 * Format price to VND
 */
export const formatPriceVnd = (price: number | undefined | null): string => {
  if (price === undefined || price === null || isNaN(price)) {
    return "Liên hệ";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

/**
 * Format days remaining with appropriate message
 */
export const formatDaysRemaining = (days: number | null): string => {
  if (days === null) return "Không giới hạn";
  if (days < 0) return "Đã hết hạn";
  if (days === 0) return "Hết hạn hôm nay";
  if (days === 1) return "Còn 1 ngày";
  return `Còn ${days} ngày`;
};

