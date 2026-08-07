import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(customer)" />
      <Stack.Screen name="(driver)" />
      <Stack.Screen name="(restaurant)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}
