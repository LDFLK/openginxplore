import axios from "axios";

const axiosInstance = axios.create({
  baseURL: window?.configs?.apiUrlData ? window.configs.apiUrlData : "",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to block calls when offline
axiosInstance.interceptors.request.use(
  (config) => {
    if (!navigator.onLine) {
      return Promise.reject(new Error("OFFLINE_NETWORK_ERROR"));
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
