import React, { useRef } from 'react';
import { Animated, Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, Radius, Spacing, Shadow } from '@/constants/theme';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'secondary';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    if (isDisabled) return;
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 6 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
  };

  return (
    <Pressable onPress={onPress} disabled={isDisabled} onPressIn={onPressIn} onPressOut={onPressOut} style={{ opacity: isDisabled ? 0.55 : 1 }}>
      <Animated.View
        style={[
          styles.base,
          styles[variant],
          styles[`size_${size}`],
          fullWidth && styles.fullWidth,
          variant === 'primary' && Shadow.primary,
          variant === 'danger' && Shadow.sm,
          { transform: [{ scale }] },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : Colors.primary} size="small" />
        ) : (
          <>
            {leftIcon}
            <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>{label}</Text>
            {rightIcon}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    gap: Spacing.sm,
  },
  fullWidth: { width: '100%' },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.textDark },
  outline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: Colors.border,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: Colors.error },
  size_sm: { paddingVertical: 9, paddingHorizontal: 16, minHeight: 36 },
  size_md: { paddingVertical: 12, paddingHorizontal: 20, minHeight: 44 },
  size_lg: { paddingVertical: 15, paddingHorizontal: 24, minHeight: 52 },
  text: { fontWeight: '700', letterSpacing: 0.2 },
  text_primary: { color: '#fff' },
  text_secondary: { color: '#fff' },
  text_outline: { color: Colors.textDark },
  text_ghost: { color: Colors.primary },
  text_danger: { color: '#fff' },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 14 },
  textSize_lg: { fontSize: 15 },
});
