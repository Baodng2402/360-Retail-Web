import { saasApi, identityApi } from "./axios-instances";
import type {
  Plan,
  PurchasePlanRequest,
  PurchaseResponse,
  SubscriptionStatus,
  MySubscription,
  PaymentInitiation,
  SePayPaymentData,
} from "@/shared/types/subscription";
import type { ApiResponse } from "@/shared/types/api-response";

export const subscriptionApi = {
  /**
   * Get all available subscription plans
   * GET /saas/subscriptions/plans
   */
  async getPlans(): Promise<Plan[]> {
    const res = await saasApi.get<ApiResponse<Plan[]> | Plan[]>(
      "saas/subscriptions/plans",
    );

    if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  /**
   * Purchase a subscription plan
   * POST /saas/subscriptions/purchase
   */
  async purchasePlan(payload: PurchasePlanRequest): Promise<PurchaseResponse> {
    const res = await saasApi.post<
      PurchaseResponse | ApiResponse<PurchaseResponse>
    >("saas/subscriptions/purchase", payload);

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    if ("paymentId" in res.data) {
      return res.data as PurchaseResponse;
    }
    throw new Error("Invalid purchase response format");
  },

  /**
   * Get my current subscription
   * GET /saas/subscriptions/my
   */
  async getMySubscription(): Promise<MySubscription | null> {
    const res = await saasApi.get<ApiResponse<MySubscription> | MySubscription>(
      "saas/subscriptions/my",
    );

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    if ("id" in res.data) {
      return res.data as MySubscription;
    }
    return null;
  },

  /**
   * Get subscription status for a specific store
   * GET /saas/subscriptions/store/{storeId}/status
   */
  async getStoreSubscriptionStatus(storeId: string): Promise<SubscriptionStatus> {
    const res = await saasApi.get<
      ApiResponse<SubscriptionStatus> | SubscriptionStatus
    >(`saas/subscriptions/store/${storeId}/status`);

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as SubscriptionStatus;
  },

  /**
   * Initiate payment for a payment ID
   * GET /saas/payments/initiate?paymentId=xxx&provider={vnpay|sepay}
   */
  async initiatePayment(
    paymentId: string,
    provider: "vnpay" | "sepay",
  ): Promise<PaymentInitiation | SePayPaymentData> {
    const res = await saasApi.get<unknown>(
      `saas/payments/initiate?paymentId=${paymentId}&provider=${provider}`,
    );

    const raw = res.data as
      | ApiResponse<PaymentInitiation | SePayPaymentData>
      | (PaymentInitiation & { success?: boolean; planName?: string | null })
      | ({ success: boolean } & { data?: SePayPaymentData })
      | SePayPaymentData;

    // Case 1: Gateway-style ApiResponse { success, data }
    if ("success" in raw && "data" in raw) {
      if (!raw.success || !raw.data) {
        throw new Error("Invalid payment initiation response");
      }
      return raw.data as PaymentInitiation | SePayPaymentData;
    }

    // Case 2: VNPay initiate response { success, paymentUrl, ... }
    if ("success" in raw && "paymentUrl" in raw) {
      if (!raw.success) {
        throw new Error("Payment initiation failed");
      }
      const { paymentId: id, paymentUrl, amount, planName } = raw as {
        paymentId: string;
        paymentUrl: string;
        amount: number;
        planName?: string | null;
      };
      const mapped: PaymentInitiation = {
        paymentId: id,
        paymentUrl,
        amount,
        description: planName ?? undefined,
      };
      return mapped;
    }

    // Case 3: Raw SePay data object
    if (
      typeof raw === "object" &&
      raw !== null &&
      "provider" in raw &&
      (raw as { provider?: string }).provider === "sepay"
    ) {
      return raw as SePayPaymentData;
    }

    // Case 4: Fallback assume it's already PaymentInitiation
    return raw as PaymentInitiation;
  },

  /**
   * Get current subscription status from identity API
   * GET /identity/subscription/status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const res = await identityApi.get<SubscriptionStatus>(
      "identity/subscription/status",
    );
    return res.data;
  },
};

