// mobile/src/services/auth/google-auth.service.ts
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { api } from '@/lib/axios';

// For web OAuth redirect
WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'your_google_client_id';

export const googleAuthService = {
  // ─── INITIALIZE GOOGLE AUTH ───
  useGoogleAuth: () => {
    return Google.useAuthRequest({
      clientId: CLIENT_ID,
      iosClientId: CLIENT_ID,
      androidClientId: CLIENT_ID,
      webClientId: CLIENT_ID,
      scopes: ['profile', 'email'],
    });
  },

  // ─── EXCHANGE TOKEN ───
  // The backend verifies the ID token server-side (via Google's tokeninfo
  // endpoint) and returns session tokens plus the user profile. We do NOT
  // send client-supplied profile fields — those could be tampered with.
  exchangeToken: async (idToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
  }> => {
    try {
      const response = await api.post('/auth/google', { idToken });
      return response.data;
    } catch (error) {
      console.error('Google auth error:', error);
      throw new Error('Failed to authenticate with Google');
    }
  },
};
