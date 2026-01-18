import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Store } from "@/shared/types/stores";
import { authApi } from "@/shared/lib/authApi";
import { useAuthStore } from "./authStore";

interface StoreState {
  currentStore: Store | null;
  setCurrentStore: (store: Store) => void;
  clearStore: () => void;
  switchStore: (store: Store) => Promise<void>;
}

export const useStoreStore = create<StoreState>()(
  persist(
    (set) => ({
      currentStore: null,
      setCurrentStore: (store: Store) => {
        set({ currentStore: store });
      },
      clearStore: () => {
        set({ currentStore: null });
      },
      switchStore: async (store: Store) => {
        try {
          // Refresh access token for the new store
          const refreshRes = await authApi.refreshAccess(store.id);
          if (refreshRes.accessToken) {
            // Update token in localStorage
            localStorage.setItem("token", refreshRes.accessToken);
            // Update auth store
            const authStore = useAuthStore.getState();
            if (authStore.user) {
              authStore.setAuth(authStore.user, refreshRes.accessToken);
            }
            // Update current store
            set({ currentStore: store });
          }
        } catch (error) {
          console.error("Failed to switch store:", error);
          throw error;
        }
      },
    }),
    {
      name: "store-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
