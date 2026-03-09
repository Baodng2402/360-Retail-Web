import { identityApi, saasApi } from "@/shared/lib/axios-instances";
import type { ApiResponse } from "@/shared/types/api-response";

export type SuperAdminGroupBy = "day" | "week" | "month";

export type SuperAdminOverview = {
  totalRevenue: number;
  mrr: number;
  activeStores: number;
  trialStores: number;
  expiredStores: number;
  conversionRate: number; // 0..1 or 0..100 depending BE
};

export type SuperAdminRevenuePoint = {
  label: string;
  revenue: number;
  mrr?: number;
};

export type SuperAdminRevenueChart = {
  dataPoints: SuperAdminRevenuePoint[];
  totalRevenue?: number;
  groupBy?: SuperAdminGroupBy;
};

export type SuperAdminPlanDistributionItem = {
  planName: string;
  count: number;
  percentage?: number;
};

export type SuperAdminFunnel = {
  landing: number;
  signup: number;
  conversionRate?: number;
};

export type SuperAdminRegistrationsPoint = {
  label: string; // date label
  count: number;
};

const unwrap = <T>(raw: ApiResponse<T> | T): T => {
  if (raw && typeof raw === "object" && "success" in raw) {
    return (raw as ApiResponse<T>).data as T;
  }
  return raw as T;
};

const toNum = (v: unknown, fallback = 0) => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    return Number(v);
  }
  return fallback;
};

export const superAdminDashboardApi = {
  async getOverview(params?: { from?: string; to?: string }): Promise<SuperAdminOverview> {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    const qs = query.toString();
    const res = await saasApi.get<unknown>(
      `saas/super-admin/saas/dashboard/overview${qs ? `?${qs}` : ""}`,
    );
    const data = unwrap(
      res.data as ApiResponse<Record<string, unknown>> | Record<string, unknown>,
    );

    return {
      totalRevenue: toNum(data.totalRevenue ?? data.total_revenue),
      mrr: toNum(data.mrr ?? data.MRR),
      activeStores: toNum(data.activeStores ?? data.active_stores),
      trialStores: toNum(data.trialStores ?? data.trial_stores),
      expiredStores: toNum(data.expiredStores ?? data.expired_stores),
      conversionRate: toNum(data.conversionRate ?? data.conversion_rate),
    };
  },

  async getRevenueChart(params: {
    from?: string;
    to?: string;
    groupBy: SuperAdminGroupBy;
  }): Promise<SuperAdminRevenueChart> {
    const query = new URLSearchParams();
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    query.set("groupBy", params.groupBy);

    const res = await saasApi.get<unknown>(
      `saas/super-admin/saas/dashboard/revenue-chart?${query.toString()}`,
    );
    const raw = unwrap(
      res.data as ApiResponse<Record<string, unknown>> | Record<string, unknown>,
    );

    const points = (raw.dataPoints ?? raw.points ?? raw.items) as unknown;
    const dataPoints: SuperAdminRevenuePoint[] = Array.isArray(points)
      ? points.map((p) => {
          const item = p as Record<string, unknown>;
          return {
            label: String(item.label ?? item.date ?? item.period ?? ""),
            revenue: toNum(item.revenue ?? item.totalRevenue ?? item.value),
            mrr: item.mrr != null ? toNum(item.mrr) : undefined,
          };
        })
      : [];

    return {
      dataPoints,
      totalRevenue: raw.totalRevenue != null ? toNum(raw.totalRevenue) : undefined,
      groupBy: (raw.groupBy as SuperAdminGroupBy | undefined) ?? params.groupBy,
    };
  },

  async getPlanDistribution(params?: { from?: string; to?: string }): Promise<SuperAdminPlanDistributionItem[]> {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    const qs = query.toString();
    const res = await saasApi.get<ApiResponse<{ plans: unknown[]; totalStores?: unknown }> | { plans: unknown[]; totalStores?: unknown }>(
      `saas/super-admin/saas/dashboard/plan-distribution${qs ? `?${qs}` : ""}`,
    );
    const raw = unwrap(res.data);

    const items = raw?.plans;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((x) => {
      const item = x as Record<string, unknown>;
      return {
        planName: String(item.planName ?? item.name ?? item.plan ?? ""),
        count: toNum(item.count ?? item.total ?? item.value),
        percentage: item.percentage != null ? toNum(item.percentage) : undefined,
      };
    });
  },

  async getFunnelLandingToSignup(): Promise<SuperAdminFunnel> {
    const res = await identityApi.get<
      ApiResponse<{
        landingViews: unknown;
        signupCount: unknown;
        conversionRate?: unknown;
      }> | {
        landingViews: unknown;
        signupCount: unknown;
        conversionRate?: unknown;
      }
    >(
      "identity/super-admin/users/stats/funnel/landing-to-signup",
    );
    const raw = unwrap(res.data);

    return {
      landing: toNum(raw.landingViews),
      signup: toNum(raw.signupCount),
      conversionRate: raw.conversionRate != null ? toNum(raw.conversionRate) : undefined,
    };
  },

  async getRegistrations(params?: { from?: string; to?: string }): Promise<SuperAdminRegistrationsPoint[]> {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    const qs = query.toString();
    const res = await identityApi.get<
      ApiResponse<{ date: string; count: unknown }[]> | { date: string; count: unknown }[]
    >(
      `identity/super-admin/users/stats/registrations${qs ? `?${qs}` : ""}`,
    );
    const raw = unwrap(res.data);

    const items = raw;
    if (!Array.isArray(items)) return [];

    return items.map((x) => {
      const item = x as Record<string, unknown>;
      return {
        label: String(item.label ?? item.date ?? item.day ?? ""),
        count: toNum(item.count ?? item.value ?? item.total),
      };
    });
  },
};

