import React from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused ? styles.tabLabelFocused : styles.tabLabelNormal]}>
        {label}
      </Text>
    </View>
  );
}

export default function RestaurantLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🍴" label="Menu" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🗂️" label="Categories" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 68,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingTop: 4,
  },
  tabEmoji: { fontSize: 22, opacity: 0.45 },
  tabEmojiFocused: { opacity: 1 },
  tabLabel: { fontSize: 10, fontWeight: '500' },
  tabLabelFocused: { color: Colors.primary, fontWeight: '700' },
  tabLabelNormal: { color: Colors.textSecondary },
});
