import React from 'react';
import {
  Text,
  View,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
  StyleSheet,
  Platform,
} from 'react-native';
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
          {
            fontSize: labelSize,
            color: focused ? ACCENT : MUTED,
            fontWeight: focused ? '700' : '500',
          },
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
        allowFontScaling={false}
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
  const isVeryCompact = width < 360;
  const isCompact = width < 375;
  const isLandscape = width > height && !isTablet;

  // Responsive icon/label sizes – optimized for 6 tabs (admin) on small screens
  const iconSize = isTablet
    ? 24
    : isVeryCompact
      ? 18
      : isCompact
        ? 19
        : isLandscape
          ? 18
          : 22;

  const labelSize = isTablet
    ? 11
    : isVeryCompact
      ? 7
      : isCompact
        ? 7.5
        : isLandscape
          ? 8
          : 9;

  const baseBarHeight = isTablet
    ? 76
    : isLandscape
      ? 52
      : isVeryCompact
        ? 56
        : isCompact
          ? 58
          : 62;

  // Use minHeight on Android to allow content to fit when labels are slightly larger
  const tabBarStyle: StyleProp<ViewStyle> = {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8ECF0',
    height: Platform.OS === 'ios' ? baseBarHeight + insets.bottom : baseBarHeight + Math.max(insets.bottom, 0),
    minHeight: baseBarHeight + Math.max(insets.bottom, 0),
    paddingBottom: Math.max(insets.bottom, isVeryCompact ? 4 : 6),
    paddingTop: isTablet ? 10 : isVeryCompact ? 4 : 6,
    paddingHorizontal: isTablet ? 16 : isVeryCompact ? 2 : isCompact ? 4 : 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: isTablet ? 12 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: isTablet ? 0.1 : 0.05,
    shadowRadius: isTablet ? 16 : 8,
  };

  const tabBarItemStyle: StyleProp<ViewStyle> = {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isVeryCompact ? 1 : isCompact ? 2 : 4,
    paddingVertical: 2,
  };

  return { iconSize, labelSize, tabBarStyle, tabBarItemStyle, isTablet, isVeryCompact, isCompact, insets };
}

const styles = StyleSheet.create({
  iconWrap: {
    flex: 1,
    minWidth: 0,
    maxWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 2,
  },
  label: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
