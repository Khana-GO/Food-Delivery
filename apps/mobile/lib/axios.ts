import axios from "axios";
import { Platform } from "react-native";
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
  deleteTokens, // add this if not already
} from "./secure-storage";

const getBaseUrl = () => {
  const webUrl = process.env.EXPO_PUBLIC_API_URL_WEB;
  const mobileUrl = process.env.EXPO_PUBLIC_API_URL_MOBILE;
  // Fallback to localhost for web and LAN IP for mobile if env not set (common dev mistake)
  if (Platform.OS === "web") {
    return webUrl || "http://localhost:3000/api";
  }
  return mobileUrl || "http://192.168.18.192:3000/api";
};

const BASE_URL = getBaseUrl();

if (!BASE_URL) {
  console.warn("[axios] BASE_URL is not defined. Check EXPO_PUBLIC_API_URL_* in apps/mobile/.env");
}

export const api = axios.create({
  baseURL: BASE_URL,
  // Do not force Content-Type here — let each request set it.
  // For JSON it will be application/json, for FormData it will be multipart/form-data with boundary.
  headers: {},
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
interface RefreshResult {
  token: string | null;
  authFailed: boolean;
}
let refreshPromise: Promise<RefreshResult> | null = null;

// ─── Session expired listeners ───
// Lets the app (AuthContext) log the user out when the refresh token is
// invalid/expired, instead of silently leaving it in a broken 401 state.
type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

function notifySessionExpired() {
  sessionExpiredListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore listener errors
    }
  });
}

const refreshAccessToken = (): Promise<RefreshResult> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async (): Promise<RefreshResult> => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return { token: null, authFailed: true };

      // Use a fresh axios instance to avoid interceptor loop
      const response = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      if (!accessToken) return { token: null, authFailed: true };

      await saveAccessToken(accessToken);
      if (newRefreshToken) await saveRefreshToken(newRefreshToken);

      return { token: accessToken, authFailed: false };
    } catch (error: any) {
      // Only clear tokens when the refresh token is genuinely rejected
      // (401/403). Transient failures (network, 5xx) keep the existing tokens
      // so a future request can still attempt a refresh.
      const status = error?.response?.status;
      const authFailed = status === 401 || status === 403;
      if (authFailed) {
        await deleteTokens();
      }
      return { token: null, authFailed };
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
    // Never auto-refresh on these auth routes: a 401 here means the
    // credentials themselves are invalid, not just an expired access token.
    const url: string = typeof originalRequest?.url === "string" ? originalRequest.url : "";
    const isCredentialsAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout") ||
      url.includes("/auth/verify-email") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password") ||
      url.includes("/auth/verify-reset-code");

    // Only retry non-credential auth routes with 401 and not already retried
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isCredentialsAuthRoute
    ) {
      originalRequest._retry = true;

      const result = await refreshAccessToken();
      if (result.token) {
        originalRequest.headers.Authorization = `Bearer ${result.token}`;
        try {
          return await api(originalRequest); // retry
        } catch (retryError) {
          // The retried request still failed (e.g. token immediately revoked).
          // The session is no longer usable — clear it and notify.
          notifySessionExpired();
          return Promise.reject(retryError);
        }
      } else if (result.authFailed) {
        // Refresh failed because the refresh token is missing/invalid/expired.
        // Let the app clear the session and redirect to login.
        notifySessionExpired();
      }
      // Transient refresh failure (no authFailed): keep tokens, let the
      // original request's error propagate so the caller can retry later.
    }

    return Promise.reject(error);
  }
);