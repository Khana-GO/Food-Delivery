import React from 'react';
import { Tabs } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { TabIcon, useTabBarConstants } from '@/components/bottom-tabs';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';

export default function RestaurantLayout() {
  const { isInitializing } = useAuth();
  useProtectedRoute(['RESTAURANT_OWNER']);
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
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" label="Home" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="orders/index" options={{ tabBarIcon: ({ focused }) => <TabIcon name="shopping-bag" label="Orders" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="menu/index" options={{ tabBarIcon: ({ focused }) => <TabIcon name="book-open" label="Menu" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="restaurant/index" options={{ tabBarIcon: ({ focused }) => <TabIcon name="package" label="Stores" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon name="user" label="Profile" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="orders/[id]" options={{ href: null }} />
      <Tabs.Screen name="menu/create" options={{ href: null }} />
      <Tabs.Screen name="menu/[id]/edit" options={{ href: null }} />
      <Tabs.Screen name="categories/index" options={{ href: null }} />
      <Tabs.Screen name="categories/create" options={{ href: null }} />
      <Tabs.Screen name="categories/[id]/edit" options={{ href: null }} />
      <Tabs.Screen name="restaurant/create" options={{ href: null }} />
      <Tabs.Screen name="restaurant/[id]" options={{ href: null }} />
      <Tabs.Screen name="restaurant/[id]/edit" options={{ href: null }} />
      <Tabs.Screen name="profile/edit" options={{ href: null }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="earnings" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="reviews" options={{ href: null }} />
    </Tabs>
  );
}
