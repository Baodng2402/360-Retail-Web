import { identityApi } from "./axios-instances";
import type { User } from "@/shared/types/auth";
import { JwtClaimTypes, UserStatus, type UserStatusType } from "@/shared/types/jwt-claims";
import type { SubscriptionStatus } from "@/shared/types/subscription";
import type { ApiResponse } from "@/shared/types/api-response";

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

export interface VerifyEmailDto {
  email: string;
  otpCode: string;
}

export interface ResendOtpDto {
  email: string;
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

export interface CreateStoreTrialDto {
  storeName: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  mustChangePassword: boolean;
}

export interface ExternalAuthResponse {
  accessToken: string;
  expiresAt: string;
  isNewUser: boolean;
  email: string;
  profilePictureUrl?: string;
}

export interface Claim {
  type: string;
  value: string;
}

interface DecodedToken {
  sub?: string;
  store_id?: string;
  store_role?: string;
  status?: string;
  trial_expired?: string;
  trial_end_date?: string;
  trial_days_remaining?: string;
  subscription_expired?: string;
  email?: string;
  role?: string;
  [key: string]: string | undefined;
}

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = atob(base64);
  return decodeURIComponent(
    decoded.split("").map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""),
  );
}

function decodeJwtToken(token: string): DecodedToken {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }
    const payload = JSON.parse(base64UrlDecode(parts[1])) as DecodedToken;
    return payload;
  } catch {
    console.error("Failed to decode JWT token");
    return {};
  }
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

interface ExtendedUser extends User {
  storeId?: string;
  storeRole?: string;
  status?: UserStatusType;
  trialExpired?: boolean;
  trialEndDate?: string;
  trialDaysRemaining?: number;
  subscriptionExpired?: boolean;
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

  /**
   * Request a password reset code to be sent to user's email
   * POST /identity/auth/forgot-password
   */
  async requestPasswordReset(payload: ForgotPasswordDto): Promise<string | undefined> {
    const res = await identityApi.post<{ message?: string } | ApiResponse<unknown>>(
      "identity/auth/forgot-password",
      payload,
    );

    if ("success" in res.data) {
      return res.data.message;
    }

    return res.data?.message;
  },

  /**
   * Reset password using email + 6-digit code + new password
   * POST /identity/auth/reset-password
   */
  async resetPassword(payload: ResetPasswordDto): Promise<string | undefined> {
    const res = await identityApi.post<{ message?: string } | ApiResponse<unknown>>(
      "identity/auth/reset-password",
      payload,
    );

    if ("success" in res.data) {
      return res.data.message;
    }

    return res.data?.message;
  },

  /**
   * Verify email with 6-digit OTP code
   * POST /identity/auth/verify-email
   */
  async verifyEmail(payload: VerifyEmailDto): Promise<string | undefined> {
    const res = await identityApi.post<{ message?: string } | ApiResponse<unknown>>(
      "identity/auth/verify-email",
      payload,
    );

    if ("success" in res.data) {
      return res.data.message;
    }

    return res.data?.message;
  },

  /**
   * Resend verification OTP code to email
   * POST /identity/auth/resend-otp
   */
  async resendOtp(payload: ResendOtpDto): Promise<string | undefined> {
    const res = await identityApi.post<{ message?: string } | ApiResponse<unknown>>(
      "identity/auth/resend-otp",
      payload,
    );

    if ("success" in res.data) {
      return res.data.message;
    }

    return res.data?.message;
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

  /**
   * Get current user info with subscription details from token claims
   * This decodes the JWT token to get subscription status without API call
   */
  async meWithSubscription(): Promise<ExtendedUser> {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    const decoded = decodeJwtToken(token);

    const getClaim = (type: string) => decoded[type] ?? "";
    const getStandardClaim = (type: string) =>
      decoded[type] ||
      decoded[`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/${type}`] ||
      decoded[`http://schemas.microsoft.com/ws/2008/06/identity/claims/${type}`] ||
      "";

    const id = getStandardClaim("nameidentifier") || getClaim("sub");
    const email =
      getStandardClaim("emailaddress") || getClaim("email") || "";
    const role = getStandardClaim("role") || getClaim("role") || "";

    // Generate name from email if not available
    const name = email ? email.split("@")[0] : id;

    const statusValue = getClaim(JwtClaimTypes.Status);
    const validStatuses = Object.values(UserStatus) as string[];
    const status = validStatuses.includes(statusValue || "")
      ? (statusValue as UserStatusType)
      : UserStatus.Registered;

    const trialExpiredValue = getClaim(JwtClaimTypes.TrialExpired);
    const trialExpired =
      trialExpiredValue?.toLowerCase() === "true" ||
      trialExpiredValue === "True";

    const trialDaysRemaining = getClaim(JwtClaimTypes.TrialDaysRemaining);
    const parsedDaysRemaining = trialDaysRemaining
      ? parseInt(trialDaysRemaining, 10)
      : null;

    const storeId = getClaim(JwtClaimTypes.StoreId) || undefined;
    const storeRole = getClaim(JwtClaimTypes.StoreRole) || undefined;

    return {
      id,
      email,
      role,
      name,
      storeId,
      storeRole,
      status,
      trialExpired,
      trialEndDate: getClaim(JwtClaimTypes.TrialEndDate) || undefined,
      trialDaysRemaining:
        parsedDaysRemaining !== null && !isNaN(parsedDaysRemaining)
          ? parsedDaysRemaining
          : undefined,
      subscriptionExpired:
        getClaim(JwtClaimTypes.SubscriptionExpired)?.toLowerCase() === "true" ||
        getClaim(JwtClaimTypes.SubscriptionExpired) === "True" ||
        false,
    };
  },

  /**
   * Decode token to get current subscription status
   * Useful for quick client-side checks without API call
   */
  getSubscriptionStatusFromToken(): ExtendedUser["status"] {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    try {
      const decoded = decodeJwtToken(token);
      const statusValue = decoded[JwtClaimTypes.Status];

      const validStatuses = Object.values(UserStatus) as string[];
      if (validStatuses.includes(statusValue || "")) {
        return statusValue as UserStatusType;
      }
    } catch {
      console.error("Failed to decode token");
    }

    return undefined;
  },

  /**
   * Check if trial has expired from token
   */
  isTrialExpiredFromToken(): boolean {
    const token = localStorage.getItem("token");
    if (!token) return true;

    try {
      const decoded = decodeJwtToken(token);
      const trialExpired = decoded[JwtClaimTypes.TrialExpired];
      return trialExpired?.toLowerCase() === "true";
    } catch {
      return true;
    }
  },

  async assignStore(payload: AssignStoreDto): Promise<void> {
    await identityApi.post("identity/auth/assign-store", payload);
  },

  async loginWithGoogle(idToken: string): Promise<ExternalAuthResponse> {
    const res = await identityApi.post<
      ExternalAuthResponse | { success: boolean; data: ExternalAuthResponse }
    >("identity/auth/external", { provider: "Google", idToken });
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    if ("accessToken" in res.data) {
      return res.data as ExternalAuthResponse;
    }
    throw new Error("Invalid external auth response format");
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
  async checkStoreTrial(): Promise<SubscriptionStatus> {
    const res = await identityApi.get<SubscriptionStatus>(
      "identity/subscription/status",
    );
    return res.data;
  },

  async createStoreTrial(payload: CreateStoreTrialDto): Promise<void> {
    await identityApi.post("identity/subscription/start-trial", payload);
  },
};
