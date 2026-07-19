import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

type BadgeVariant = 'success' | 'error' | 'warning' | 'primary' | 'neutral' | 'outline';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export default function Badge({ label, variant = 'neutral', style }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },

  success: { backgroundColor: Colors.successLight },
  error: { backgroundColor: Colors.errorLight },
  warning: { backgroundColor: Colors.warningLight },
  primary: { backgroundColor: Colors.primaryLight },
  neutral: { backgroundColor: Colors.backgroundAlt },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  text: { fontSize: 12, fontWeight: '600' },
  text_success: { color: '#16A34A' },
  text_error: { color: Colors.error },
  text_warning: { color: '#D97706' },
  text_primary: { color: Colors.primaryDark },
  text_neutral: { color: Colors.textSecondary },
  text_outline: { color: Colors.textSecondary },
});
