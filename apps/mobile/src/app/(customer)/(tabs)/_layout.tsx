import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TabIconProps {
  name: React.ComponentProps<typeof Feather>['name'];
  label: string;
  focused: boolean;
}

const TabIcon = ({ name, label, focused }: TabIconProps) => (
  <View className="items-center justify-center gap-0.5 pt-1">
    <Feather
      name={name}
      size={24}
      color={focused ? '#E23744' : '#94A3B8'}
      strokeWidth={focused ? 2.5 : 2}
    />
    <Text
      className={`text-[10px] font-medium ${
        focused ? 'text-primary font-bold' : 'text-slate-400'
      }`}
    >
      {label}
    </Text>
  </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8ECF0',
          height: 68,
          paddingBottom: 8,
          paddingTop: 4,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="home" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="search" label="Explore" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="clock" label="Orders" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="heart" label="Favorites" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="user" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}