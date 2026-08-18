import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  StatusBar,
  Easing,
  Dimensions,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { getHomeRoute } from 'lib/roles';

// ... (KhanaGoLogo, LoadingDots remain the same)

export default function SplashPage() {
  const { isAuthenticated, isInitializing, role } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const textScale = isTablet ? 1.2 : 1;

  const navigateToNext = useCallback(async () => {
    if (isInitializing) return;

    if (isAuthenticated && role) {
      router.replace(getHomeRoute(role) as any);
      return;
    }

    try {
      const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
      if (hasSeen === 'true') {
        router.replace('/(auth)/login' as any);
      } else {
        router.replace('/onboarding' as any);
      }
    } catch {
      router.replace('/onboarding' as any);
    }
  }, [isAuthenticated, isInitializing, role]);

  const handleSkip = useCallback(() => {
    // Stop the timer and navigate immediately
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Optionally, you can also stop the progress animation
    progressAnim.stopAnimation();
    navigateToNext();
  }, [navigateToNext, progressAnim]);

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Progress bar – 60 seconds (or 2.5s for production)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    // Auto‑navigate after 61 seconds
    timerRef.current = setTimeout(navigateToNext, 2500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      progressAnim.stopAnimation();
    };
  }, [fadeAnim, progressAnim, navigateToNext]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable className="flex-1 bg-white" onPress={handleSkip}>
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />

        <Animated.View
          className="flex-1 items-center justify-center px-6"
          style={{ opacity: fadeAnim }}
        >
          {/* <KhanaGoLogo /> */}

          <Text className="font-extrabold tracking-tight mb-2" style={{ fontSize: 34 * textScale }}>
            <Text className="text-slate-800">Khana</Text>
            <Text className="text-primary">Go</Text>
          </Text>

          <Text className="text-slate-500 font-medium" style={{ fontSize: 15 * textScale }}>
            Delicious Food, Delivered Fast.
          </Text>

          {/* Optional: a small "Tap to skip" hint */}
          <Text className="text-slate-400 text-xs mt-8 opacity-60">Tap anywhere to skip</Text>
        </Animated.View>

        <View className="items-center pb-10 w-full">

          <Text className="text-slate-500 font-medium mb-6" style={{ fontSize: 14 * textScale }}>
            Loading your cravings...
          </Text>

          <View className="flex-row items-center gap-1.5 mb-4">
            <Feather name="shield" size={12} color="#94A3B8" />
            <Text className="text-slate-400 text-xs font-medium">Fresh · Reliable · Premium</Text>
          </View>

          <View
            className="h-1 bg-slate-100 rounded-full overflow-hidden"
            style={{ width: 160 * (isTablet ? 1.2 : 1) }}
          >
            <Animated.View
              className="h-full bg-primary rounded-full"
              style={{ width: progressWidth }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Pressable>
  );
}
