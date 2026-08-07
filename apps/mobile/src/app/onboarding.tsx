import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------- data ----------------------------------------------------------------
const SLIDES = [
  {
    id: '1',
    title: 'Wide range of Food\nCategories & more',
    description:
      "Browse through our extensive list of restaurants and dishes, and when you're ready to order, simply add your desired items to your cart and checkout. It's that easy!",
    image: require('../../assets/images/onboarding_1.png') as number,
  },
  {
    id: '2',
    title: 'Free Deliveries for\nONE MONTH!!',
    description:
      'Get your favorite meals delivered to your doorstep for free with our online food delivery app - enjoy a whole month of complimentary delivery!',
    image: require('../../assets/images/onboarding_2.png') as number,
  },
  {
    id: '3',
    title: 'Get started on\nOrdering your Food',
    description:
      'Please create an account or sign in to your existing account to start browsing our selection of delicious meals from your favorite restaurants.',
    image: require('../../assets/images/onboarding_3.png') as number,
  },
] as const;

// ---------- component -----------------------------------------------------------
export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isProgrammatic = useRef(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Fade the text out → swap content → fade back in
  const changeIndex = useCallback(
    (next: number) => {
      if (next === activeIndex) return;
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(() => {
        setActiveIndex(next);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    },
    [activeIndex, fadeAnim]
  );

  const goToPage = useCallback(
    (index: number) => {
      isProgrammatic.current = true;
      scrollRef.current?.scrollTo({ x: index * width, animated: true });
      changeIndex(index);
      setTimeout(() => { isProgrammatic.current = false; }, 400);
    },
    [width, changeIndex]
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isProgrammatic.current) return;
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
      if (idx >= 0 && idx < SLIDES.length) changeIndex(idx);
    },
    [width, changeIndex]
  );

  const handleNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      goToPage(activeIndex + 1);
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/auth/login');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/auth/login');
  };

  const isLast = activeIndex === SLIDES.length - 1;

  // Illustration takes ~47% of screen height — adapts to any phone
  const illustrationHeight = height * 0.47;
  // Horizontal padding scales slightly with width
  const H_PAD = width * 0.065;

  return (
    <SafeAreaView style={styles.root}>
      {/* ── Illustration pager ───────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        // Don't flex — explicit height so panel below is always visible
        style={{ flexGrow: 0, marginTop: 20 }}
      >
        {SLIDES.map((slide, i) => (
          <View
            key={i}
            style={{
              width,
              height: illustrationHeight,
              paddingHorizontal: H_PAD,
            }}
          >
            <View style={styles.illustrationBox}>
              <Image
                source={slide.image}
                style={styles.illustration}
                resizeMode="cover"
              />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ── Fixed bottom panel ───────────────────────────── */}
      <View style={[styles.panel, { paddingHorizontal: H_PAD }]}>
        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex ? styles.dotOn : styles.dotOff]}
            />
          ))}
        </View>

        {/* Cross-fading text block — fixed min-height prevents CTA jumping */}
        <Animated.View style={[styles.textBlock, { opacity: fadeAnim }]}>
          <Text style={styles.title}>{SLIDES[activeIndex].title}</Text>
          <Text style={styles.description}>{SLIDES[activeIndex].description}</Text>
        </Animated.View>

        {/* CTA */}
        <View style={styles.cta}>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} hitSlop={12}>
            <Text style={styles.skipText}>Skip  ›</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={styles.nextBtn}>
            <Text style={styles.nextText}>{isLast ? 'Get Started  ›' : 'Next  ›'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---------- styles --------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    // Center everything horizontally on any screen
    alignItems: 'stretch',
  },
  illustrationBox: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(Platform.OS === 'ios' ? { borderCurve: 'continuous' as any } : {}),
  },
  illustration: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  panel: {
    // flex: 1 so the panel always fills the remaining space below the pager
    flex: 1,
    paddingTop: 24,
    paddingBottom: 16,
    justifyContent: 'center',   // vertically centre the content inside the panel
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOn:  { backgroundColor: '#F28D52' },
  dotOff: { backgroundColor: '#D1DEE5' },
  textBlock: {
    // Lock min-height to the approximate height of the tallest slide's text
    // so the Next/Skip buttons don't shift when descriptions vary in length.
    minHeight: 130,
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 36,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 23,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipText: {
    fontSize: 17,
    color: '#4B5563',
    fontWeight: '600',
  },
  nextBtn: {
    backgroundColor: '#38BDF8',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 36,
    boxShadow: '0 4px 12px rgba(56, 189, 248, 0.35)',
  } as any,
  nextText: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
