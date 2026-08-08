import React, { useMemo } from 'react';
// Imports React and the useMemo hook. useMemo helps optimize performance by memoizing (caching) values so they don't recalculate on every render.
import { Tabs } from 'expo-router';
//Imports the Tabs component from Expo Router. This creates a bottom tab navigation bar with swipeable screens.
import { View, Text, useWindowDimensions } from 'react-native';
// View is like a div in HTML – a container. Text displays text. useWindowDimensions is a hook that gives you the current screen size (width/height).
import { Feather } from '@expo/vector-icons';
// Imports the Feather icon library (clean, open-source icons). We use icons like home, menu, dollar-sign, etc.
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
// Imports a custom hook that protects routes. It checks if the user is logged in and has the correct role.
import { useAuth } from '@/contexts/AuthContext';
// Imports the authentication hook. It gives us access to the current user's info, loading state, etc.

interface TabIconProps {
  name: React.ComponentProps<typeof Feather>['name'];
  label: string;
  focused: boolean;  // true if this tab is currently selected/active.
  size?: number;  // Optional icon size (if not provided, it uses a default). The ? means it's optional.
}

// 	The icon name (e.g., 'home', 'menu'). This uses TypeScript magic to ensure you only use valid Feather icon names.
// 	The text label shown below the icon (e.g., "Home", "Menu").

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

export default function RestaurantLayout() {
  const { isInitializing } = useAuth();  // Destructures isInitializing from the auth context. isInitializing is true while the app is checking if the user is logged in.
  useProtectedRoute(['RESTAURANT_OWNER']);

  //Security check! This ensures ONLY users with the role 'RESTAURANT_OWNER' can access this layout. If a driver or customer tries to access it, they'll be redirected.

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
        headerShown: false,  // Hides the navigation header at the top of the screen.
        tabBarShowLabel: false,  // Hides the default labels (we're using our custom TabIcon component for labels).
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

     {/* Defines a tab for the screen at app/(restaurant)/dashboard.tsx. The name must match the file name. */}
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" label="Dashboard" focused={focused} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="restaurant/profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="store" label="Restaurant" focused={focused} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="menu" label="Menu" focused={focused} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="shopping-bag" label="Orders" focused={focused} size={iconSize} />
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
    </Tabs>
  );
}