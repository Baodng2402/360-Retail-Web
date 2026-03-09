import { saasApi, identityApi } from "./axios-instances";
import type {
  Plan,
  PurchasePlanRequest,
  PurchaseResponse,
  SubscriptionStatus,
  MySubscription,
  PaymentInitiation,
  SePayPaymentData,
  PaymentStatus,
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
   * Get allowed feature keys for the current user's plan (same codes as 403 feature field).
   * GET saas/subscriptions/my → planName, then GET plans → find plan → parse Features JSON string.
   * Backend: Features is a JSON object string, e.g. {"has_dashboard":true,"has_gps_checkin":false}.
   * Returns keys where value === true.
   */
  async getAllowedFeatures(): Promise<string[]> {
    const mySub = await this.getMySubscription();
    const planName = mySub?.planName?.trim();
    if (!planName) return [];

    const plans = await this.getPlans();
    const plan = plans.find(
      (p) =>
        p.planName?.trim() === planName ||
        p.planName?.trim().toLowerCase() === planName.toLowerCase(),
    );
    if (!plan) return [];

    if (Array.isArray(plan.features) && plan.features.length > 0) {
      return plan.features;
    }

    const planAny = plan as unknown as Record<string, unknown>;
    const raw = (planAny["Features"] ?? planAny["features"]) as unknown;
    if (typeof raw !== "string") return [];

    try {
      const obj = JSON.parse(raw) as Record<string, boolean>;
      return Object.entries(obj)
        .filter(([, v]) => v === true)
        .map(([k]) => k);
    } catch {
      return [];
    }
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
    if (res.data && typeof res.data === "object" && ("planName" in res.data || "subscriptionId" in res.data)) {
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

  /**
   * Get my subscription expiry status
   * GET /saas/subscriptions/my-expiry
   */
  async getMyExpiry(): Promise<{
    planName: string;
    expiryDate: string;
    daysRemaining: number;
    isExpired: boolean;
  } | null> {
    const res = await saasApi.get<
      ApiResponse<{
        planName: string;
        expiryDate: string;
        daysRemaining: number;
        isExpired: boolean;
      }> | null
    >("saas/subscriptions/my-expiry");

    if (res.data && "success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return null;
  },

  /**
   * Check & send email for expiring subscriptions (SuperAdmin)
   * POST /saas/subscriptions/check-expiry
   */
  async checkExpiry(days = 7): Promise<void> {
    // Backend naming differs across environments: days vs daysAhead.
    try {
      await saasApi.post(`saas/subscriptions/check-expiry?days=${days}`);
      return;
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      // Retry only on likely "wrong query param / route" cases.
      if (status && status >= 400 && status < 500) {
        await saasApi.post(`saas/subscriptions/check-expiry?daysAhead=${days}`);
        return;
      }
      throw err;
    }
  },

  /**
   * Get payment status by paymentId
   * GET /saas/payments/{paymentId}/status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const res = await saasApi.get<ApiResponse<PaymentStatus> | PaymentStatus>(
      `saas/payments/${paymentId}/status`,
    );

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as PaymentStatus;
  },
};

