import React from 'react';
import { Text, View, useWindowDimensions, StyleProp, ViewStyle, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadow } from '@/constants/theme';

export type TabIconName = React.ComponentProps<typeof Feather>['name'];

const FEATHER_GLYPH_MAP: Record<string, number> | undefined = (Feather as any)?.glyphMap;
const ICON_ALIASES: Record<string, TabIconName> = {
  store: 'shopping-bag',
  soret: 'shopping-bag',
  sort: 'filter',
  shop: 'shopping-bag',
  restaurant: 'home',
  food: 'coffee',
};
if (FEATHER_GLYPH_MAP) {
  for (const [invalid, valid] of Object.entries(ICON_ALIASES)) {
    if (!(invalid in FEATHER_GLYPH_MAP) && valid in FEATHER_GLYPH_MAP) {
      (FEATHER_GLYPH_MAP as Record<string, number>)[invalid] = FEATHER_GLYPH_MAP[valid];
    }
  }
}
function resolveIconName(input: TabIconName): TabIconName {
  const aliased = ICON_ALIASES[input as string] ?? input;
  if (FEATHER_GLYPH_MAP && !(aliased in FEATHER_GLYPH_MAP)) {
    if (__DEV__) console.warn(`[TabIcon] "${String(input)}" fallback to circle`);
    return 'circle' as TabIconName;
  }
  return aliased;
}

interface TabIconProps {
  name: TabIconName;
  label: string;
  focused: boolean;
  size: number;
  labelSize: number;
}

export function TabIcon({ name, label, focused, size, labelSize }: TabIconProps) {
  const resolvedName = resolveIconName(name);
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.iconCircle, focused && styles.iconCircleFocused]}>
        <Feather
          name={resolvedName}
          size={size}
          color={focused ? '#FFFFFF' : '#94A3B8'}
          strokeWidth={focused ? 2.4 : 2}
        />
      </View>
      <Text
        style={[
          styles.label,
          {
            fontSize: labelSize,
            color: focused ? Colors.primary : '#94A3B8',
            fontWeight: focused ? '800' : '500',
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

export function useTabBarConstants() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 768;
  const isVeryCompact = width < 360;
  const isCompact = width < 375;
  const isLandscape = width > height && !isTablet;

  const iconSize = isTablet ? 28 : isVeryCompact ? 22 : isCompact ? 23 : 24;
  const labelSize = isTablet ? 12 : isVeryCompact ? 9.5 : isCompact ? 10 : 11;

  const baseBarHeight = isTablet ? 88 : isLandscape ? 64 : isVeryCompact ? 72 : isCompact ? 70 : 74;

  const tabBarStyle: StyleProp<ViewStyle> = {
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? baseBarHeight + insets.bottom : baseBarHeight + Math.max(insets.bottom, 0),
    minHeight: baseBarHeight + Math.max(insets.bottom, 0),
    paddingBottom: Math.max(insets.bottom, isVeryCompact ? 6 : isCompact ? 8 : 10),
    paddingTop: isTablet ? 14 : isVeryCompact ? 10 : isCompact ? 12 : 14,
    paddingHorizontal: isTablet ? 20 : isVeryCompact ? 10 : isCompact ? 12 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 32,
    marginHorizontal: isTablet ? 24 : isVeryCompact ? 8 : isCompact ? 12 : 16,
    marginBottom: isVeryCompact ? 6 : isCompact ? 8 : 10,
    marginTop: 0,
    ...Shadow.floating,
  };

  const tabBarItemStyle: StyleProp<ViewStyle> = {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isVeryCompact ? 4 : isCompact ? 6 : 8,
    paddingVertical: 6,
  };

  return { iconSize, labelSize, tabBarStyle, tabBarItemStyle, isTablet, isVeryCompact, isCompact, insets };
}

const styles = StyleSheet.create({
  iconWrap: {
    flex: 1,
    minWidth: 0,
    maxWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 2,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconCircleFocused: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 10,
    elevation: 6,
  },
  label: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    letterSpacing: 0.15,
    lineHeight: 12,
  },
});