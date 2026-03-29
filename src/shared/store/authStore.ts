import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/shared/types/auth";
import type { ExtendedUser } from "@/shared/lib/authApi";
import type { UserStatusType } from "@/shared/types/jwt-claims";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status?: UserStatusType;
  storeId?: string;
  storeRole?: string;

  setAuth: (user: User, token: string) => void;
  setAuthFromToken: (user: ExtendedUser, token: string) => void;
  setUser: (user: User) => void;
  setStatus: (status: UserStatusType) => void;
  setStore: (storeId: string, storeRole: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      status: undefined,
      storeId: undefined,
      storeRole: undefined,

      setAuth: (user: User, token: string) => {
        localStorage.setItem("token", token);
        set({ user, token, isAuthenticated: true });
      },

      setAuthFromToken: (user: ExtendedUser, token: string) => {
        localStorage.setItem("token", token);
        set({
          user,
          token,
          isAuthenticated: true,
          status: user.status,
          storeId: user.storeId,
          storeRole: user.storeRole,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setStatus: (status: UserStatusType) => {
        set({ status });
      },

      setStore: (storeId: string, storeRole: string) => {
        set({ storeId, storeRole });
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("auth-storage"); // clear persisted auth state to prevent rehydration issues
        sessionStorage.removeItem("pendingGoogleNewUser");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          status: undefined,
          storeId: undefined,
          storeRole: undefined,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

