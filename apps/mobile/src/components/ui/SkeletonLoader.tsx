import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, StyleProp, ViewStyle, AccessibilityInfo } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      accessibilityLabel="Loading placeholder"
      accessibilityRole="progressbar"
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: reduceMotion ? 0.6 : opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0',
  },
});
