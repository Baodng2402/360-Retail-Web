import axios, { type InternalAxiosRequestConfig } from "axios";
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
                "Thời gian dùng thử đã hết. Vui lòng mua gói để tiếp tục sử dụng.",
            });
          } else if (errorCode === "SubscriptionExpired") {
            store.openUpgradeModal({
              errorType: "SubscriptionExpired",
              message:
                data.message ||
                "Gói dịch vụ của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.",
            });
          } else if (errorCode === "FeatureNotAvailable" && !skipFeatureGate) {
            store.openUpgradeModal({
              errorType: "FeatureNotAvailable",
              message:
                data.message ||
                "Tính năng này không khả dụng trong gói hiện tại của bạn.",
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

const getApiUrl = (envVar?: string) => {
  const url = envVar?.replace(/\/+$/, "") || globalBaseURL;
  return url + "/";
};

export const identityApi = createAxiosInstance(
  getApiUrl(import.meta.env.VITE_IDENTITY_API_URL),
);
export const saasApi = createAxiosInstance(
  getApiUrl(import.meta.env.VITE_SAAS_API_URL),
);
export const salesApi = createAxiosInstance(
  getApiUrl(import.meta.env.VITE_SALES_API_URL),
);
export const hrApi = createAxiosInstance(
  getApiUrl(import.meta.env.VITE_HR_API_URL),
);
export const crmApi = createAxiosInstance(
  getApiUrl(import.meta.env.VITE_CRM_API_URL),
);
