import React, { useRef } from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface Props {
  label: string;
  isSelected?: boolean;
  onPress?: () => void;
}

export const CategoryChip = ({ label, isSelected = false, onPress }: Props) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handleIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 8 }).start();
  const handleOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 10 }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handleIn}
        onPressOut={handleOut}
        activeOpacity={0.9}
        style={[styles.base, isSelected ? styles.selected : styles.idle]}
      >
        <Text style={[styles.text, isSelected ? styles.textSelected : styles.textIdle]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    marginRight: 8,
    borderWidth: 1,
  },
  idle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    ...Shadow.xs,
  },
  selected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadow.sm,
  },
  text: { fontSize: 13, fontWeight: '600', letterSpacing: 0.1 },
  textIdle: { color: Colors.textMedium },
  textSelected: { color: '#FFFFFF' },
});
