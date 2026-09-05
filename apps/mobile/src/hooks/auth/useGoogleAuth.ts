// mobile/src/hooks/auth/useGoogleAuth.ts
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import {
  googleAuthService,
  GoogleSignInCancelledError,
} from '@/services/auth/google-auth.service';
import { useAuth } from '@/contexts/AuthContext';
import { saveAccessToken, saveRefreshToken } from '@/lib/secure-storage';

export const useGoogleAuth = () => {
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Web only: Google OAuth request (native uses the GMS SDK) ───
  const [request, response, promptAsync] = googleAuthService.useGoogleAuth();

  // ─── Finish login: exchange idToken, store session, navigate ───
  const completeGoogleLogin = useCallback(
    async (idToken: string) => {
      const authResult = await googleAuthService.exchangeToken(idToken);

      // ─── Store tokens ───
      await saveAccessToken(authResult.accessToken);
      await saveRefreshToken(authResult.refreshToken);

      // ─── Update AuthContext ───
      setUser(authResult.user);

      // ─── Navigate to home ───
      router.replace('/(customer)');
    },
    [setUser]
  );

  // ─── Handle Web Google Response ───
  const handleGoogleResponse = useCallback(async () => {
    if (!response) return;

    setIsLoading(true);
    setError(null);

    try {
      // ─── Check if user cancelled ───
      if (response.type === 'cancel') {
        setIsLoading(false);
        return;
      }

      // ─── Check for error ───
      if (response.type !== 'success') {
        setError('Authentication failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // ─── Only a successful response carries an ID token ───
      const idToken = response.authentication?.idToken;
      if (!idToken) {
        setError('No Google ID token received. Please try again.');
        setIsLoading(false);
        return;
      }

      await completeGoogleLogin(idToken);
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      Alert.alert('Login Error', err.message || 'Failed to login with Google');
    } finally {
      setIsLoading(false);
    }
  }, [response, completeGoogleLogin]);

  // ─── Trigger Google Login ───
  const signInWithGoogle = useCallback(async () => {
    // ─── Web: keep the expo-auth-session browser flow ───
    if (googleAuthService.isWeb) {
      if (!request) return;
      try {
        await promptAsync();
      } catch (error) {
        setError('Failed to open Google login');
        Alert.alert('Error', 'Could not open Google login');
      }
      return;
    }

    // ─── Native (Android/iOS): GMS SDK, requires a development build ───
    setIsLoading(true);
    setError(null);
    try {
      const idToken = await googleAuthService.signInWithGoogleNative();
      await completeGoogleLogin(idToken);
    } catch (err: any) {
      // User dismissed the prompt — exit quietly, no error alert.
      if (err instanceof GoogleSignInCancelledError) return;
      const message = err?.message || 'Google login failed';
      setError(message);
      Alert.alert('Login Error', message);
    } finally {
      setIsLoading(false);
    }
  }, [request, promptAsync, completeGoogleLogin]);

  // ─── Handle response when it changes (web flow) ───
  useEffect(() => {
    handleGoogleResponse();
  }, [response]);

  return {
    signInWithGoogle,
    isLoading,
    error,
    request,
  };
};