import React from "react";
import { Tabs } from "expo-router";
import { View, Text, useWindowDimensions, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

interface TabIconProps {
  name: React.ComponentProps<typeof Feather>["name"];
  label: string;
  focused: boolean;
  size?: number;
  fontSize?: number;
}

const TabIcon = ({
  name,
  label,
  focused,
  size = 22,
  fontSize = 10,
}: TabIconProps) => (
  <View
    style={{ alignItems: "center", justifyContent: "center", paddingTop: 4 }}
  >
    <Feather
      name={name}
      size={size}
      color={focused ? "#E23744" : "#94A3B8"}
      strokeWidth={focused ? 2.5 : 2}
    />
    <Text
      style={{
        fontSize,
        fontWeight: focused ? "700" : "500",
        color: focused ? "#E23744" : "#94A3B8",
        marginTop: 2,
      }}
    >
      {label}
    </Text>
  </View>
);

export default function AdminLayout() {
  const { isInitializing } = useAuth();
  useProtectedRoute(["ADMIN"]);

  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  const tabBarHeight = Platform.OS === "ios" ? (isCompact ? 74 : 80) : 72;
  const iconSize = isCompact ? 18 : 21;
  const labelFontSize = isCompact ? 9 : 10;
  const tabBarPaddingBottom = Platform.OS === "ios" ? 10 : 8;
  const tabBarPaddingTop = Platform.OS === "ios" ? 6 : 4;

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <View className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: Platform.OS === "ios" ? 0.5 : 1,
          borderTopColor: "#E8ECF0",
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: tabBarPaddingTop,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="bar-chart-2"
              label="Dashboard"
              focused={focused}
              size={iconSize}
              fontSize={labelFontSize}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="users"
              label="Users"
              focused={focused}
              size={iconSize}
              fontSize={labelFontSize}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="restaurants"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="home"
              label="Restaurants"
              focused={focused}
              size={iconSize}
              fontSize={labelFontSize}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="shopping-bag"
              label="Orders"
              focused={focused}
              size={iconSize}
              fontSize={labelFontSize}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="pie-chart"
              label="Analytics"
              focused={focused}
              size={iconSize}
              fontSize={labelFontSize}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="settings"
              label="Settings"
              focused={focused}
              size={iconSize}
              fontSize={labelFontSize}
            />
          ),
        }}
      />

      <Tabs.Screen name="user/[id]" options={{ href: null }} />
      <Tabs.Screen name="restaurant/[id]" options={{ href: null }} />
      <Tabs.Screen name="order/[id]" options={{ href: null }} />
    </Tabs>
  );
}
