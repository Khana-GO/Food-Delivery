// mobile/src/services/auth/google-auth.service.ts
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import type * as GoogleSigninModule from '@react-native-google-signin/google-signin';
import { api } from '@/lib/axios';

// For web OAuth redirect
WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined;

const IS_WEB = Platform.OS === 'web';

// Expo Go does not ship the RNGoogleSignin native module. Loading it at import
// time would crash the whole bundle, so the native module is imported lazily
// and only when a development/production build is detected.
const IS_EXPO_GO =
  !IS_WEB &&
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Thrown when the user dismisses the Google sign-in prompt.
 * Should be swallowed silently by the caller.
 */
export class GoogleSignInCancelledError extends Error {}

/**
 * Thrown when running in Expo Go, where native Google sign-in is unavailable.
 */
export class GoogleSignInUnavailableError extends Error {}

let googleSigninModule: typeof GoogleSigninModule | null = null;
let googleSigninConfigured = false;

async function loadGoogleSignin(): Promise<typeof GoogleSigninModule> {
  if (IS_EXPO_GO) {
    throw new GoogleSignInUnavailableError(
      'Google sign-in requires a development build. Please open the app from the installed dev client (not Expo Go).'
    );
  }

  if (!googleSigninModule) {
    googleSigninModule = await import(
      '@react-native-google-signin/google-signin'
    );
  }

  if (!googleSigninConfigured) {
    googleSigninModule.GoogleSignin.configure({
      // The WEB client ID is the audience the backend verifies the idToken
      // against. On Android, the native SDK additionally validates the app via
      // the Android OAuth client (package + SHA-1) registered in the Console.
      webClientId: WEB_CLIENT_ID || undefined,
      iosClientId: IOS_CLIENT_ID,
      scopes: ['profile', 'email'],
    });
    googleSigninConfigured = true;
  }

  return googleSigninModule;
}

export const googleAuthService = {
  isWeb: IS_WEB,

  useGoogleAuth: () => {
    return Google.useAuthRequest({
      clientId: WEB_CLIENT_ID || 'your_google_client_id',
      webClientId: WEB_CLIENT_ID || 'your_google_client_id',
      scopes: ['profile', 'email'],
    });
  },

  // ─── NATIVE SIGN-IN (Android / iOS, development or production build) ───
  // Returns an ID token minted against the web client ID. The backend always
  // verifies it server-side, so we never trust client-supplied profile fields.
  signInWithGoogleNative: async (): Promise<string> => {
    const mod = await loadGoogleSignin();

    try {
      await mod.GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    } catch (error: any) {
      if (error?.code === mod.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error(
          'Google Play services are not available on this device.'
        );
      }
      throw error;
    }

    const signInResponse = await mod.GoogleSignin.signIn();

    if (signInResponse.type === 'cancelled') {
      throw new GoogleSignInCancelledError('Google sign-in was cancelled');
    }

    const tokens = await mod.GoogleSignin.getTokens();

    if (!tokens.idToken) {
      throw new Error('No Google ID token received. Please try again.');
    }

    return tokens.idToken;
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