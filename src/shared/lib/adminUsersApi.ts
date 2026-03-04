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

export interface CreateAdminUserDto {
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  role: string;
}

export interface UpdateAdminUserDto {
  fullName?: string;
  phoneNumber?: string;
  role?: string;
  isActive?: boolean;
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

  /**
   * Get user detail by ID
   * GET /identity/admin/users/{id}
   */
  async getUserById(id: string): Promise<AdminUser> {
    const res = await identityApi.get<ApiResponse<AdminUser> | AdminUser>(
      `identity/admin/users/${id}`,
    );

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as AdminUser;
  },

  /**
   * Create a new user (SuperAdmin)
   * POST /identity/admin/users
   */
  async createUser(data: CreateAdminUserDto): Promise<AdminUser> {
    const res = await identityApi.post<ApiResponse<AdminUser> | AdminUser>(
      "identity/admin/users",
      data,
    );

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as AdminUser;
  },

  /**
   * Update a user (SuperAdmin)
   * PUT /identity/admin/users/{id}
   */
  async updateUser(id: string, data: UpdateAdminUserDto): Promise<AdminUser> {
    const res = await identityApi.put<ApiResponse<AdminUser> | AdminUser>(
      `identity/admin/users/${id}`,
      data,
    );

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as AdminUser;
  },

  /**
   * Delete a user (SuperAdmin)
   * DELETE /identity/admin/users/{id}
   */
  async deleteUser(id: string): Promise<void> {
    await identityApi.delete(`identity/admin/users/${id}`);
  },
};

