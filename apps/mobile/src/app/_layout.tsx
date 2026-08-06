import React from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import '../../global.css';

// ────────────────────────────────────────────────────────────────────────────
// React Query client – centralised data fetching
// ────────────────────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// ────────────────────────────────────────────────────────────────────────────
// Root Layout – wraps the entire app with providers
// ────────────────────────────────────────────────────────────────────────────

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          {/* 
            The theme provider is intentionally omitted – we use light theme 
            throughout the app. If dark mode is needed, uncomment:
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          */}
          <AppNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppNavigator() {
  const { isAuthenticated, isInitializing, role } = useAuth();

  // Wait for the persisted session before mounting routes, so a signed-in user
  // never flashes the login page while the app is starting.
  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && role === 'CUSTOMER'}>
        <Stack.Screen name="(customer)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated && role === 'DRIVER'}>
        <Stack.Screen name="(driver)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated && role === 'RESTAURANT_OWNER'}>
        <Stack.Screen name="(restaurant)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated && role === 'ADMIN'}>
        <Stack.Screen name="(admin)" />
      </Stack.Protected>
    </Stack>
  );
}
