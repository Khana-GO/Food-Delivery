import React from 'react';
import { Tabs } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { TabIcon, useTabBarConstants } from '@/components/bottom-tabs';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function RestaurantLayout() {
  const { isInitializing } = useAuth();
  useProtectedRoute(['RESTAURANT_OWNER']);

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
            <TabIcon name="home" label="Dashboard" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="restaurant/profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="store" label="Restaurant" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="menu" label="Menu" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="shopping-bag" label="Orders" focused={focused} size={iconSize} labelSize={labelSize} />
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
            <TabIcon name="profile" label="Profile" focused={focused} size={iconSize} labelSize={labelSize} />
          ),
        }}
      />

      {/* Secondary pages reachable via /navigation, hidden from tab bar */}
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="categories/index" options={{ href: null }} />
      <Tabs.Screen name="categories/create" options={{ href: null }} />
      <Tabs.Screen name="categories/[id]/edit" options={{ href: null }} />
      <Tabs.Screen name="menu/create" options={{ href: null }} />
      <Tabs.Screen name="menu/[id]/edit" options={{ href: null }} />
      <Tabs.Screen name="orders/[id]" options={{ href: null }} />
      <Tabs.Screen name="restaurant/settings" options={{ href: null }} />
    </Tabs>
  );
}