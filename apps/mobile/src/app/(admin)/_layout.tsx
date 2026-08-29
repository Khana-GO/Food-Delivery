import React from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminStackLayout() {
  const { isInitializing } = useAuth();
  useProtectedRoute(['ADMIN']);

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="order/[id]" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="restaurant/[id]/index" />
      <Stack.Screen name="restaurant/[id]/edit" />
      <Stack.Screen name="restaurants/create" />
      <Stack.Screen name="restaurants/[id]/index" />
      <Stack.Screen name="restaurants/[id]/edit" />
      <Stack.Screen name="users/create" />
      <Stack.Screen name="users/[id]/index" />
      <Stack.Screen name="users/[id]/edit" />
    </Stack>
  );
}
