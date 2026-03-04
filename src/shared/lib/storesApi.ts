import { saasApi } from "./axios-instances";
import type {
  Store,
  CreateStoreDto,
  UpdateStoreDto,
  StoreCreateResponse,
} from "@/shared/types/stores";
import type { ApiResponse } from "@/shared/types/api-response";

export const storesApi = {
  async getStores(includeInactive?: boolean): Promise<Store[]> {
    const queryParams = new URLSearchParams();
    if (includeInactive !== undefined) {
      queryParams.append("includeInactive", includeInactive.toString());
    }
    const url = `saas/stores${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const res = await saasApi.get<ApiResponse<Store[]> | Store[]>(url);

    if (
      "success" in res.data &&
      res.data.success &&
      Array.isArray(res.data.data)
    ) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  async getMyOwnedStores(includeInactive?: boolean): Promise<Store[]> {
    const queryParams = new URLSearchParams();
    if (includeInactive !== undefined) {
      queryParams.append("includeInactive", includeInactive.toString());
    }
    const url = `saas/stores/my-owned-stores${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const res = await saasApi.get<ApiResponse<Store[]> | Store[]>(url);

    if (
      "success" in res.data &&
      res.data.success &&
      Array.isArray(res.data.data)
    ) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  async getMyStore(): Promise<Store> {
    const res = await saasApi.get<ApiResponse<Store> | Store>(
      "saas/stores/my-store",
    );

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Store;
  },

  async getStoreById(id: string): Promise<Store> {
    const res = await saasApi.get<Store[] | ApiResponse<Store> | Store>(
      `saas/stores/${id}`,
    );

    if (Array.isArray(res.data)) {
      return res.data[0];
    }
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Store;
  },

  async createStore(data: CreateStoreDto): Promise<StoreCreateResponse> {
    const res = await saasApi.post<
      Store | ApiResponse<Store> | StoreCreateResponse | ApiResponse<StoreCreateResponse>
    >("saas/stores", {
      storeName: data.storeName,
      address: data.address,
      phone: data.phone,
      planId: data.planId,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    const body = res.data as
      | Store
      | ApiResponse<Store>
      | StoreCreateResponse
      | ApiResponse<StoreCreateResponse>;

    // Case 1: Gateway-style ApiResponse<StoreCreateResponse>
    if ("success" in body && body.success && body.data) {
      const payload = body.data as StoreCreateResponse;
      if ("store" in payload) {
        return payload;
      }
      // Older format ApiResponse<Store>
      return { store: payload as unknown as Store };
    }

    // Case 2: Direct StoreCreateResponse from backend
    if ("store" in body) {
      return body as StoreCreateResponse;
    }

    // Case 3: Fallback legacy: plain Store
    const legacyStore = body as Store;
    return { store: legacyStore };
  },

  async updateStore(id: string, data: UpdateStoreDto): Promise<Store> {
    const res = await saasApi.put<ApiResponse<Store> | Store>(
      `saas/stores/${id}`,
      {
        storeName: data.storeName,
        address: data.address,
        phone: data.phone,
        isActive: data.isActive,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    );

    if (res.data) {
      if ("success" in res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
      if ("id" in res.data && "storeName" in res.data) {
        return res.data as Store;
      }
    }

    const getStoreById = async (storeId: string): Promise<Store> => {
      try {
        const storeRes = await saasApi.get<
          Store[] | ApiResponse<Store> | Store
        >(`saas/stores/${storeId}`);
        if (Array.isArray(storeRes.data)) {
          return storeRes.data[0];
        }
        if (
          "success" in storeRes.data &&
          storeRes.data.success &&
          storeRes.data.data
        ) {
          return storeRes.data.data;
        }
        return storeRes.data as Store;
      } catch {
        return {
          id,
          storeName: data.storeName || "",
          address: data.address || undefined,
          phone: data.phone || undefined,
          isActive: data.isActive ?? true,
          createdAt: new Date().toISOString(),
          isDefault: false,
        } as Store;
      }
    };

    const updatedStore = await getStoreById(id);
    return updatedStore;
  },

  async deleteStore(id: string): Promise<void> {
    const getStoreByIdRes = await saasApi.get<
      Store[] | ApiResponse<Store> | Store
    >(`saas/stores/${id}`);
    let currentStore: Store;
    if (Array.isArray(getStoreByIdRes.data)) {
      currentStore = getStoreByIdRes.data[0];
    } else if (
      "success" in getStoreByIdRes.data &&
      getStoreByIdRes.data.success &&
      getStoreByIdRes.data.data
    ) {
      currentStore = getStoreByIdRes.data.data;
    } else {
      currentStore = getStoreByIdRes.data as Store;
    }

    await saasApi.put(`saas/stores/${id}`, {
      storeName: currentStore.storeName,
      address: currentStore.address || "",
      phone: currentStore.phone || "",
      isActive: false,
    });
  },
};
