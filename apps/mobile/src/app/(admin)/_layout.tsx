import React from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';

export default function AdminStackLayout() {
  const { isInitializing } = useAuth();
  useProtectedRoute(['ADMIN']);

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
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="order/[id]" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="restaurant/[id]/index" />
      <Stack.Screen name="restaurant/[id]/edit" />
      <Stack.Screen name="restaurants/create" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="restaurants/[id]/index" />
      <Stack.Screen name="restaurants/[id]/edit" />
      <Stack.Screen name="users/create" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="users/[id]/index" />
      <Stack.Screen name="users/[id]/edit" />
    </Stack>
  );
}
