import React from 'react';
import { Tabs } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { TabIcon, useTabBarConstants } from '@/components/bottom-tabs';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout() {
  const { isInitializing } = useAuth();
  useProtectedRoute(['ADMIN']);

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
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="bar-chart-2" label="Dashboard" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="users" label="Users" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="restaurants"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" label="Restaurants" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="shopping-bag" label="Orders" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="pie-chart" label="Analytics" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="settings" label="Settings" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />

      {/* Redirect + detail screens, hidden from the tab bar */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="user/[id]" options={{ href: null }} />
      <Tabs.Screen name="restaurant/[id]" options={{ href: null }} />
      <Tabs.Screen name="order/[id]" options={{ href: null }} />
    </Tabs>
  );
}