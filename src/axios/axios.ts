import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
const instance = axios.create({
  baseURL: "https://some-domain.com/api/",
});

// SỬA LỖI 1: Định nghĩa AUTH_TOKEN
// Nếu lấy từ localStorage thì dùng dòng dưới, không thì để string rỗng
const AUTH_TOKEN = localStorage.getItem("token") || "";

instance.defaults.headers.common["Authorization"] = AUTH_TOKEN;

// Add a request interceptor
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Thường thì người ta sẽ gán token động ở đây để luôn mới nhất
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
  {
    synchronous: true,
    // SỬA LỖI 2: Thêm logic trả về (return true/false)
    runWhen: (config) => !!config,
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi global (ví dụ 401 thì logout) ở đây
    return Promise.reject(error);
  }
);

export default instance;
