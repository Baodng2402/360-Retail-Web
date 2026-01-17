import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Store } from "@/shared/types/stores";

interface StoreState {
  currentStore: Store | null;
  setCurrentStore: (store: Store) => void;
  clearStore: () => void;
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
    }),
    {
      name: "store-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
