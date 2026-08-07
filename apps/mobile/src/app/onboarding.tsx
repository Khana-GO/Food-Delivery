import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Wide range of Food\nCategories & more',
    description:
      "Browse through our extensive list of restaurants and dishes, and when you're ready to order, simply add your desired items to your cart and checkout. It's that easy!",
    image: require('../../assets/images/onboarding_1.png'),
  },
  {
    id: '2',
    title: 'Free Deliveries for\nONE MONTH!!',
    description:
      'Get your favorite meals delivered to your doorstep for free with our online food delivery app - enjoy a whole month of complimentary delivery!',
    image: require('../../assets/images/onboarding_2.png'),
  },
  {
    id: '3',
    title: 'Get started on\nOrdering your Food',
    description:
      'Please create an account or sign in to your existing account to start browsing our selection of delicious meals from your favorite restaurants.',
    image: require('../../assets/images/onboarding_3.png'),
  },
];

const OnboardingSlide = React.memo(({ item }: { item: typeof SLIDES[0] }) => (
  <View style={{ width }}>
    <View style={styles.illustrationBox}>
      <Image source={item.image} style={styles.illustration} resizeMode="contain" />
    </View>
  </View>
));

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/auth/login');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => <OnboardingSlide item={item} />}
      />

      {/* Bottom content - outside of FlatList so it stays fixed */}
      <View style={styles.bottomContent}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Title */}
        <Text style={styles.title}>{SLIDES[activeIndex].title}</Text>

        {/* Description */}
        <Text style={styles.description}>{SLIDES[activeIndex].description}</Text>

        {/* Buttons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip  ›</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
            <Text style={styles.nextText}>
              {activeIndex === SLIDES.length - 1 ? 'Continue' : 'Next'}  ›
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  illustrationBox: {
    margin: 20,
    height: 320,
    backgroundColor: '#EFF3F8',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  illustration: {
    width: '90%',
    height: '90%',
  },
  bottomContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  dotActive: {
    backgroundColor: '#F59E0B', // orange active dot as in UI kit
  },
  dotInactive: {
    backgroundColor: '#CBD5E1',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    lineHeight: 38,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  nextBtn: {
    backgroundColor: '#38BDF8',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 36,
  },
  nextText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
