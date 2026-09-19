import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { NoHoverTabButton, TabIcon, useTabBarConstants } from '@/components/bottom-tabs';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';

export default function DriverLayout() {
  const { isInitializing } = useAuth();
  useProtectedRoute(['DRIVER']);

  const {
    iconSize,
    labelSize,
    tabBarStyle,
    tabBarItemStyle,
  } = useTabBarConstants();

  if (isInitializing) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderTabIcon = (
    name: any,
    label: string,
    focused: boolean,
    customIcon?: React.ReactNode,
  ) => (
    <View
      style={{
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TabIcon
        name={name}
        label={label}
        focused={focused}
        size={iconSize}
        labelSize={labelSize}
        customIcon={customIcon}
      />
    </View>
  );

  const renderEarningsIcon = (focused: boolean) => (
    <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: -7 }}>
        <Text
          style={{
            fontSize: iconSize - 1,
            fontWeight: '800',
            color: focused ? Colors.primary : '#94A3B8',
            includeFontPadding: false,
            lineHeight: iconSize + 2,
          }}
        >
          ₹
        </Text>
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          style={{
            fontSize: labelSize + 3,
            letterSpacing: 0.15,
            lineHeight: 13,
            marginTop: -1,
            color: focused ? Colors.primary : '#64748B',
            fontWeight: focused ? '800' : '600',
            textAlign: 'center',
          }}
        >
          Earnings
        </Text>
      </View>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: tabBarStyle,

        tabBarItemStyle: [
          tabBarItemStyle,
          {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 0,
          },
        ],

        tabBarHideOnKeyboard: true,

        tabBarButton: (props) => <NoHoverTabButton {...props} />,

        sceneStyle: {
          backgroundColor: 'transparent',
        },

        animation: 'fade',
      }}
    >
      <Tabs.Screen
        name="(tabs)/index"
        options={{
          tabBarIcon: ({ focused }) =>
            renderTabIcon('home', 'Home', focused),
        }}
      />

      <Tabs.Screen
        name="(tabs)/available-orders"
        options={{
          tabBarIcon: ({ focused }) =>
            renderTabIcon('shopping-bag', 'Orders', focused),
        }}
      />

      <Tabs.Screen
        name="(tabs)/active"
        options={{
          tabBarIcon: ({ focused }) =>
            renderTabIcon('truck', 'Active', focused),
        }}
      />

      <Tabs.Screen
        name="(tabs)/earnings"
        options={{
          tabBarIcon: ({ focused }) => renderEarningsIcon(focused),
        }}
      />

      <Tabs.Screen
        name="(tabs)/profile"
        options={{
          tabBarIcon: ({ focused }) =>
            renderTabIcon('user', 'Profile', focused),
        }}
      />

      <Tabs.Screen
        name="(tabs)/notifications"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="(tabs)/delivery-history"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="profile/edit"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}