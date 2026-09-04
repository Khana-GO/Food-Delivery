// mobile/src/hooks/auth/useGoogleAuth.ts
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { googleAuthService } from '@/services/auth/google-auth.service';
import { useAuth } from '@/contexts/AuthContext';
import { saveAccessToken, saveRefreshToken } from '@/lib/secure-storage';

export const useGoogleAuth = () => {
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Use Google Auth Request ───
  const [request, response, promptAsync] = googleAuthService.useGoogleAuth();

  // ─── Handle Google Response ───
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
      if (response.type === 'error') {
        setError('Authentication failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // ─── Only a successful response carries an ID token ───
      if (response.type !== 'success') {
        setIsLoading(false);
        return;
      }

      // ─── Require an ID token ───
      const idToken = response.authentication?.idToken;
      if (!idToken) {
        setError('No Google ID token received. Please try again.');
        setIsLoading(false);
        return;
      }

      // ─── Exchange token with backend (backend verifies it server-side) ───
      const authResult = await googleAuthService.exchangeToken(idToken);

      // ─── Store tokens ───
      await saveAccessToken(authResult.accessToken);
      await saveRefreshToken(authResult.refreshToken);

      // ─── Update AuthContext ───
      setUser(authResult.user);

      // ─── Navigate to home ───
      router.replace('/(customer)');
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      Alert.alert('Login Error', err.message || 'Failed to login with Google');
    } finally {
      setIsLoading(false);
    }
  }, [response, setUser]);

  // ─── Trigger Google Login ───
  const signInWithGoogle = useCallback(async () => {
    if (!request) return;
    try {
      await promptAsync();
    } catch (error) {
      setError('Failed to open Google login');
      Alert.alert('Error', 'Could not open Google login');
    }
  }, [request, promptAsync]);

  // ─── Handle response when it changes ───
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
