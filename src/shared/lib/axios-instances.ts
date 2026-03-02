import axios, { type InternalAxiosRequestConfig } from "axios";
import { useFeatureGateStore } from "@/shared/store/featureGateStore";

const createAxiosInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("token");
      if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
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
          } else if (errorCode === "FeatureNotAvailable") {
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
    }
  );

  return instance;
};

const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5001";
const apiBaseURL = baseURL + "/";

export const identityApi = createAxiosInstance(apiBaseURL);
export const saasApi = createAxiosInstance(apiBaseURL);
export const salesApi = createAxiosInstance(apiBaseURL);
export const hrApi = createAxiosInstance(apiBaseURL);
