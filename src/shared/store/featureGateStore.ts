import { create } from "zustand";

export type FeatureGateErrorType = "TrialExpired" | "SubscriptionExpired" | "FeatureNotAvailable";

export interface FeatureGatePayload {
  errorType: FeatureGateErrorType;
  message?: string;
  currentPlan?: string;
  requiredPlan?: string;
  feature?: string;
}

interface FeatureGateState extends FeatureGatePayload {
  isOpen: boolean;
  openUpgradeModal: (payload: FeatureGatePayload) => void;
  closeUpgradeModal: () => void;
}

export const useFeatureGateStore = create<FeatureGateState>((set) => ({
  isOpen: false,
  errorType: "FeatureNotAvailable",
  message: undefined,
  currentPlan: undefined,
  requiredPlan: undefined,
  feature: undefined,
  openUpgradeModal: (payload) =>
    set({
      isOpen: true,
      ...payload,
    }),
  closeUpgradeModal: () =>
    set({
      isOpen: false,
      message: undefined,
      currentPlan: undefined,
      requiredPlan: undefined,
      feature: undefined,
    }),
}));

