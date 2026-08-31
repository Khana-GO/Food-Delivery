import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  duration?: number;
  slide?: boolean;
}

export default function AnimatedPage({ children, style }: Props) {
  return <View style={[styles.base, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { flex: 1 },
});
