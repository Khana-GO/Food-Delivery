import { Text } from '@/components/ui/Text';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { router } from 'expo-router';

import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/authStore';


function KhanaGoLogo() {
  return (
    <View style={styles.logoWrapper}>
      <Image 
        source={require('../../assets/images/app_logo.png')} 
        style={styles.realLogo} 
        resizeMode="contain"
      />
    </View>
  );
}

function LoadingDots() {
  const fade1 = useRef(new Animated.Value(0.3)).current;
  const fade2 = useRef(new Animated.Value(0.3)).current;
  const fade3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.delay(400),
        ])
      );

    Animated.parallel([
      animate(fade1, 0),
      animate(fade2, 200),
      animate(fade3, 400),
    ]).start();
  }, []);

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, { opacity: fade1 }]} />
      <Animated.View style={[styles.dot, { opacity: fade2 }]} />
      <Animated.View style={[styles.dot, { opacity: fade3 }]} />
    </View>
  );
}

export default function SplashPage() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start();

    // Auto-navigate after 2.5s
    const timer = setTimeout(async () => {
      try {
        const authState = useAuthStore.getState();
        if (authState.isAuthenticated && authState.activeRole) {
          if (authState.activeRole === 'RESTAURANT_OWNER') {
            router.replace('/(restaurant)' as any);
          } else if (authState.activeRole === 'DRIVER') {
            router.replace('/(driver)' as any);
          } else if (authState.activeRole === 'ADMIN') {
            router.replace('/(admin)' as any);
          } else {
            router.replace('/(customer)' as any);
          }
          return;
        }

        const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
        if (hasSeen === 'true') {
          router.replace('/auth/login' as any);
        } else {
          router.replace('/onboarding' as any);
        }
      } catch (e) {
        router.replace('/onboarding' as any);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '60%'], // Fills to about 60% before navigating
  });

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
          <Feather name="shield" size={12} color="#94A3B8" />
          <Text style={styles.tagStripText}>Fresh · Reliable · Premium</Text>
        </View>

        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  realLogo: {
    width: 140,
    height: 140,
  },
  appName: {
    fontSize: 34,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  appNameBlack: {
    color: '#1E293B',
    fontWeight: '900',
  },
  appNameOrange: {
    color: Colors.primary,
    fontWeight: '900',
  },
  tagline: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  bottom: {
    alignItems: 'center',
    paddingBottom: 40,
    width: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    fontWeight: '500',
  },
  tagStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  tagStripText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  progressBarBg: {
    width: 160,
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});