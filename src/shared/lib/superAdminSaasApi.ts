import { saasApi } from "@/shared/lib/axios-instances";
import type { ApiResponse } from "@/shared/types/api-response";

const unwrap = <T>(raw: ApiResponse<T> | T): T => {
  if (raw && typeof raw === "object" && "success" in raw) {
    return (raw as ApiResponse<T>).data as T;
  }
  return raw as T;
};

const toNum = (v: unknown, fallback = 0) => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return fallback;
};

export type SuperAdminPlan = {
  id: string;
  planName: string;
  price: number;
  durationDays: number;
  features?: string | null;
  isActive: boolean;
  createdAt?: string | null;
  activeSubscriptions?: number;
  totalSubscriptions?: number;
};

export type SuperAdminCreatePlanDto = {
  planName: string;
  price: number;
  durationDays: number;
  features?: string | null;
};

export type SuperAdminUpdatePlanDto = Partial<SuperAdminCreatePlanDto> & {
  isActive?: boolean;
};

export type SuperAdminExtendSubscriptionResult = {
  oldEndDate?: string | null;
  newEndDate?: string | null;
};

export const superAdminSaasApi = {
  // Plans (CRUD)
  async listPlans(): Promise<SuperAdminPlan[]> {
    const res = await saasApi.get<unknown>("saas/super-admin/saas/plans");
    const raw = unwrap(res.data as ApiResponse<unknown> | unknown);
    const list = (raw as { data?: unknown }).data ?? raw;
    if (!Array.isArray(list)) return [];
    return list
      .map((x) => x as Record<string, unknown>)
      .map((p) => ({
        id: String(p.id ?? ""),
        planName: String(p.planName ?? p.name ?? ""),
        price: toNum(p.price),
        durationDays: toNum(p.durationDays ?? p.duration_days),
        features: (p.features ?? null) as string | null,
        isActive: Boolean(p.isActive ?? p.is_active ?? true),
        createdAt: (p.createdAt ?? null) as string | null,
        activeSubscriptions: p.activeSubscriptions != null ? toNum(p.activeSubscriptions) : undefined,
      }))
      .filter((p) => p.id && p.planName);
  },

  async getPlan(id: string): Promise<SuperAdminPlan | null> {
    const res = await saasApi.get<unknown>(`saas/super-admin/saas/plans/${id}`);
    const raw = unwrap(res.data as ApiResponse<unknown> | unknown);
    const obj = (raw as { data?: unknown }).data ?? raw;
    if (!obj || typeof obj !== "object") return null;
    const p = obj as Record<string, unknown>;
    return {
      id: String(p.id ?? id),
      planName: String(p.planName ?? p.name ?? ""),
      price: toNum(p.price),
      durationDays: toNum(p.durationDays ?? p.duration_days),
      features: (p.features ?? null) as string | null,
      isActive: Boolean(p.isActive ?? p.is_active ?? true),
      createdAt: (p.createdAt ?? null) as string | null,
      activeSubscriptions: p.activeSubscriptions != null ? toNum(p.activeSubscriptions) : undefined,
      totalSubscriptions: p.totalSubscriptions != null ? toNum(p.totalSubscriptions) : undefined,
    };
  },

  async createPlan(payload: SuperAdminCreatePlanDto): Promise<SuperAdminPlan> {
    const res = await saasApi.post<unknown>("saas/super-admin/saas/plans", payload);
    const raw = unwrap(res.data as ApiResponse<unknown> | unknown);
    const obj = (raw as { data?: unknown }).data ?? raw;
    const p = obj as Record<string, unknown>;
    return {
      id: String(p.id ?? ""),
      planName: String(p.planName ?? payload.planName),
      price: toNum(p.price ?? payload.price),
      durationDays: toNum(p.durationDays ?? payload.durationDays),
      features: (p.features ?? payload.features ?? null) as string | null,
      isActive: Boolean(p.isActive ?? true),
      createdAt: (p.createdAt ?? null) as string | null,
      activeSubscriptions: p.activeSubscriptions != null ? toNum(p.activeSubscriptions) : undefined,
    };
  },

  async updatePlan(id: string, payload: SuperAdminUpdatePlanDto): Promise<SuperAdminPlan | null> {
    const res = await saasApi.put<unknown>(`saas/super-admin/saas/plans/${id}`, payload);
    const raw = unwrap(res.data as ApiResponse<unknown> | unknown);
    const obj = (raw as { data?: unknown }).data ?? raw;
    if (!obj || typeof obj !== "object") return null;
    const p = obj as Record<string, unknown>;
    return {
      id: String(p.id ?? id),
      planName: String(p.planName ?? ""),
      price: toNum(p.price),
      durationDays: toNum(p.durationDays),
      features: (p.features ?? null) as string | null,
      isActive: Boolean(p.isActive ?? true),
      createdAt: (p.createdAt ?? null) as string | null,
      activeSubscriptions: p.activeSubscriptions != null ? toNum(p.activeSubscriptions) : undefined,
      totalSubscriptions: p.totalSubscriptions != null ? toNum(p.totalSubscriptions) : undefined,
    };
  },

  async deactivatePlan(id: string): Promise<void> {
    await saasApi.delete(`saas/super-admin/saas/plans/${id}`);
  },

  // Dashboard lists
  async listDashboardStores(): Promise<Record<string, unknown>[]> {
    const res = await saasApi.get<unknown>("saas/super-admin/saas/dashboard/stores");
    const raw = unwrap(res.data as ApiResponse<unknown> | unknown);
    const list = (raw as { data?: unknown }).data ?? raw;
    return Array.isArray(list) ? (list as Record<string, unknown>[]) : [];
  },

  async listDashboardSubscriptions(params?: { status?: string; planId?: string }): Promise<Record<string, unknown>[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.planId) query.set("planId", params.planId);
    const qs = query.toString();
    const res = await saasApi.get<unknown>(
      `saas/super-admin/saas/dashboard/subscriptions${qs ? `?${qs}` : ""}`,
    );
    const raw = unwrap(res.data as ApiResponse<unknown> | unknown);
    const list = (raw as { data?: unknown }).data ?? raw;
    return Array.isArray(list) ? (list as Record<string, unknown>[]) : [];
  },

  async listDashboardPayments(params?: {
    status?: string;
    from?: string;
    to?: string;
  }): Promise<Record<string, unknown>[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    const qs = query.toString();
    const res = await saasApi.get<unknown>(
      `saas/super-admin/saas/dashboard/payments${qs ? `?${qs}` : ""}`,
    );
    const raw = unwrap(res.data as ApiResponse<unknown> | unknown);
    const list = (raw as { data?: unknown }).data ?? raw;
    return Array.isArray(list) ? (list as Record<string, unknown>[]) : [];
  },

  // Subscription actions
  async cancelSubscription(id: string): Promise<void> {
    await saasApi.put(`saas/super-admin/saas/dashboard/subscriptions/${id}/cancel`);
  },

  async extendSubscription(id: string, days: number): Promise<SuperAdminExtendSubscriptionResult | null> {
    const res = await saasApi.put<unknown>(
      `saas/super-admin/saas/dashboard/subscriptions/${id}/extend`,
      { days },
    );
    const raw = unwrap(res.data as ApiResponse<unknown> | unknown);
    const obj = (raw as { data?: unknown }).data ?? raw;
    if (!obj || typeof obj !== "object") return null;
    const r = obj as Record<string, unknown>;
    return {
      oldEndDate: (r.oldEndDate ?? null) as string | null,
      newEndDate: (r.newEndDate ?? null) as string | null,
    };
  },
};

