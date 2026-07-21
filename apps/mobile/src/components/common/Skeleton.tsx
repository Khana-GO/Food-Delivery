import React, { useEffect } from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Colors, Radius } from '@/constants/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = Radius.sm, style }: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        style,
        animatedStyle,
      ]}
    />
  );
}

export function HomeSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="60%" height={24} />
          <Skeleton width="40%" height={16} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Skeleton width={38} height={38} borderRadius={19} />
          <Skeleton width={38} height={38} borderRadius={19} />
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <Skeleton width="100%" height={48} borderRadius={Radius.xl} />
      </View>

      {/* Categories */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 16, marginBottom: 24 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={{ alignItems: 'center', gap: 6 }}>
            <Skeleton width={58} height={58} borderRadius={18} />
            <Skeleton width={40} height={12} />
          </View>
        ))}
      </View>

      {/* Banner */}
      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <Skeleton width="80%" height={140} borderRadius={Radius['2xl']} />
      </View>

      {/* Restaurants */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <Skeleton width={150} height={20} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ width: '48%', gap: 8, marginBottom: 16 }}>
            <Skeleton width="100%" height={110} borderRadius={Radius.xl} />
            <Skeleton width="70%" height={16} />
            <Skeleton width="40%" height={12} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.border,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
});
