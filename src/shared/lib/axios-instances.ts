import axios, { type InternalAxiosRequestConfig } from "axios";

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
      return Promise.reject(error);
    }
  );

  return instance;
};

const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:5000";
const apiBaseURL = baseURL + "/";

export const identityApi = createAxiosInstance(apiBaseURL);
export const saasApi = createAxiosInstance(apiBaseURL);
export const salesApi = createAxiosInstance(apiBaseURL);
