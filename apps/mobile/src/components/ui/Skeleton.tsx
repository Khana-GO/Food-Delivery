import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, ViewStyle } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');

function Shimmer({ style }: { style?: any }) {
  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[style, { opacity, backgroundColor: '#E8ECF0' }]} />;
}

export function SkeletonBox({ width: w, height: h, radius = Radius.md, style }: { width?: number | string; height: number; radius?: number; style?: any }) {
  return <Shimmer style={[{ width: w as any, height: h, borderRadius: radius }, style]} />;
}

export function CardSkeleton({ count = 2, variant = 'grid' }: { count?: number; variant?: 'grid' | 'list' }) {
  if (variant === 'list') {
    return (
      <View style={styles.listWrap}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} style={styles.listCard}>
            <Shimmer style={styles.listImg} />
            <View style={{ flex: 1, gap: 8 }}>
              <Shimmer style={{ height: 14, borderRadius: 6, width: '70%' }} />
              <Shimmer style={{ height: 10, borderRadius: 6, width: '45%' }} />
              <Shimmer style={{ height: 10, borderRadius: 6, width: '35%' }} />
            </View>
          </View>
        ))}
      </View>
    );
  }
  const CARD_WIDTH = (width - 16 * 2 - 10) / 2;
  return (
    <View style={styles.gridWrap}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.gridCard, { width: CARD_WIDTH }]}>
          <Shimmer style={{ height: 118, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl }} />
          <View style={{ padding: 12, gap: 8 }}>
            <Shimmer style={{ height: 12, borderRadius: 6, width: '80%' }} />
            <Shimmer style={{ height: 10, borderRadius: 6, width: '55%' }} />
            <Shimmer style={{ height: 10, borderRadius: 6, width: '40%' }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function PageSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: 16 }}>
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <Shimmer style={{ height: 18, borderRadius: 8, width: '42%' }} />
        <Shimmer style={{ height: 42, borderRadius: Radius.lg, width: '100%' }} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} style={{ height: 32, borderRadius: Radius.full, width: 72 }} />
          ))}
        </View>
      </View>
      <View style={{ marginTop: 16 }}>
        <CardSkeleton count={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: { paddingHorizontal: 16, gap: 10 },
  listCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: 12,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  listImg: { width: 72, height: 72, borderRadius: Radius.lg },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
});
