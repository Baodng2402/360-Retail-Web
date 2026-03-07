import { identityApi } from "./axios-instances";
import type { ApiResponse } from "@/shared/types/api-response";

export interface UserStore {
    storeId: string;
    storeName: string;
    roleInStore: string;
    isDefault: boolean;
}

export const userStoresApi = {
    /**
     * Get list of stores the current user belongs to.
     * GET /identity/user-stores/stores-my
     * Backend có thể chưa có endpoint này → 404; khi đó trả [] để StoreSelector fallback sang getMyStore().
     */
    async getMyStores(): Promise<UserStore[]> {
        try {
            const res = await identityApi.get<ApiResponse<UserStore[]> | UserStore[]>(
                "identity/user-stores/stores-my",
            );

            if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
                return res.data.data;
            }
            if (Array.isArray(res.data)) {
                return res.data;
            }
            return [];
        } catch (err) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 404) {
                return [];
            }
            throw err;
        }
    },
};
