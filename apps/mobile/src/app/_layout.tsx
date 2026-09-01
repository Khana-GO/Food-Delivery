import React from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, View, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastHost } from '@/components/ui/toast';
import { Colors } from '@/constants/theme';
import '@/lib/imageInterop';
import '../../global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchInterval: false,
      placeholderData: (prev: any) => prev,
    },
    mutations: { retry: 0 },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
            <AppNavigator />
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function AppNavigator() {
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <View style={{ height: 12 }} />
          <View style={styles.loadingPulse} />
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 180,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: { backgroundColor: Colors.background },
          animationMatchesGesture: true,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade', animationDuration: 160 }} />
        <Stack.Screen
          name="onboarding"
          options={{ animation: 'slide_from_right', animationDuration: 220 }}
        />
        <Stack.Screen
          name="(auth)"
          options={{ animation: 'slide_from_bottom', animationDuration: 240, gestureEnabled: true }}
        />
        <Stack.Screen name="(customer)" options={{ animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="(driver)" options={{ animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="(restaurant-owner)" options={{ animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="(admin)" options={{ animation: 'fade', animationDuration: 180 }} />
      </Stack>
      <ToastHost />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 28,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  loadingPulse: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FEE2E2',
  },
});
