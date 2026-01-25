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
