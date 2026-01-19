import { saasApi } from "./axios-instances";
import type { Store } from "@/shared/types/store";

export const storeApi = {
  async createStore(payload: Store) {
    const res = await saasApi.post("/saas/saas/stores", payload);
    return res.data;
  },

  async getStore() {
    const res = await saasApi.get("/saas/saas/stores");
    return res.data;
  },
};
