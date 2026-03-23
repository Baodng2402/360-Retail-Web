/**
 * JWT Claim Types Constants
 * Avoid magic strings and provide type safety for JWT claims
 */

// Core claim types
export const JwtClaimTypes = {
  Subject: "sub",
  Issuer: "iss",
  Audience: "aud",
  Expiration: "exp",
  NotBefore: "nbf",
  IssuedAt: "iat",
  JwtId: "jti",

  StoreId: "store_id",
  StoreRole: "store_role",
  Status: "status",
  TrialExpired: "trial_expired",
  TrialEndDate: "trial_end_date",
  TrialDaysRemaining: "trial_days_remaining",
  SubscriptionExpired: "subscription_expired",
  SubscriptionEndDate: "subscription_end_date",
} as const;

export type JwtClaimType = (typeof JwtClaimTypes)[keyof typeof JwtClaimTypes];

/**
 * User Status - matches backend UserStatus
 */
export const UserStatus = {
  Registered: "Registered",
  Active: "Active",
  Trial: "Trial",
  Inactive: "Inactive",
  Suspended: "Suspended",
} as const;

export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus];

/**
 * Check if user status indicates active subscription
 */
export const isActiveSubscription = (status: string): boolean => {
  return status === UserStatus.Active;
};

/**
 * Check if user is in trial period
 */
export const isTrial = (status: string): boolean => {
  return status === UserStatus.Trial;
};

/**
 * Check if trial has expired
 */
export const isTrialExpired = (trialExpired: string | boolean): boolean => {
  if (typeof trialExpired === "boolean") return trialExpired;
  return trialExpired.toLowerCase() === "true";
};

/**
 * Parse days remaining from claim
 */
export const parseDaysRemaining = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Check if user is a PotentialOwner (newly registered, no store)
 */
export const isPotentialOwner = (role?: string | null): boolean => {
  if (!role) return false;
  return role === "PotentialOwner";
};

/**
 * Check if user has a store (is StoreOwner, Manager, Staff)
 */
export const hasStore = (storeId?: string | null): boolean => {
  return !!storeId && storeId.length > 0;
};

/**
 * Get redirect path based on user status and store ownership
 * Backend flow:
 * - Registered/PotentialOwner -> redirect to /create-store (start trial)
 * - Trial/Active with store -> redirect to /dashboard
 */
export const getRedirectPathByAuthState = (params: {
  role?: string | null;
  status?: UserStatusType | string | null;
  storeId?: string | null;
}): string => {
  const { role, status, storeId } = params;

  // User chưa start trial (PotentialOwner)
  if (role === "PotentialOwner" || status === UserStatus.Registered) {
    return "/create-store";
  }

  // User đã có store (Trial hoặc Active)
  if (hasStore(storeId)) {
    return "/dashboard";
  }

  // Fallback - không có store
  return "/create-store";
};

/**
 * Role hierarchy for determining access level
 */
export const RoleHierarchy: Record<string, number> = {
  SuperAdmin: 100,
  StoreOwner: 50,
  Manager: 40,
  Staff: 30,
  Customer: 10,
  PotentialOwner: 0,
};

/**
 * Check if user role has required access level
 */
export const hasRoleAccess = (userRole: string | null | undefined, minRole: string): boolean => {
  if (!userRole) return false;
  const userLevel = RoleHierarchy[userRole] ?? -1;
  const requiredLevel = RoleHierarchy[minRole] ?? -1;
  return userLevel >= requiredLevel;
};
