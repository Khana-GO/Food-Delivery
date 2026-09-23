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

import { getHomeRoute } from '@/lib/roles';
import { toast } from '@/components/ui/toast';

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

      // ─── Navigate to role-based home route ───
      const homeRoute = getHomeRoute(authResult.user.role);
      router.replace(homeRoute as any);
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
    // ─── Development / Testing Stage Bypass ───
    if (!googleAuthService.isConfigured) {
      if (__DEV__ || process.env.NODE_ENV !== 'production') {
        setIsLoading(true);
        setError(null);
        toast.info(
          'Signing in with Test Google Account (Dev Mode)...',
          'Google Sign-In'
        );
        try {
          await completeGoogleLogin('mock-google-token-dev');
          toast.success('Signed in as Test Google User!', 'Welcome');
        } catch (err: any) {
          const message = err?.message || 'Dev Google login failed';
          setError(message);
          toast.error(message, 'Google Sign-In');
          Alert.alert('Dev Google Sign-In Error', message);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      const msg =
        'Google Sign-In is not configured yet. Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID in apps/mobile/.env, or use email and password to log in.';
      setError(msg);
      toast.error(msg, 'Google Sign-In');
      Alert.alert('Google Sign-In Not Configured', msg);
      return;
    }

    // ─── Web: keep the expo-auth-session browser flow ───
    if (googleAuthService.isWeb) {
      if (!request) {
        toast.error('Google Auth is still initializing. Please try again.', 'Google Sign-In');
        return;
      }
      try {
        await promptAsync();
      } catch (error) {
        setError('Failed to open Google login');
        toast.error('Could not open Google login popup. Please check your browser popup blocker.', 'Google Sign-In');
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
  }, [handleGoogleResponse]);

  return {
    signInWithGoogle,
    isLoading,
    error,
    request,
  };
};