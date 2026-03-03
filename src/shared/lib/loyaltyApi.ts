import { crmApi } from "./axios-instances";
import type { ApiResponse } from "@/shared/types/api-response";
import type {
  LoyaltyRule,
  CreateLoyaltyRuleDto,
  UpdateLoyaltyRuleDto,
} from "@/shared/types/loyalty";

export const loyaltyApi = {
  async getRules(): Promise<LoyaltyRule[]> {
    const res = await crmApi.get<ApiResponse<LoyaltyRule[]> | LoyaltyRule[]>(
      "crm/loyalty-rules",
    );

    if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  async createRule(payload: CreateLoyaltyRuleDto): Promise<LoyaltyRule> {
    const res = await crmApi.post<ApiResponse<LoyaltyRule> | LoyaltyRule>(
      "crm/loyalty-rules",
      payload,
    );

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as LoyaltyRule;
  },

  async updateRule(
    id: string,
    payload: UpdateLoyaltyRuleDto,
  ): Promise<LoyaltyRule> {
    const res = await crmApi.put<ApiResponse<LoyaltyRule> | LoyaltyRule>(
      `crm/loyalty-rules/${id}`,
      payload,
    );

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as LoyaltyRule;
  },

  async deleteRule(id: string): Promise<void> {
    await crmApi.delete(`crm/loyalty-rules/${id}`);
  },
};

