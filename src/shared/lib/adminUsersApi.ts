import { identityApi } from "./axios-instances";
import type { ApiResponse } from "@/shared/types/api-response";

export interface AdminUser {
  id: string;
  email: string;
  fullName?: string | null;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

export const adminUsersApi = {
  async getUsers(): Promise<AdminUser[]> {
    const res = await identityApi.get<ApiResponse<AdminUser[]> | AdminUser[]>(
      "identity/admin/users",
    );

    if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },
};

