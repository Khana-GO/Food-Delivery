import React from 'react';
import { Pressable, Text, View, useWindowDimensions, StyleProp, ViewStyle, StyleSheet } from 'react-native';
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
      {customIcon || (
        <Feather
          name={resolvedName}
          size={size}
          color={focused ? Colors.primary : '#94A3B8'}
          strokeWidth={focused ? 2.4 : 2}
        />
      )}
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

export function NoHoverTabButton({
  children,
  onPress,
  onLongPress,
  style,
  accessibilityLabel,
  accessibilityRole,
  testID,
}: {
  children?: any;
  onPress?: any;
  onLongPress?: any;
  style?: any;
  accessibilityLabel?: any;
  accessibilityRole?: any;
  testID?: any;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      onPress={onPress}
      onLongPress={onLongPress}
      testID={testID}
      style={[{ backgroundColor: 'transparent' }, style]}
    >
      {children}
    </Pressable>
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

  const baseBarHeight = isTablet ? 72 : isLandscape ? 56 : 60;
  const borderRadius = isTablet ? 36 : isVeryCompact ? 26 : 28;
  const hMargin = isTablet ? 20 : isVeryCompact ? 6 : 8;
  const vPad = isVeryCompact ? 5 : 6;

  const tabBarStyle: StyleProp<ViewStyle> = {
    backgroundColor: 'rgba(255,255,255,0.92)',
    height: baseBarHeight,
    minHeight: baseBarHeight,
    paddingTop: vPad,
    paddingBottom: vPad,
    paddingHorizontal: isTablet ? 16 : 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius,
    marginTop: 0,
    marginHorizontal: hMargin,
    marginBottom: Math.max(insets.bottom + 6, 10),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(151,162,178,0.25)',
    ...Shadow.floating,
  };

  const tabBarItemStyle: StyleProp<ViewStyle> = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  };

  return { iconSize, labelSize, tabBarStyle, tabBarItemStyle, isTablet, isVeryCompact, isCompact, insets };
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 2,
    marginTop: -7,
  },
  label: {
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    letterSpacing: 0.15,
    lineHeight: 14,
    alignSelf: 'center',
    marginTop: 0,
  },
});