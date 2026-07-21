import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access-token";
const REFRESH_TOKEN_KEY = "refresh-token";

// Save Access Token
export const saveAccessToken = (token: string) => {
  return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
};

// Get Access Token
export const getAccessToken = () => {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

// Delete Access Token
export const deleteAccessToken = () => {
  return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
};

// Save Refresh Token
export const saveRefreshToken = (token: string) => {
  return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
};

// Get Refresh Token
export const getRefreshToken = () => {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

// Delete Refresh Token
export const deleteRefreshToken = () => {
  return SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

// Logout (Delete Both)
export const deleteTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};