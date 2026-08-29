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
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="(tabs)/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="bar-chart-2" label="Dashboard" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/users"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="users" label="Users" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/restaurants"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" label="Restaurants" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="shopping-bag" label="Orders" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/notifications"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="bell" label="Alerts" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="(tabs)/profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="user" label="Profile" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />

      {/* Hide legacy direct children that exist as files but should not appear as tabs */}
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="orders" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
      {/* Hide former tabs now accessed via dashboard/profile */}
      <Tabs.Screen name="(tabs)/analytics" options={{ href: null }} />
      <Tabs.Screen name="(tabs)/settings" options={{ href: null }} />
      {/* Hide Stack detail/create screens – must not appear in tab bar */}
      <Tabs.Screen name="users/create" options={{ href: null }} />
      <Tabs.Screen name="users/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="users/[id]/edit" options={{ href: null }} />
      <Tabs.Screen name="restaurants/create" options={{ href: null }} />
      <Tabs.Screen name="restaurants/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="restaurants/[id]/edit" options={{ href: null }} />
      <Tabs.Screen name="restaurant/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="restaurant/[id]/edit" options={{ href: null }} />
      <Tabs.Screen name="order/[id]" options={{ href: null }} />
      <Tabs.Screen name="profile/edit" options={{ href: null }} />
    </Tabs>
  );
}
