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
};

