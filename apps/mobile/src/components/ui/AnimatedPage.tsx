import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  duration?: number;
  slide?: boolean;
}

export default function AnimatedPage({ children, style, delay = 0, duration = 220, slide = false }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slide ? 10 : 0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }),
        slide
          ? Animated.timing(translateY, { toValue: 0, duration, useNativeDriver: true })
          : Animated.timing(translateY, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, [opacity, translateY, delay, duration, slide]);

  return (
    <Animated.View style={[styles.base, { opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1 },
});
