import axios from "axios";
import { Platform } from "react-native";
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
  deleteTokens, // add this if not already
} from "./secure-storage";

const BASE_URL =
  Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_API_URL_WEB
    : process.env.EXPO_PUBLIC_API_URL_MOBILE;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Request Interceptor ───
api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Refresh Token Helper ───
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return null;

      // Use a fresh axios instance to avoid interceptor loop
      const response = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      if (!accessToken) return null;

      await saveAccessToken(accessToken);
      if (newRefreshToken) await saveRefreshToken(newRefreshToken);

      return accessToken;
    } catch (error) {
      // Refresh failed – clear tokens to prevent infinite loops
      await deleteTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// ─── Response Interceptor ───
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const isAuthRoute =
      typeof originalRequest?.url === "string" &&
      originalRequest.url.includes("/auth/");

    // Only retry non-auth routes with 401 and not already retried
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest); // retry
      }

      // If refresh failed, we could emit a logout event here
      // Example: dispatch an event to clear user state
      // EventEmitter.emit('logout');
    }

    return Promise.reject(error);
  }
);