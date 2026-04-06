import { identityApi } from "@/shared/lib/axios-instances";
import type { ApiResponse } from "@/shared/types/api-response";

export type SuperAdminUserStatus = "Active" | "Inactive" | "Suspended" | "Pending";

export type SuperAdminUserDto = {
  id: string;
  email: string;
  isActivated: boolean;
  status?: string;
  storeId?: string | null;
  roles?: string[];
};

export type SuperAdminCreateUserDto = {
  email: string;
  password: string;
  roleName: Exclude<string, "SuperAdmin">;
};

export type SuperAdminUpdateUserDto = {
  isActivated?: boolean;
  status?: string;
};

const unwrap = <T>(raw: ApiResponse<T> | T): T => {
  if (raw && typeof raw === "object" && "success" in raw) {
    return (raw as ApiResponse<T>).data as T;
  }
  return raw as T;
};

const toBool = (v: unknown, fallback: boolean) => {
  if (typeof v === "boolean") return v;
  return fallback;
};

export const superAdminUsersApi = {
  async list(): Promise<SuperAdminUserDto[]> {
    const res = await identityApi.get<unknown>("identity/super-admin/users");
    const raw = unwrap(res.data as ApiResponse<unknown> | unknown);
    if (!Array.isArray(raw)) return [];

    return raw
      .map((x) => x as Record<string, unknown>)
      .map((u) => ({
        id: String(u.id ?? ""),
        email: String(u.email ?? ""),
        isActivated: toBool(u.isActivated, true),
        status: u.status != null ? String(u.status) : undefined,
        storeId: u.storeId != null ? String(u.storeId) : null,
        roles: Array.isArray(u.roles) ? u.roles.map((r) => String(r)) : [],
      }))
      .filter((u) => u.id && u.email);
  },

  async get(id: string): Promise<SuperAdminUserDto | null> {
    const res = await identityApi.get<unknown>(`identity/super-admin/users/${id}`);
    const raw = unwrap(res.data as ApiResponse<unknown> | unknown) as Record<string, unknown>;
    if (!raw) return null;
    return {
      id: String(raw.id ?? id),
      email: String(raw.email ?? ""),
      isActivated: toBool(raw.isActivated, true),
      status: raw.status != null ? String(raw.status) : undefined,
      storeId: raw.storeId != null ? String(raw.storeId) : null,
      roles: Array.isArray(raw.roles) ? raw.roles.map((r) => String(r)) : [],
    };
  },

  async create(payload: SuperAdminCreateUserDto): Promise<SuperAdminUserDto> {
    const res = await identityApi.post<unknown>("identity/super-admin/users", payload);
    const raw = unwrap(res.data as ApiResponse<unknown> | unknown);
    if (!raw || typeof raw !== "object") {
      // Fallback: backend returned just id
      return {
        id: String(raw ?? ""),
        email: payload.email,
        isActivated: true,
        status: "Active",
        storeId: null,
        roles: [payload.roleName],
      };
    }
    const u = raw as Record<string, unknown>;
    return {
      id: String(u.id ?? ""),
      email: String(u.email ?? payload.email),
      isActivated: toBool(u.isActivated, true),
      status: u.status != null ? String(u.status) : "Active",
      storeId: u.storeId != null ? String(u.storeId) : null,
      roles: Array.isArray(u.roles) ? u.roles.map((r) => String(r)) : [payload.roleName],
    };
  },

  async update(id: string, payload: SuperAdminUpdateUserDto): Promise<void> {
    await identityApi.put(`identity/super-admin/users/${id}`, payload);
  },

  async remove(id: string): Promise<void> {
    await identityApi.delete(`identity/super-admin/users/${id}`);
  },
};

