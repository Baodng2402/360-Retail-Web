import api from "./axios";
import type { User } from "@/shared/types/auth";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterUserDto {
  email: string;
  password: string;
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
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
  );
  const role = get(
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
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
    const res = await api.post<LoginResponse>("auth/login", payload);
    return res.data;
  },

  async register(payload: RegisterUserDto): Promise<string | void> {
    const res = await api.post<{ message?: string }>("auth/register", payload);
    return res.data?.message;
  },

  async me(): Promise<User> {
    const res = await api.get<Claim[]>("auth/me");
    return mapClaimsToUser(res.data);
  },
};

