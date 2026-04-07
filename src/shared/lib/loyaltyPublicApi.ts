import { crmApi } from "@/shared/lib/axios-instances";
import i18next from "@/i18n";
import type { ApiResponse } from "@/shared/types/api-response";

export type LoyaltyPublicCheckResult = {
  customerName: string;
  totalPoints: number;
  rank: string;
};

type LoyaltyPublicCheckResponse =
  | ApiResponse<LoyaltyPublicCheckResult>
  | {
      success: boolean;
      data?: LoyaltyPublicCheckResult;
      message?: string;
    }
  | LoyaltyPublicCheckResult;

const unwrap = (raw: LoyaltyPublicCheckResponse): LoyaltyPublicCheckResult => {
  if (raw && typeof raw === "object" && "success" in raw) {
    const r = raw as ApiResponse<LoyaltyPublicCheckResult> & {
      message?: string;
      data?: LoyaltyPublicCheckResult;
    };
    if (r.success && r.data) return r.data;
    throw new Error(r.message || i18next.t("common:toast.loyaltyLookupError"));
  }
  return raw as LoyaltyPublicCheckResult;
};

export const loyaltyPublicApi = {
  async check(params: {
    phone: string;
    storeId: string;
  }): Promise<LoyaltyPublicCheckResult> {
    const res = await crmApi.get<LoyaltyPublicCheckResponse>("crm/loyalty/check", {
      params: {
        phone: params.phone,
        storeId: params.storeId,
      },
    });
    return unwrap(res.data);
  },
};

