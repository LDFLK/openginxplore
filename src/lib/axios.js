import axios from "axios";
import network, { OFFLINE_ERROR } from "../utils/network";

const axiosInstance = axios.create({
  baseURL: window?.configs?.apiUrlData ? window.configs.apiUrlData : "",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (!network.isOnline()) {
      return Promise.reject(new Error(OFFLINE_ERROR));
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!network.isOnline()) {
      return Promise.reject(new Error(OFFLINE_ERROR));
    }
    return Promise.reject(error);
  }
);

export { axiosInstance };
export default axiosInstance;
