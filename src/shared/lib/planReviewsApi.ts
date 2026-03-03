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
};

