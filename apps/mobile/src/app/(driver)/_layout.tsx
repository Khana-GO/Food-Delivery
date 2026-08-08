import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

interface TabIconProps {
  name: React.ComponentProps<typeof Feather>['name'];
  label: string;
  focused: boolean;
  size?: number;
}

const TabIcon = ({ name, label, focused, size = 24 }: TabIconProps) => (
  <View className="items-center justify-center gap-0.5 pt-1">
    <Feather
      name={name}
      size={size}
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

export default function DriverLayout() {
  const { isInitializing } = useAuth();
  useProtectedRoute(['DRIVER']);

  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;

  const tabBarHeight = useMemo(() => {
    if (isTablet) return 80;
    if (isLandscape) return 60;
    return 68;
  }, [isTablet, isLandscape]);

  const iconSize = useMemo(() => {
    if (isTablet) return 28;
    if (isLandscape) return 22;
    return 24;
  }, [isTablet, isLandscape]);

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <View className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8ECF0',
          height: tabBarHeight,
          paddingBottom: isTablet ? 12 : 8,
          paddingTop: 4,
          elevation: isTablet ? 12 : 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isTablet ? 0.08 : 0.05,
          shadowRadius: isTablet ? 12 : 8,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="navigation" label="Deliveries" focused={focused} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="available-orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="clipboard" label="Available" focused={focused} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="active-delivery"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="truck" label="Active" focused={focused} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="dollar-sign" label="Earnings" focused={focused} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="user" label="Profile" focused={focused} size={iconSize} />
          ),
        }}
      />
    </Tabs>
  );
}