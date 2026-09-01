import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated, StatusBar, Easing, Dimensions, Pressable, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { getHomeRoute } from 'lib/roles';
import { Colors, Radius, Shadow } from '@/constants/theme';

export default function SplashPage() {
  const { isAuthenticated, isInitializing, role } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const textScale = isTablet ? 1.15 : 1;

  const navigateToNext = useCallback(async () => {
    if (isInitializing) return;
    if (isAuthenticated && role) { router.replace(getHomeRoute(role) as any); return; }
    try {
      const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
      if (hasSeen === 'true') router.replace('/(auth)/login' as any);
      else router.replace('/onboarding' as any);
    } catch { router.replace('/onboarding' as any); }
  }, [isAuthenticated, isInitializing, role]);

  const handleSkip = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    progressAnim.stopAnimation();
    navigateToNext();
  }, [navigateToNext, progressAnim]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
    ]).start();
    Animated.timing(progressAnim, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.ease), useNativeDriver: false }).start();
    timerRef.current = setTimeout(navigateToNext, 2400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); progressAnim.stopAnimation(); };
  }, [fadeAnim, scaleAnim, progressAnim, navigateToNext]);

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Pressable onPress={handleSkip} style={{ flex: 1, backgroundColor: Colors.background }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={['bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} translucent />
        <Animated.View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <View style={styles.logoWrap}>
            <Image
              source={require('@/assets/images/logo/logo.png')}
              style={{ width: 56 * textScale, height: 56 * textScale, borderRadius: 14 }}
              resizeMode="contain"
            />
          </View>
          <Text style={{ fontWeight: '800', letterSpacing: -0.6, marginTop: 18, fontSize: 34 * textScale }}>
            <Text style={{ color: Colors.textDark }}>Khana</Text>
            <Text style={{ color: Colors.primary }}>Go</Text>
          </Text>
          <Text style={{ color: Colors.textSecondary, fontWeight: '500', marginTop: 6, fontSize: 14 * textScale }}>Delicious Food, Delivered Fast.</Text>
          <View style={styles.pill}>
            <Feather name="shield" size={12} color="#15803D" />
            <Text style={styles.pillText}>Fresh · Reliable · Premium</Text>
          </View>
          <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 22, fontWeight: '500' }}>Tap anywhere to skip</Text>
        </Animated.View>
        <View style={{ alignItems: 'center', paddingBottom: 36, gap: 14 }}>
          <Text style={{ color: Colors.textSecondary, fontWeight: '600', fontSize: 13 * textScale }}>Loading your cravings…</Text>
          <View style={[styles.track, { width: 168 * (isTablet ? 1.15 : 1) }]}>
            <Animated.View style={[styles.fill, { width: progressWidth }]} />
          </View>
        </View>
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    ...Shadow.md,
  },
  logoIcon: { fontWeight: '800' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  pillText: { fontSize: 11, fontWeight: '700', color: '#15803D', letterSpacing: 0.3 },
  track: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 999 },
});
