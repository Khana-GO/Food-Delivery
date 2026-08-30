import React from 'react';
import { Stack, Tabs } from 'expo-router';
import { TabIcon, useTabBarConstants } from '@/components/bottom-tabs';

export default function TabsLayout() {
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
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="home" label="Home" focused={focused} size={iconSize} labelSize={labelSize} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="search" label="Explore" focused={focused} size={iconSize} labelSize={labelSize} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="clock" label="Orders" focused={focused} size={iconSize} labelSize={labelSize} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="heart" label="Favorites" focused={focused} size={iconSize} labelSize={labelSize} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="user" label="Profile" focused={focused} size={iconSize} labelSize={labelSize} />,
        }}
      />

      <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
    </Tabs>
  );
}
