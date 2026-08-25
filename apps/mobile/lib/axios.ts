import axios from "axios";
import {Platform} from "react-native";
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
} from "./secure-storage";



const BASE_URL =
 Platform.OS === "web"
 ? process.env.EXPO_PUBLIC_API_URL_WEB
 : process.env.EXPO_PUBLIC_API_URL_MOBILE;



export const api = axios.create({

 baseURL:BASE_URL,

 headers:{
   "Content-Type":"application/json"
 }

});



// REQUEST INTERCEPTOR
//
// Purpose:
// Automatically attach JWT access token
// to every API request.
//
// Without interceptor:
//
// api.get("/profile",{
//   headers:{
//    Authorization:`Bearer token`
//   }
// })
//
// We would need to repeat this everywhere.
//
// Interceptor runs before every request,
// gets token from SecureStore,
// and adds:
//
// Authorization: Bearer <accessToken>
//
// Example:
//
// GET /profile
//
// Authorization:
// Bearer eyJhbGciOi...
//

api.interceptors.request.use(
 async(config)=>{

   const token = await getAccessToken();


   if(token){

    config.headers.Authorization =
      `Bearer ${token}`;

   }


   return config;

 },

(error)=>{

 return Promise.reject(error);

}

);

// RESPONSE INTERCEPTOR
//
// Purpose:
// Silently renew an expired access token and retry the request.
//
// Access tokens are short-lived (JWT_EXPIRES_IN). When one expires,
// every API call would fail with 401 and screens would show errors.
// Instead, on the first 401 we exchange the stored refresh token at
// POST /auth/refresh, persist the new token pair, and replay the
// original request once. Concurrent 401s share a single refresh call.
//

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return null;

      const response = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: nextRefreshToken } = response.data;
      if (!accessToken) return null;

      await saveAccessToken(accessToken);
      if (nextRefreshToken) await saveRefreshToken(nextRefreshToken);

      return accessToken as string;
    })().catch(() => null).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const isAuthRoute =
      typeof originalRequest?.url === "string" &&
      originalRequest.url.includes("/auth/");

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      const accessToken = await refreshAccessToken();

      if (accessToken) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }

);