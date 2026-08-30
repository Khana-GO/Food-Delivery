import React, { useRef } from 'react';
import { Animated, Pressable, ViewStyle } from 'react-native';

export default function PressableScale({
  children,
  onPress,
  style,
  disabled,
  scaleTo = 0.97,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  scaleTo?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
      style={({ pressed }) => [style, { opacity: disabled ? 0.5 : pressed ? 0.98 : 1 }]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
}
