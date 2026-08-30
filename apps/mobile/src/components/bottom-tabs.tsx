import React from 'react';
import { Text, View, useWindowDimensions, StyleProp, ViewStyle, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

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
      <View
        style={[
          styles.iconCircle,
          focused && styles.iconCircleFocused,
        ]}
      >
        <Feather
          name={resolvedName}
          size={size}
          color={focused ? Colors.primary : '#94A3B8'}
          strokeWidth={focused ? 2.4 : 2}
        />
      </View>
      <Text
        style={[
          styles.label,
          {
            fontSize: labelSize,
            color: focused ? Colors.primary : '#94A3B8',
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

export function useTabBarConstants() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 768;
  const isVeryCompact = width < 360;
  const isCompact = width < 375;
  const isLandscape = width > height && !isTablet;

  // Increased sizes & height so labels are never clipped on 320-360px
  const iconSize = isTablet ? 24 : isVeryCompact ? 20 : isCompact ? 21 : 22;
  const labelSize = isTablet ? 11 : isVeryCompact ? 9 : isCompact ? 9.5 : 10;

  const baseBarHeight = isTablet ? 78 : isLandscape ? 56 : isVeryCompact ? 66 : isCompact ? 68 : 70;

  const tabBarStyle: StyleProp<ViewStyle> = {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(226,232,240,0.9)',
    height: Platform.OS === 'ios' ? baseBarHeight + insets.bottom : baseBarHeight + Math.max(insets.bottom, 0),
    minHeight: baseBarHeight + Math.max(insets.bottom, 0),
    paddingBottom: Math.max(insets.bottom, isVeryCompact ? 6 : 8),
    paddingTop: isTablet ? 10 : isVeryCompact ? 8 : 10,
    paddingHorizontal: isTablet ? 12 : isVeryCompact ? 4 : 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  };

  const tabBarItemStyle: StyleProp<ViewStyle> = {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isVeryCompact ? 2 : isCompact ? 3 : 6,
    paddingVertical: 4,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconCircleFocused: {
    backgroundColor: '#FEF2F2',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FECACA',
  },
  label: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    letterSpacing: 0.15,
    lineHeight: 12,
  },
});
