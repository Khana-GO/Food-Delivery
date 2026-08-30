import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  ViewStyle,
  Pressable,
  Platform,
} from 'react-native';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  radius?: number;
  elevation?: keyof typeof Shadow;
  pressable?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export default function PremiumCard({
  children,
  style,
  padding = 16,
  radius = Radius.xl,
  elevation = 'sm',
  pressable = false,
  onPress,
  disabled = false,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (!pressable || disabled) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, speed: 40, bounciness: 4 }),
      Animated.timing(shadowAnim, { toValue: 1, duration: 120, useNativeDriver: false }),
    ]).start();
  };
  const handlePressOut = () => {
    if (!pressable || disabled) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }),
      Animated.timing(shadowAnim, { toValue: 0, duration: 140, useNativeDriver: false }),
    ]).start();
  };

  const cardStyle: ViewStyle = {
    backgroundColor: Colors.white,
    borderRadius: radius,
    padding,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...Shadow[elevation],
  };

  if (pressable && onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [{ opacity: pressed ? 0.98 : 1 }]}
      >
        <Animated.View style={[cardStyle, { transform: [{ scale }] }, style]}>
          {children}
        </Animated.View>
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

export function GlassCard({ children, style, padding = 16 }: { children: React.ReactNode; style?: ViewStyle; padding?: number }) {
  return (
    <View
      style={[
        {
          backgroundColor: 'rgba(255,255,255,0.82)',
          borderRadius: Radius.xl,
          padding,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.6)',
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 3,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
