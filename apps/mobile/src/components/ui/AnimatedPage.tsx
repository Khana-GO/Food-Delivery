import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp } from 'react-native-reanimated';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  duration?: number;
  slide?: boolean;
}

export default function AnimatedPage({ children, style, delay = 0, duration = 180, slide = false }: Props) {
  const entering = slide ? SlideInUp.duration(duration).delay(delay).springify().damping(18) : FadeIn.duration(duration).delay(delay);
  return (
    <Animated.View entering={entering} exiting={FadeOut.duration(140)} style={[styles.base, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1 },
});
