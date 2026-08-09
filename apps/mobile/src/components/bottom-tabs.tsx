import React from 'react';
import { Text, View, useWindowDimensions, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TabIconName = React.ComponentProps<typeof Feather>['name'];

interface TabIconProps {
  name: TabIconName;
  label: string;
  focused: boolean;
  size: number;
  labelSize: number;
}

// Centered icon + label used by every role's tab bar.
export function TabIcon({ name, label, focused, size, labelSize }: TabIconProps) {
  return (
    <View style={styles.iconWrap}>
      <Feather
        name={name}
        size={size}
        color={focused ? ACCENT : MUTED}
        strokeWidth={focused ? 2.5 : 2}
      />
      <Text
        style={[
          styles.label,
          { fontSize: labelSize, color: focused ? ACCENT : MUTED, fontWeight: focused ? '700' : '500' },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const ACCENT = '#E23744';
const MUTED = '#94A3B8';

// Shared safe-area + responsive sizing for all role tab bars.
export function useTabBarConstants() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isTablet = width >= 768;
  const isLandscape = width > height;
  const compact = width < 375;

  const iconSize = isTablet ? 26 : isLandscape ? 20 : compact ? 20 : 23;
  const labelSize = isTablet ? 12 : isLandscape ? 9 : compact ? 9 : 10;

  const baseBarHeight = isTablet ? 78 : isLandscape ? 54 : compact ? 60 : 66;

  const tabBarStyle: StyleProp<ViewStyle> = {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8ECF0',
    height: baseBarHeight + insets.bottom,
    paddingBottom: Math.max(insets.bottom, 6),
    paddingTop: isTablet ? 10 : 6,
    elevation: isTablet ? 12 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: isTablet ? 0.1 : 0.05,
    shadowRadius: isTablet ? 16 : 8,
  };

  const tabBarItemStyle: StyleProp<ViewStyle> = {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  };

  return { iconSize, labelSize, tabBarStyle, tabBarItemStyle, isTablet, insets };
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    textAlign: 'center',
  },
});