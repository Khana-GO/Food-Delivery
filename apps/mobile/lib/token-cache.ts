import { TokenCache } from '@clerk/expo';
import * as SecureStore from 'expo-secure-store';

export const tokenCache: TokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },

  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};