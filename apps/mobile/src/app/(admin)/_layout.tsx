import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

// ────────────────────────────────────────────────────────────────────────────
// Tab Icon Component (reusable)
// ────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────
// Main Admin Layout
// ────────────────────────────────────────────────────────────────────────────

export default function AdminLayout() {
  const { isInitializing } = useAuth();
  useProtectedRoute(['ADMIN']);

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
          tabBarIcon: ({ focused }) => (
            <TabIcon name="bar-chart-2" label="Dashboard" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="restaurants"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" label="Restaurants" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="users" label="Users" focused={focused} />
          ),
        }}
      />

      {/* Hidden screens (if any) */}
      <Tabs.Screen name="restaurant/[id]" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}