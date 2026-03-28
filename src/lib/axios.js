import axios from "axios";
import network from "../utils/network";

const axiosInstance = axios.create({
  baseURL: window?.configs?.apiUrlData ? window.configs.apiUrlData : "",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor as a secondary check (useful if network goes down mid-delay)
axiosInstance.interceptors.request.use(
  (config) => {
    if (!network.isOnline()) {
      return Promise.reject(new Error("OFFLINE_NETWORK_ERROR"));
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * A wrapper for axios that checks for network connectivity before 
 * making a request to avoid browser console errors.
 */
const wrappedAxios = async (config) => {
  if (!network.isOnline()) throw new Error("OFFLINE_NETWORK_ERROR");
  return axiosInstance(config);
};

// Add convenience methods to wrappedAxios to match axiosInstance behavior
wrappedAxios.get = (url, config) => wrappedAxios({ ...config, method: "get", url });
wrappedAxios.post = (url, data, config) => wrappedAxios({ ...config, method: "post", url, data });
wrappedAxios.put = (url, data, config) => wrappedAxios({ ...config, method: "put", url, data });
wrappedAxios.patch = (url, data, config) => wrappedAxios({ ...config, method: "patch", url, data });
wrappedAxios.delete = (url, config) => wrappedAxios({ ...config, method: "delete", url });

export { axiosInstance };
export default wrappedAxios;
