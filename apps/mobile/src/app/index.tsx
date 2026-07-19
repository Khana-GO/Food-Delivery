import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

// KhanaGo Bowl Logo SVG-like using React Native View
function KhanaGoLogo() {
  return (
    <View style={styles.logoContainer}>
      <View style={styles.logoBox}>
        {/* Bowl icon area */}
        <Text style={styles.logoIcon}>🍜</Text>
      </View>
    </View>
  );
}

// Three animated dots
function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );

    Animated.parallel([
      animate(dot1, 0),
      animate(dot2, 200),
      animate(dot3, 400),
    ]).start();
  }, []);

  return (
    <View style={styles.dotsRow}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
      ))}
    </View>
  );
}

export default function SplashPage() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    // Auto-navigate after 2.5s
    const timer = setTimeout(() => {
      router.replace('/onboarding' as any);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <Animated.View
        style={[styles.centerContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      >
        <KhanaGoLogo />

        <Text style={styles.appName}>
          <Text style={styles.appNameBlack}>Khana</Text>
          <Text style={styles.appNameOrange}>Go</Text>
        </Text>

        <Text style={styles.tagline}>Delicious Food, Delivered Fast.</Text>
      </Animated.View>

      <View style={styles.bottom}>
        <LoadingDots />
        <Text style={styles.loadingText}>Loading your cravings...</Text>

        <View style={styles.tagStrip}>
          <Text style={styles.tagStripText}>Fresh · Reliable · Premium</Text>
          <View style={styles.tagStripBar}>
            <View style={styles.tagStripFill} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 48,
  },
  appName: {
    fontSize: 38,
    marginBottom: 10,
  },
  appNameBlack: {
    color: '#1F2937',
    fontWeight: '800',
  },
  appNameOrange: {
    color: Colors.primary,
    fontWeight: '800',
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  bottom: {
    alignItems: 'center',
    paddingBottom: 60,
    gap: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  tagStrip: {
    alignItems: 'center',
    gap: 8,
  },
  tagStripText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tagStripBar: {
    width: 160,
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 99,
    overflow: 'hidden',
  },
  tagStripFill: {
    width: '45%',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 99,
  },
});