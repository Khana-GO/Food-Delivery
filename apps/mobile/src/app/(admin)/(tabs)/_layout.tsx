import React from 'react';
import { Tabs } from 'expo-router';
import { TabIcon, useTabBarConstants } from '@/components/bottom-tabs';

export default function AdminTabsLayout() {
  const { iconSize, labelSize, tabBarStyle, tabBarItemStyle } = useTabBarConstants();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle,
        tabBarItemStyle,
        tabBarHideOnKeyboard: true,
        animation: 'fade',
        sceneStyle: { backgroundColor: '#FAFAFB' },
      }}
    >
      <Tabs.Screen
  name="(tabs)/analytics"
  options={{
    tabBarIcon: ({ focused }) => (
      <TabIcon name="bar-chart-2" label="Analytics" focused={focused} size={iconSize} labelSize={labelSize} />
    ),
  }}
/>
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon name="bar-chart-2" label="Dashboard" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="users" options={{ tabBarIcon: ({ focused }) => <TabIcon name="users" label="Users" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="restaurants" options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" label="Restaurants" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="orders" options={{ tabBarIcon: ({ focused }) => <TabIcon name="shopping-bag" label="Orders" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="notifications" options={{ tabBarIcon: ({ focused }) => <TabIcon name="bell" label="Alerts" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon name="user" label="Profile" focused={focused} size={iconSize} labelSize={labelSize} /> }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
    </Tabs>
  );
}
