import { saasApi } from "./axios-instances";
import type { ApiResponse } from "@/shared/types/api-response";

export interface ChatbotAnswer {
  answer: string;
  source: string;
  timestamp: string;
}

export interface ChatbotSuggestion {
  text: string;
  question: string;
}

export const chatbotApi = {
  async ask(question: string): Promise<ChatbotAnswer> {
    const res = await saasApi.post<ApiResponse<ChatbotAnswer> | ChatbotAnswer>(
      "saas/chatbot/ask",
      { question },
    );

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }

    return res.data as ChatbotAnswer;
  },

  async getSuggestions(): Promise<ChatbotSuggestion[]> {
    const res = await saasApi.get<
      ApiResponse<ChatbotSuggestion[]> | ChatbotSuggestion[]
    >("saas/chatbot/suggestions");

    if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }

    if (Array.isArray(res.data)) {
      return res.data;
    }

    return [];
  },
};

