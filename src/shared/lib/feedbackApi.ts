import { crmApi } from "./axios-instances";
import type { ApiResponse } from "@/shared/types/api-response";

export interface PublicFeedbackRequest {
  customerId: string;
  storeId: string;
  rating: number;
  content?: string;
}

export interface Feedback {
  id: string;
  customerId: string;
  customerName: string;
  content: string;
  rating: number;
  source: string;
  createdAt: string;
}

export interface FeedbackSummary {
  avgRating: number;
  totalCount: number;
  distribution: Record<string, number>;
}

export interface FeedbackFilterParams {
  rating?: number;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface FeedbackPagedResult {
  items: Feedback[];
  page: number;
  pageSize: number;
  total: number;
}

export const feedbackApi = {
  async submitPublicFeedback(
    orderId: string,
    payload: PublicFeedbackRequest,
  ): Promise<Feedback> {
    const res = await crmApi.post<ApiResponse<Feedback> | Feedback>(
      `crm/feedback/public/${orderId}`,
      payload,
    );

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }

    return res.data as Feedback;
  },

  async getFeedback(
    params?: FeedbackFilterParams,
  ): Promise<FeedbackPagedResult> {
    const query = new URLSearchParams();
    if (params?.rating) query.append("rating", String(params.rating));
    if (params?.from) query.append("from", params.from);
    if (params?.to) query.append("to", params.to);
    query.append("page", String(params?.page ?? 1));
    query.append("pageSize", String(params?.pageSize ?? 20));

    const res = await crmApi.get<
      ApiResponse<{ data: Feedback[]; meta?: { page: number; pageSize: number; total: number } }> |
        ApiResponse<Feedback[]> |
        { data: Feedback[]; meta?: { page: number; pageSize: number; total: number } } |
        Feedback[]
    >(`crm/feedback?${query.toString()}`);

    if ("success" in res.data) {
      const apiRes = res.data as ApiResponse<
        | { data: Feedback[]; meta?: { page: number; pageSize: number; total: number } }
        | Feedback[]
      >;
      if (!apiRes.success || !apiRes.data) {
        return { items: [], page: 1, pageSize: 20, total: 0 };
      }
      if (Array.isArray(apiRes.data)) {
        return {
          items: apiRes.data,
          page: 1,
          pageSize: apiRes.data.length,
          total: apiRes.data.length,
        };
      }
      const { data, meta } = apiRes.data as {
        data: Feedback[];
        meta?: { page: number; pageSize: number; total: number };
      };
      return {
        items: data,
        page: meta?.page ?? 1,
        pageSize: meta?.pageSize ?? data.length,
        total: meta?.total ?? data.length,
      };
    }

    if (Array.isArray(res.data)) {
      const items = res.data as Feedback[];
      return { items, page: 1, pageSize: items.length, total: items.length };
    }

    if ("data" in res.data && Array.isArray((res.data as { data?: Feedback[] }).data)) {
      const anyRes = res.data as { data?: Feedback[]; meta?: { page: number; pageSize: number; total: number } };
      const items = anyRes.data ?? [];
      return {
        items,
        page: anyRes.meta?.page ?? 1,
        pageSize: anyRes.meta?.pageSize ?? items.length,
        total: anyRes.meta?.total ?? items.length,
      };
    }

    return { items: [], page: 1, pageSize: 20, total: 0 };
  },

  async getSummary(): Promise<FeedbackSummary | null> {
    const res = await crmApi.get<ApiResponse<FeedbackSummary> | FeedbackSummary>(
      "crm/feedback/summary",
    );

    if ("success" in res.data && res.data.success) {
      return res.data.data ?? null;
    }
    return res.data as FeedbackSummary;
  },
};
