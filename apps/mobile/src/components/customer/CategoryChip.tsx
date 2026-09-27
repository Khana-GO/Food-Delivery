import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, Animated, StyleSheet, Platform } from 'react-native';
import { Colors, Radius, Shadow } from '@/constants/theme';

const isNative = Platform.OS !== 'web';

interface Props {
  label: string;
  icon?: string;
  count?: number;
  isSelected?: boolean;
  size?: 'sm' | 'md';
  onPress?: () => void;
}

const CategoryChipComponent = ({ label, icon, count, isSelected = false, size = 'md', onPress }: Props) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handleIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: isNative, speed: 50, bounciness: 6 }).start();
  const handleOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: isNative, speed: 40, bounciness: 8 }).start();
  const isSm = size === 'sm';

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handleIn}
        onPressOut={handleOut}
        activeOpacity={0.88}
        style={[styles.base, isSm && styles.baseSm, isSelected ? styles.selected : styles.idle]}
      >
        {icon ? <Text style={[styles.icon, isSm && styles.iconSm]}>{icon}</Text> : null}
        <Text style={[styles.text, isSm && styles.textSm, isSelected ? styles.textSelected : styles.textIdle]} numberOfLines={1}>
          {label}
        </Text>
        {typeof count === 'number' && count > 0 ? (
          <View style={[styles.badge, isSm && styles.badgeSm, isSelected ? styles.badgeSelected : styles.badgeIdle]}>
            <Text style={[styles.badgeText, isSm && styles.badgeTextSm, isSelected ? styles.badgeTextSelected : styles.badgeTextIdle]}>
              {count}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const CategoryChip = React.memo(CategoryChipComponent);

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    // Caps the chip so a long category name ellipsizes instead of growing
    // wider than the viewport inside the horizontal rail.
    maxWidth: 240,
  },
  baseSm: {
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    maxWidth: 200,
  },
  idle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    ...Shadow.xs,
  },
  selected: {
    backgroundColor: '#FEF2F2',
    borderColor: Colors.primary,
    ...Shadow.sm,
  },
  icon: {
    fontSize: 16,
  },
  iconSm: {
    fontSize: 13,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  textSm: {
    fontSize: 10,
  },
  textIdle: {
    color: '#334155',
  },
  textSelected: {
    color: Colors.primary,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 999,
  },
  badgeSm: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeIdle: {
    backgroundColor: '#F1F5F9',
  },
  badgeSelected: {
    backgroundColor: Colors.primary,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextSm: {
    fontSize: 9,
  },
  badgeTextIdle: {
    color: '#64748B',
  },
  badgeTextSelected: {
    color: '#FFFFFF',
  },
});
