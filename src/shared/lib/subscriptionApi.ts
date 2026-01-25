import { saasApi, identityApi } from "./axios-instances";
import type {
  Plan,
  PurchasePlanRequest,
  PurchaseResponse,
  SubscriptionStatus,
  MySubscription,
  PaymentInitiation,
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
   * GET /saas/payments/initiate?paymentId=xxx
   */
  async initiatePayment(paymentId: string): Promise<PaymentInitiation> {
    const res = await saasApi.get<ApiResponse<PaymentInitiation>>(
      `saas/payments/initiate?paymentId=${paymentId}`,
    );

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    throw new Error("Invalid payment initiation response");
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

