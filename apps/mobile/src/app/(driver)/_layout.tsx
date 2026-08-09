import React from 'react';
import { Tabs } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { TabIcon, useTabBarConstants } from '@/components/bottom-tabs';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function DriverLayout() {
  const { isInitializing } = useAuth();
  useProtectedRoute(['DRIVER']);

  const { iconSize, labelSize, tabBarStyle, tabBarItemStyle } = useTabBarConstants();

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#E23744" />
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="navigation" label="Deliveries" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="available-orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="clipboard" label="Available" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="active-delivery"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="truck" label="Active" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="dollar-sign" label="Earnings" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="user" label="Profile" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />

      {/* Secondary pages: reachable via navigation, hidden from the tab bar */}
      <Tabs.Screen name="delivery-history" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}