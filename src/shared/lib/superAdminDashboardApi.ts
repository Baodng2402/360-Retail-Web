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

export type SuperAdminFunnelPoint = {
  date: string;
  landingPageViews: number;
  signups: number;
  conversionRate?: number;
};

export type SuperAdminFunnel = {
  landing: number;
  signup: number;
  conversionRate?: number;
  points?: SuperAdminFunnelPoint[];
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

const unwrapMaybeData = <T>(raw: unknown): T => {
  const unwrapped = unwrap(raw as ApiResponse<T> | T);
  if (
    unwrapped &&
    typeof unwrapped === "object" &&
    "data" in (unwrapped as Record<string, unknown>)
  ) {
    return ((unwrapped as unknown) as { data: T }).data;
  }
  return unwrapped as T;
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
    const data = unwrapMaybeData<Record<string, unknown>>(res.data);

    return {
      totalRevenue: toNum(data.totalRevenue ?? data.total_revenue),
      // Backend: monthlyRecurringRevenue
      mrr: toNum(
        data.monthlyRecurringRevenue ??
          data.monthly_recurring_revenue ??
          data.mrr ??
          data.MRR,
      ),
      activeStores: toNum(data.activeStores ?? data.active_stores),
      trialStores: toNum(data.trialStores ?? data.trial_stores),
      expiredStores: toNum(data.expiredStores ?? data.expired_stores),
      conversionRate: toNum(
        data.trialToPaidConversionRate ??
          data.trial_to_paid_conversion_rate ??
          data.conversionRate ??
          data.conversion_rate,
      ),
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
    const payload = unwrapMaybeData<unknown>(res.data);
    // Backend (documented): [{ date: "2026-01", revenue: 2500000 }]
    // Backward-compat: { dataPoints: [...] } or { points: [...] }
    const list =
      Array.isArray(payload)
        ? payload
        : ((payload as Record<string, unknown>)?.dataPoints ??
            (payload as Record<string, unknown>)?.points ??
            (payload as Record<string, unknown>)?.items);
    const dataPoints: SuperAdminRevenuePoint[] = Array.isArray(list)
      ? (list as unknown[]).map((p) => {
          const item = p as Record<string, unknown>;
          return {
            label: String(item.date ?? item.label ?? item.period ?? ""),
            revenue: toNum(item.revenue ?? item.totalRevenue ?? item.value),
            mrr: item.mrr != null ? toNum(item.mrr) : undefined,
          };
        })
      : [];

    return {
      dataPoints,
      totalRevenue:
        !Array.isArray(payload) && (payload as Record<string, unknown>)?.totalRevenue != null
          ? toNum((payload as Record<string, unknown>)?.totalRevenue)
          : undefined,
      groupBy:
        (!Array.isArray(payload) ? ((payload as Record<string, unknown>)?.groupBy as SuperAdminGroupBy | undefined) : undefined) ??
        params.groupBy,
    };
  },

  async getPlanDistribution(params?: { from?: string; to?: string }): Promise<SuperAdminPlanDistributionItem[]> {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    const qs = query.toString();
    const res = await saasApi.get<unknown>(
      `saas/super-admin/saas/dashboard/plan-distribution${qs ? `?${qs}` : ""}`,
    );
    const payload = unwrapMaybeData<unknown>(res.data);
    // Backend (documented): [{ planName, count }]
    // Backward-compat: { plans: [...] }
    const items = Array.isArray(payload)
      ? payload
      : (payload as Record<string, unknown>)?.plans;
    if (!Array.isArray(items)) return [];

    return (items as unknown[]).map((x) => {
      const item = x as Record<string, unknown>;
      return {
        planName: String(item.planName ?? item.name ?? item.plan ?? ""),
        count: toNum(item.count ?? item.total ?? item.value),
        percentage: item.percentage != null ? toNum(item.percentage) : undefined,
      };
    });
  },

  async getFunnelLandingToSignup(params?: { from?: string; to?: string }): Promise<SuperAdminFunnel> {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    const qs = query.toString();

    const res = await identityApi.get<unknown>(
      `identity/super-admin/users/stats/funnel/landing-to-signup${qs ? `?${qs}` : ""}`,
    );
    const payload = unwrapMaybeData<unknown>(res.data);
    // Backend (documented): [{ date, landingPageViews, signups, conversionRate }]
    const list = Array.isArray(payload)
      ? (payload as unknown[])
      : (payload as Record<string, unknown>)?.data;

    const points: SuperAdminFunnelPoint[] = Array.isArray(list)
      ? (list as unknown[]).map((x) => {
          const item = x as Record<string, unknown>;
          return {
            date: String(item.date ?? ""),
            landingPageViews: toNum(item.landingPageViews ?? item.landingViews ?? item.landing),
            signups: toNum(item.signups ?? item.signupCount ?? item.signup),
            conversionRate: item.conversionRate != null ? toNum(item.conversionRate) : undefined,
          };
        })
      : [];

    const landing = points.reduce((sum, p) => sum + (p.landingPageViews ?? 0), 0);
    const signup = points.reduce((sum, p) => sum + (p.signups ?? 0), 0);
    const conversionRate =
      landing > 0 ? (signup / landing) * 100 : undefined;

    return { landing, signup, conversionRate, points };
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

