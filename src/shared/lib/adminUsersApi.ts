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
    // Prefer new SuperAdmin gateway route; fallback to legacy /identity/admin/users.
    const tryPaths = ["identity/super-admin/users", "identity/admin/users"] as const;
    let lastError: unknown = null;

    for (const path of tryPaths) {
      try {
        const res = await identityApi.get<unknown>(path);

        const data = res.data as
          | ApiResponse<unknown>
          | unknown[];

        const items =
          data && typeof data === "object" && "success" in (data as object)
            ? (data as ApiResponse<unknown>).data
            : data;

        if (Array.isArray(items)) {
          // Normalize multiple shapes into AdminUser used by current UI.
          return items
            .map((raw) => {
              const u = raw as Record<string, unknown>;
              const roles = Array.isArray(u.roles)
                ? (u.roles as unknown[]).map((r) => String(r))
                : null;
              const role =
                typeof u.role === "string"
                  ? u.role
                  : roles?.[0] ?? "Unknown";
              const isActive =
                typeof u.isActive === "boolean"
                  ? u.isActive
                  : typeof u.isActivated === "boolean"
                    ? (u.isActivated as boolean)
                    : true;

              return {
                id: String(u.id ?? ""),
                email: String(u.email ?? ""),
                fullName: (u.fullName as string | null | undefined) ?? null,
                role,
                isActive,
                createdAt:
                  typeof u.createdAt === "string" ? u.createdAt : undefined,
              } satisfies AdminUser;
            })
            .filter((u) => u.id && u.email);
        }
        return [];
      } catch (e) {
        lastError = e;
      }
    }

    throw lastError;

  },

  /**
   * Get user detail by ID
   * GET /identity/admin/users/{id}
   */
  async getUserById(id: string): Promise<AdminUser> {
    const tryPaths = [
      `identity/super-admin/users/${id}`,
      `identity/admin/users/${id}`,
    ] as const;
    let lastError: unknown = null;

    for (const path of tryPaths) {
      try {
        const res = await identityApi.get<unknown>(path);
        const raw = res.data as ApiResponse<unknown> | unknown;
        const item =
          raw && typeof raw === "object" && "success" in (raw as object)
            ? (raw as ApiResponse<unknown>).data
            : raw;
        const u = (item ?? {}) as Record<string, unknown>;
        const roles = Array.isArray(u.roles)
          ? (u.roles as unknown[]).map((r) => String(r))
          : null;
        const role =
          typeof u.role === "string" ? u.role : roles?.[0] ?? "Unknown";
        const isActive =
          typeof u.isActive === "boolean"
            ? u.isActive
            : typeof u.isActivated === "boolean"
              ? (u.isActivated as boolean)
              : true;

        return {
          id: String(u.id ?? ""),
          email: String(u.email ?? ""),
          fullName: (u.fullName as string | null | undefined) ?? null,
          role,
          isActive,
          createdAt: typeof u.createdAt === "string" ? u.createdAt : undefined,
        };
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError;

  },

  /**
   * Create a new user (SuperAdmin)
   * POST /identity/admin/users
   */
  async createUser(data: CreateAdminUserDto): Promise<AdminUser> {
    // New API shape (SuperAdmin): { email, password, roleName }
    const payload = {
      email: data.email,
      password: data.password,
      roleName: data.role,
    };
    const tryPaths = ["identity/super-admin/users", "identity/admin/users"] as const;
    let lastError: unknown = null;

    for (const path of tryPaths) {
      try {
        const res = await identityApi.post<unknown>(path, payload);
        const raw = res.data as ApiResponse<unknown> | unknown;
        const item =
          raw && typeof raw === "object" && "success" in (raw as object)
            ? (raw as ApiResponse<unknown>).data
            : raw;

        // Some backends return id only; normalize for UI
        if (typeof item === "string") {
          return {
            id: item,
            email: data.email,
            fullName: data.fullName ?? null,
            role: data.role,
            isActive: true,
          };
        }

        const u = (item ?? {}) as Record<string, unknown>;
        return {
          id: String(u.id ?? ""),
          email: String(u.email ?? data.email),
          fullName: (u.fullName as string | null | undefined) ?? data.fullName ?? null,
          role: typeof u.role === "string" ? u.role : data.role,
          isActive: typeof u.isActive === "boolean" ? u.isActive : true,
        };
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError;

  },

  /**
   * Update a user (SuperAdmin)
   * PUT /identity/admin/users/{id}
   */
  async updateUser(id: string, data: UpdateAdminUserDto): Promise<AdminUser> {
    const tryPaths = [
      `identity/super-admin/users/${id}`,
      `identity/admin/users/${id}`,
    ] as const;
    let lastError: unknown = null;

    for (const path of tryPaths) {
      try {
        const res = await identityApi.put<unknown>(path, data);
        const raw = res.data as ApiResponse<unknown> | unknown;
        const item =
          raw && typeof raw === "object" && "success" in (raw as object)
            ? (raw as ApiResponse<unknown>).data
            : raw;
        if (!item) {
          // 204 No Content case: fetch detail (best-effort)
          return await this.getUserById(id);
        }
        const u = (item ?? {}) as Record<string, unknown>;
        return {
          id: String(u.id ?? id),
          email: String(u.email ?? ""),
          fullName: (u.fullName as string | null | undefined) ?? null,
          role: typeof u.role === "string" ? u.role : "Unknown",
          isActive: typeof u.isActive === "boolean" ? u.isActive : true,
        };
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError;
  },

  /**
   * Delete a user (SuperAdmin)
   * DELETE /identity/admin/users/{id}
   */
  async deleteUser(id: string): Promise<void> {
    const tryPaths = [
      `identity/super-admin/users/${id}`,
      `identity/admin/users/${id}`,
    ] as const;

    let lastError: unknown = null;
    for (const path of tryPaths) {
      try {
        await identityApi.delete(path);
        return;
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError;
  },
};

