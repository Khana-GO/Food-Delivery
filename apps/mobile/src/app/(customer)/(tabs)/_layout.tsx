import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, useWindowDimensions, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TabIconProps {
  name: React.ComponentProps<typeof Feather>['name'];
  label: string;
  focused: boolean;
  size?: number;
  fontSize?: number;
}

const TabIcon = ({ name, label, focused, size = 24, fontSize = 10 }: TabIconProps) => (
  <View className="items-center justify-center gap-0.5 pt-1">
    <Feather
      name={name}
      size={size}
      color={focused ? '#E23744' : '#94A3B8'}
      strokeWidth={focused ? 2.5 : 2}
    />
    <Text
      className={`font-medium ${
        focused ? 'text-primary font-bold' : 'text-slate-400'
      }`}
      style={{ fontSize }}
    >
      {label}
    </Text>
  </View>
);

export default function TabsLayout() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const isSmallPhone = width < 375;

  const tabBarHeight = useMemo(() => {
    if (isTablet) return 85;
    if (isLandscape) return 58;
    if (isSmallPhone) return 60;
    return 68;
  }, [isTablet, isLandscape, isSmallPhone]);

  const iconSize = useMemo(() => {
    if (isTablet) return 28;
    if (isLandscape) return 20;
    if (isSmallPhone) return 20;
    return 24;
  }, [isTablet, isLandscape, isSmallPhone]);

  const labelFontSize = useMemo(() => {
    if (isTablet) return 12;
    if (isLandscape) return 9;
    if (isSmallPhone) return 9;
    return 10;
  }, [isTablet, isLandscape, isSmallPhone]);

  const paddingBottom = useMemo(() => {
    if (isTablet) return 12;
    if (isLandscape) return 6;
    return 8;
  }, [isTablet, isLandscape]);

  const paddingTop = useMemo(() => {
    if (isTablet) return 6;
    return 4;
  }, [isTablet]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
          borderTopColor: '#E8ECF0',
          height: tabBarHeight,
          paddingBottom: paddingBottom,
          paddingTop: paddingTop,
          elevation: isTablet ? 12 : 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: isTablet ? 0.1 : 0.05,
          shadowRadius: isTablet ? 16 : 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" label="Home" focused={focused} size={iconSize} fontSize={labelFontSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="search" label="Explore" focused={focused} size={iconSize} fontSize={labelFontSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="clock" label="Orders" focused={focused} size={iconSize} fontSize={labelFontSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="heart" label="Favorites" focused={focused} size={iconSize} fontSize={labelFontSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="user" label="Profile" focused={focused} size={iconSize} fontSize={labelFontSize} />
          ),
        }}
      />
    </Tabs>
  );
}