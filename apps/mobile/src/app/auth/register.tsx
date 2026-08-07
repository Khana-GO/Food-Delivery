// Register is now handled inside login.tsx via the tab toggle.
// This file redirects to login so the Sign Up tab can be used.
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function RegisterScreen() {
  useEffect(() => {
    router.replace('/auth/login');
  }, []);
  return null;
}
