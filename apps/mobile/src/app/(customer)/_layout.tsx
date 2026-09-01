import React from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';

export default function CustomerLayout() {
  const { isInitializing } = useAuth();
  useProtectedRoute(['CUSTOMER']);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
        gestureEnabled: true,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ animation: 'fade', animationDuration: 160 }} />
      <Stack.Screen name="restaurant/[id]" options={{ presentation: 'card', animation: 'slide_from_right', animationDuration: 220 }} />
      <Stack.Screen name="menu/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="cart" options={{ presentation: 'modal', animation: 'slide_from_bottom', animationDuration: 280 }} />
      <Stack.Screen name="checkout" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="checkout/success" options={{ presentation: 'modal', gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="checkout/failure" options={{ presentation: 'modal', gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="payment" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="order/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="order-tracking/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="addresses" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="chatbot" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="profile" options={{ headerShown: false, animation: 'slide_from_right' }} />
<Stack.Screen name="order-tracking/[id]" options={{ headerShown: false }} />
<Stack.Screen name="order/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
