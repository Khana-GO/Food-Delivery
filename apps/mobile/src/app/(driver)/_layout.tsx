import React from 'react';
import { Tabs } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { TabIcon, useTabBarConstants } from '@/components/bottom-tabs';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';

export default function DriverLayout() {
  const { isInitializing } = useAuth();
  useProtectedRoute(['DRIVER']);
  const { iconSize, labelSize, tabBarStyle, tabBarItemStyle } = useTabBarConstants();

  if (isInitializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle,
        tabBarItemStyle,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: '#FAFAFB' },
        animation: 'fade',
      }}
    >
      <Tabs.Screen name="(tabs)/index" options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" label="Home" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="(tabs)/available-orders" options={{ tabBarIcon: ({ focused }) => <TabIcon name="shopping-bag" label="Orders" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="(tabs)/active" options={{ tabBarIcon: ({ focused }) => <TabIcon name="truck" label="Active" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="(tabs)/earnings" options={{ tabBarIcon: ({ focused }) => <TabIcon name="dollar-sign" label="Earnings" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="(tabs)/profile" options={{ tabBarIcon: ({ focused }) => <TabIcon name="user" label="Profile" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="(tabs)/notifications" options={{ href: null }} />
      <Tabs.Screen name="(tabs)/delivery-history" options={{ href: null }} />
    </Tabs>
  );
}
