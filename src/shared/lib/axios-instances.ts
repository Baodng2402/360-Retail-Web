import axios, { type InternalAxiosRequestConfig } from "axios";
import i18next from "@/i18n";
import { useFeatureGateStore } from "@/shared/store/featureGateStore";

const createAxiosInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("token");
      if (
        token &&
        token !== "null" &&
        token !== "undefined" &&
        token.trim() !== ""
      ) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const response = error?.response;
      if (response && response.status === 403 && response.data) {
        try {
          const data = response.data as {
            error?: string;
            message?: string;
            currentPlan?: string;
            requiredPlan?: string;
            feature?: string;
          };

          const errorCode = data.error;
          const store = useFeatureGateStore.getState();

          // Cho phép một số request (ví dụ load tasks để hiển thị thống kê) đánh dấu bỏ qua popup nâng cấp.
          const skipFeatureGate =
            error.config &&
            error.config.headers &&
            (error.config.headers["X-Skip-Feature-Gate"] === "1" ||
              (error.config.headers as Record<string, unknown>)[
                "x-skip-feature-gate"
              ] === "1");

          if (errorCode === "TrialExpired") {
            store.openUpgradeModal({
              errorType: "TrialExpired",
              message:
                data.message ||
                i18next.t("featureGate:errors.trialExpired"),
            });
          } else if (errorCode === "SubscriptionExpired") {
            store.openUpgradeModal({
              errorType: "SubscriptionExpired",
              message:
                data.message ||
                i18next.t("featureGate:errors.subscriptionExpired"),
            });
          } else if (errorCode === "FeatureNotAvailable" && !skipFeatureGate) {
            store.openUpgradeModal({
              errorType: "FeatureNotAvailable",
              message:
                data.message ||
                i18next.t("featureGate:errors.featureNotAvailable"),
              currentPlan: data.currentPlan,
              requiredPlan: data.requiredPlan,
              feature: data.feature,
            });
          }
        } catch {
          // ignore parsing errors and fallback to normal error flow
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

const globalBaseURL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:5001";

/**
 * Normalize base URL to the **Gateway root**.
 *
 * This project calls endpoints with explicit service prefixes in the path
 * (e.g. `identity/...`, `saas/...`). If an env var mistakenly includes a
 * service prefix in its baseURL (e.g. `http://localhost:5001/identity`),
 * requests would become `.../identity/identity/...` and silently fail.
 */
const toGatewayRootUrl = (envVar?: string) => {
  const raw = (envVar || globalBaseURL).trim().replace(/\/+$/, "");
  const stripped = raw.replace(/\/(identity|saas|sales|hr|crm)$/i, "");
  return stripped.replace(/\/+$/, "") + "/";
};

export const identityApi = createAxiosInstance(
  toGatewayRootUrl(import.meta.env.VITE_IDENTITY_API_URL),
);
export const saasApi = createAxiosInstance(
  toGatewayRootUrl(import.meta.env.VITE_SAAS_API_URL),
);
export const salesApi = createAxiosInstance(
  toGatewayRootUrl(import.meta.env.VITE_SALES_API_URL),
);
export const hrApi = createAxiosInstance(
  toGatewayRootUrl(import.meta.env.VITE_HR_API_URL),
);
export const crmApi = createAxiosInstance(
  toGatewayRootUrl(import.meta.env.VITE_CRM_API_URL),
);
