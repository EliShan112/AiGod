// api.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Extend AxiosRequestConfig to carry our flag
interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}

//  Request interceptor: attach access token 
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers = config.headers ?? {};
      // Some TS defs have headers as AxiosRequestHeaders or plain object
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: refresh logic with queue
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (err?: any) => void;
  originalRequest: AxiosRequestConfigWithRetry;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else {
      // attach token if available
      prom.originalRequest.headers = prom.originalRequest.headers ?? {};
      // @ts-ignore
      prom.originalRequest.headers["Authorization"] = `Bearer ${token}`;
      prom.resolve(api(prom.originalRequest));
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config?: AxiosRequestConfigWithRetry }) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry | undefined;

    // If no originalRequest or no response - just reject
    if (!originalRequest || !error.response) return Promise.reject(error);

    const status = error.response.status;

    const shouldRefresh = (status === 401 || status === 403);

    if (shouldRefresh && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Push this request into the queue — it will be retried when refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, originalRequest });
        });
      }

      isRefreshing = true;

      try {
        // Use plain axios (no interceptors) to call refresh endpoint
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data?.accessToken ?? null;

        if (!newAccessToken) {
          throw new Error("No accessToken in refresh response");
        }

        // Update Zustand store
        useAuthStore.getState().setAccessToken(newAccessToken);

        // process queued requests
        processQueue(null, newAccessToken);

        // attach token to original request and retry
        originalRequest.headers = originalRequest.headers ?? {};
        // @ts-ignore
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        // refresh failed — clear queue and logout
        processQueue(err, null);
        useAuthStore.getState().logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
