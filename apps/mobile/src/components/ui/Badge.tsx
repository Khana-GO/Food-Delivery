import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

type BadgeVariant = 'success' | 'error' | 'warning' | 'primary' | 'neutral' | 'outline' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export default function Badge({ label, variant = 'neutral', style, size = 'md' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], size === 'sm' && styles.sm, style]}>
      <Text style={[styles.text, styles[`text_${variant}`], size === 'sm' && styles.textSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sm: { paddingHorizontal: 8, paddingVertical: 3 },
  success: { backgroundColor: Colors.successLight, borderColor: '#BBF7D0' },
  error: { backgroundColor: Colors.errorLight, borderColor: '#FECACA' },
  warning: { backgroundColor: Colors.warningLight, borderColor: '#FDE68A' },
  primary: { backgroundColor: Colors.primaryLight, borderColor: '#FECACA' },
  info: { backgroundColor: "#6366F1", borderColor: "#DBEAFE" },
  neutral: { backgroundColor: '#F8FAFC', borderColor: Colors.border },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' as const },
  textSm: { fontSize: 10 },
  text_success: { color: '#15803D' },
  text_error: { color: Colors.error },
  text_warning: { color: '#B45309' },
  text_primary: { color: Colors.primaryDark },
  text_info: { color: '#1D4ED8' },
  text_neutral: { color: Colors.textSecondary },
  text_outline: { color: Colors.textSecondary },
});
