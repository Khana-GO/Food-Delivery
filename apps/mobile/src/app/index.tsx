import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// KhanaGo Logo Component replicating the design
function KhanaGoLogo() {
  return (
    <View style={styles.logoWrapper}>
      {/* Background Soft Glow */}
      <View style={styles.glow} />
      
      {/* Decorative Speed Lines */}
      <View style={[styles.speedLine, styles.lineLeft1]} />
      <View style={[styles.speedLine, styles.lineLeft2]} />
      <View style={[styles.speedLine, styles.lineRight1]} />
      <View style={[styles.speedLine, styles.lineRight2]} />

      <View style={styles.logoBox}>
        <View style={styles.iconAssembly}>
           <Ionicons name="location" size={20} color="#FFF" style={styles.pinIcon} />
           <View style={styles.steamRow}>
              <Text style={styles.steamText}>S</Text>
              <Text style={styles.steamText}>S</Text>
              <Text style={styles.steamText}>S</Text>
           </View>
           <View style={styles.bowlWrapper}>
             <View style={styles.bowlLine} />
             <View style={styles.bowlBase} />
           </View>
        </View>
      </View>
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
    const timer = setTimeout(() => {
      router.replace('/onboarding' as any);
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
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    width: 200,
    height: 200,
  },
  glow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
    transform: [{ scale: 1.5 }],
  },
  logoBox: {
    width: 110,
    height: 110,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    zIndex: 10,
  },
  speedLine: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#FDBA74',
    borderRadius: 2,
    zIndex: 5,
  },
  lineLeft1: { width: 24, left: 10, top: 70 },
  lineLeft2: { width: 14, left: 14, top: 82 },
  lineRight1: { width: 18, right: 12, bottom: 82 },
  lineRight2: { width: 12, right: 12, bottom: 70 },
  iconAssembly: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  pinIcon: {
    marginBottom: -2,
  },
  steamRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  steamText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontStyle: 'italic',
    transform: [{ scaleY: 1.5 }, { skewY: '-15deg' }],
  },
  bowlWrapper: {
    alignItems: 'center',
  },
  bowlLine: {
    width: 48,
    height: 3,
    backgroundColor: '#FFF',
    borderRadius: 2,
    marginBottom: 0,
    transform: [{ rotate: '-10deg' }],
    zIndex: 2,
  },
  bowlBase: {
    width: 44,
    height: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderWidth: 3,
    borderTopWidth: 0,
    borderColor: '#FFF',
    marginTop: -2,
    backgroundColor: Colors.primary,
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