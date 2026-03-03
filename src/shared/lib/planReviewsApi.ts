import { saasApi } from "./axios-instances";
import type { ApiResponse } from "@/shared/types/api-response";

export interface PlanReviewSummary {
  planId: string;
  planName: string;
  avgRating: number;
  totalReviews: number;
  distribution?: Record<string, number>;
}

export interface CreatePlanReviewRequest {
  planId: string;
  rating: number;
  content?: string;
}

export interface PlanReview {
  id: string;
  planId: string;
  planName: string;
  userId: string;
  storeId: string;
  storeName: string;
  rating: number;
  content?: string;
  createdAt: string;
}

export interface PlanReviewsAdminDashboard {
  overallAvgRating: number;
  totalReviews: number;
  reviewsThisMonth: number;
  planStats: {
    planId: string;
    planName: string;
    avgRating: number;
    totalReviews: number;
  }[];
}

export const planReviewsApi = {
  async getSummaries(): Promise<PlanReviewSummary[]> {
    const res = await saasApi.get<
      ApiResponse<PlanReviewSummary[]> | PlanReviewSummary[]
    >("saas/plan-reviews/summary");

    if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }

    if (Array.isArray(res.data)) {
      return res.data;
    }

    return [];
  },

  async createReview(payload: CreatePlanReviewRequest): Promise<void> {
    await saasApi.post("saas/plan-reviews", payload);
  },

  async getAdminDashboard(): Promise<PlanReviewsAdminDashboard | null> {
    const res = await saasApi.get<
      ApiResponse<PlanReviewsAdminDashboard> | PlanReviewsAdminDashboard
    >("saas/plan-reviews/admin/dashboard");
    if ("success" in res.data && res.data.success) {
      return res.data.data ?? null;
    }
    return res.data as PlanReviewsAdminDashboard;
  },

  async getAdminReviews(params?: {
    planId?: string;
    rating?: number;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: PlanReview[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.planId) query.append("planId", params.planId);
    if (params?.rating) query.append("rating", String(params.rating));
    query.append("page", String(params?.page ?? 1));
    query.append("pageSize", String(params?.pageSize ?? 20));
    const res = await saasApi.get<
      ApiResponse<{ items: PlanReview[]; total: number }> | PlanReview[]
    >(`saas/plan-reviews/admin?${query.toString()}`);

    if ("success" in res.data && res.data.success && res.data.data) {
      const data = res.data.data;
      if (Array.isArray(data)) {
        return { items: data, total: data.length };
      }
      return data;
    }

    if (Array.isArray(res.data)) {
      return { items: res.data as PlanReview[], total: res.data.length };
    }

    return { items: [], total: 0 };
  },

  async deleteReview(reviewId: string): Promise<void> {
    await saasApi.delete(`saas/plan-reviews/admin/${reviewId}`);
  },
};

