import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Extend InternalAxiosRequestConfig (better than basic AxiosRequestConfig for interceptors)
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      // Fix: Ensure headers is an instance of AxiosHeaders
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Queue definition
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (err?: any) => void;
  originalRequest: CustomAxiosRequestConfig;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      if (prom.originalRequest.headers) {
        prom.originalRequest.headers.set("Authorization", `Bearer ${token}`);
      }
      prom.resolve(api(prom.originalRequest));
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | CustomAxiosRequestConfig
      | undefined;

    if (!originalRequest || !error.response) return Promise.reject(error);

    const status = error.response.status;
    const shouldRefresh = status === 401 || status === 403;

    if (shouldRefresh && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data?.accessToken;

        if (!newAccessToken) {
          throw new Error("No accessToken in refresh response");
        }

        useAuthStore.getState().setAccessToken(newAccessToken);

        // Process queue
        processQueue(null, newAccessToken);

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.set(
            "Authorization",
            `Bearer ${newAccessToken}`
          );
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Clear local auth state
        useAuthStore.getState().logout();

        // OPTIONAL: Redirect to login explicitly if needed
        // window.location.href = '/login';

        //  Reject, but you might want to wrap this to avoid UI crashes
        // If the refresh fails, the session is essentially over.
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
