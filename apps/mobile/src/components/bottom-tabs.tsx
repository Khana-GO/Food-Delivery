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
  customIcon?: React.ReactNode;
}

export function TabIcon({ name, label, focused, size, labelSize, customIcon }: TabIconProps) {
  const resolvedName = resolveIconName(name);
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.iconCircle, focused && styles.iconCircleFocused]}>
        {customIcon || (
          <Feather
            name={resolvedName}
            size={size}
            color={focused ? '#FFFFFF' : '#94A3B8'}
            strokeWidth={focused ? 2.4 : 2}
          />
        )}
      </View>
      <Text
        style={[
          styles.label,
          {
            fontSize: labelSize,
            color: focused ? Colors.primary : '#64748B',
            fontWeight: focused ? '800' : '600',
          },
        ]}
        numberOfLines={1}
        allowFontScaling={false}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
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

  const iconSize = isTablet ? 22 : isVeryCompact ? 18 : isCompact ? 20 : 21;
  const labelSize = isTablet ? 12 : isVeryCompact ? 9.5 : isCompact ? 10 : 11;

  const baseBarHeight = isTablet ? 82 : isLandscape ? 64 : 72;

  const tabBarStyle: StyleProp<ViewStyle> = {
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? baseBarHeight + insets.bottom : baseBarHeight + Math.max(insets.bottom, 8),
    minHeight: baseBarHeight + Math.max(insets.bottom, 8),
    paddingBottom: Math.max(insets.bottom, 6),
    paddingTop: 8,
    paddingHorizontal: isTablet ? 12 : 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 28,
    marginHorizontal: isTablet ? 16 : 8,
    marginBottom: Math.max(insets.bottom > 0 ? 4 : 8, 6),
    marginTop: 0,
    ...Shadow.floating,
  };

  const tabBarItemStyle: StyleProp<ViewStyle> = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 0,
  };

  return { iconSize, labelSize, tabBarStyle, tabBarItemStyle, isTablet, isVeryCompact, isCompact, insets };
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 2,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
    lineHeight: 14,
    marginTop: 3,
  },
});