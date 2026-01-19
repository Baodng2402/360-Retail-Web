import { identityApi } from "./axios-instances";
import type { User } from "@/shared/types/auth";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterUserDto {
  email: string;
  password: string;
}

export interface AssignStoreDto {
  storeId: string;
  roleInStore?: string;
  isDefault?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  mustChangePassword: boolean;
}

export interface Claim {
  type: string;
  value: string;
}

function mapClaimsToUser(claims: Claim[]): User {
  const get = (type: string) =>
    claims.find((c) => c.type === type)?.value ?? "";

  const id =
    get("id") ||
    get("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
  const email = get(
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  );
  const role = get(
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  );

  const name = email ? email.split("@")[0] : id;

  return {
    id,
    email,
    role,
    name,
  };
}

export const authApi = {
  async login(payload: LoginDto): Promise<LoginResponse> {
    const res = await identityApi.post<
      LoginResponse | { success: boolean; data: LoginResponse }
    >("identity/auth/login", payload);
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    if ("accessToken" in res.data) {
      return res.data as LoginResponse;
    }
    throw new Error("Invalid login response format");
  },

  async register(payload: RegisterUserDto): Promise<string | void> {
    const res = await identityApi.post<{ message?: string }>(
      "identity/auth/register",
      payload,
    );
    return res.data?.message;
  },

  async me(): Promise<User> {
    const res = await identityApi.get<Claim[]>("identity/auth/me");
    return mapClaimsToUser(res.data);
  },

  async assignStore(payload: AssignStoreDto): Promise<void> {
    await identityApi.post("identity/auth/assign-store", payload);
  },

  async refreshAccess(storeId?: string): Promise<LoginResponse> {
    const queryParams = storeId ? `?storeId=${storeId}` : "";
    const res = await identityApi.post<
      LoginResponse | { success: boolean; data: LoginResponse }
    >(`identity/auth/refresh-access${queryParams}`);
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    if ("accessToken" in res.data) {
      return res.data as LoginResponse;
    }
    throw new Error("Invalid refresh access response format");
  },

  async changePassword(payload: {
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  }): Promise<void> {
    await identityApi.post("identity/auth/change-password", payload);
  },
};
