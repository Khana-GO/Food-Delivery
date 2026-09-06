// lib/secure-storage.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const REMEMBER_ME_KEY = 'rememberMe';

const isWeb = Platform.OS === 'web';

export async function saveAccessToken(token: string) {
  if (isWeb) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
    return;
  }
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken() {
  if (isWeb) {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  }
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function saveRefreshToken(token: string) {
  if (isWeb) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
    return;
  }
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken() {
  if (isWeb) {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function saveRememberMe(value: boolean) {
  if (isWeb) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(REMEMBER_ME_KEY, String(value));
    }
    return;
  }
  await SecureStore.setItemAsync(REMEMBER_ME_KEY, String(value));
}

export async function getRememberMe() {
  if (isWeb) {
    if (typeof window !== 'undefined' && window.localStorage) {
      const value = window.localStorage.getItem(REMEMBER_ME_KEY);
      return value === 'true';
    }
    return false;
  }
  const value = await SecureStore.getItemAsync(REMEMBER_ME_KEY);
  return value === 'true';
}

export async function deleteTokens() {
  if (isWeb) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    return;
  }
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  // Keep remember me preference
}