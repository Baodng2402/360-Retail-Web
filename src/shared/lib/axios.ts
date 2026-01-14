import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";

const instance = axios.create({
  baseURL: "https://some-domain.com/api/",
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
  {
    synchronous: true,
    runWhen: (config) => !!config,
  }
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;

