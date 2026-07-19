import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius } from '@/constants/theme';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const illustrationStyles = StyleSheet.create({
  mapContainer: { width: '100%', alignItems: 'center', paddingVertical: 16 },
  mapBg: {
    width: width * 0.78,
    height: width * 0.78,
    backgroundColor: '#F3F4F6',
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  line: { position: 'absolute', backgroundColor: '#E5E7EB' },
  lineH1: { width: '100%', height: 2, top: '40%' },
  lineH2: { width: '100%', height: 2, top: '65%', opacity: 0.5 },
  lineV1: { width: 2, height: '100%', left: '35%' },
  pin: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCenter: {
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    zIndex: 10,
  },
  pinTopLeft: { top: 60, left: 40, backgroundColor: Colors.primary },
  pinTopRight: { top: 50, right: 50, backgroundColor: '#22C55E' },
  pinBotLeft: { bottom: 70, left: 50, backgroundColor: '#22C55E' },
  pinBotRight: { bottom: 60, right: 40, backgroundColor: Colors.primary },
  pinIcon: { fontSize: 24 },
  pinSmIcon: { fontSize: 20 },
});

const SLIDES = [
  {
    id: '1',
    title: 'Discover Restaurants\nNearby',
    subtitle:
      'Explore the best local kitchens around you and find delicious meals delivered with warm Nepalese hospitality.',
    emoji: '🗺️',
    illustration: (
      <View style={illustrationStyles.mapContainer}>
        <View style={illustrationStyles.mapBg}>
          {/* Map lines */}
          <View style={[illustrationStyles.line, illustrationStyles.lineH1]} />
          <View style={[illustrationStyles.line, illustrationStyles.lineH2]} />
          <View style={[illustrationStyles.line, illustrationStyles.lineV1]} />
          {/* Pin markers */}
          <View style={[illustrationStyles.pin, illustrationStyles.pinCenter]}>
            <Text style={illustrationStyles.pinIcon}>📍</Text>
          </View>
          <View style={[illustrationStyles.pin, illustrationStyles.pinTopLeft]}>
            <Text style={illustrationStyles.pinSmIcon}>🍴</Text>
          </View>
          <View style={[illustrationStyles.pin, illustrationStyles.pinTopRight]}>
            <Text style={illustrationStyles.pinSmIcon}>🍕</Text>
          </View>
          <View style={[illustrationStyles.pin, illustrationStyles.pinBotLeft]}>
            <Text style={illustrationStyles.pinSmIcon}>🥗</Text>
          </View>
          <View style={[illustrationStyles.pin, illustrationStyles.pinBotRight]}>
            <Text style={illustrationStyles.pinSmIcon}>☕</Text>
          </View>
        </View>
      </View>
    ),
  },
  {
    id: '2',
    title: 'Order Your\nFavourites',
    subtitle:
      'Browse menus, customise your order and enjoy food from your favourite local restaurants with ease.',
    emoji: '🛒',
    illustration: (
      <View style={illustrationStyles.mapContainer}>
        <View style={illustrationStyles.mapBg}>
          <Text style={{ fontSize: 80 }}>🍜</Text>
          <Text style={{ fontSize: 40, position: 'absolute', top: 20, right: 30 }}>🍕</Text>
          <Text style={{ fontSize: 35, position: 'absolute', bottom: 30, left: 25 }}>🍔</Text>
        </View>
      </View>
    ),
  },
  {
    id: '3',
    title: 'Fast & Reliable\nDelivery',
    subtitle:
      'Track your delivery in real time. Our riders bring your food hot and fresh right to your doorstep.',
    emoji: '🚴',
    illustration: (
      <View style={illustrationStyles.mapContainer}>
        <View style={illustrationStyles.mapBg}>
          <Text style={{ fontSize: 80 }}>🚴</Text>
          <Text style={{ fontSize: 35, position: 'absolute', top: 20, right: 30 }}>📦</Text>
          <Text style={{ fontSize: 35, position: 'absolute', bottom: 30, left: 25 }}>⏱️</Text>
        </View>
      </View>
    ),
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      const next = current + 1;
      flatRef.current?.scrollToOffset({ offset: next * width, animated: true });
      setCurrent(next);
    } else {
      router.replace('/auth/login' as any);
    }
  };

  const skip = () => router.replace('/auth/login' as any);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoSmall}>
            <Ionicons name="fast-food-outline" size={20} color="#FFF" />
          </View>
          <Text style={styles.logoText}>KhanaGo</Text>
        </View>
        <TouchableOpacity onPress={skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            {item.illustration}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Bottom: Dots + Next */}
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dotBase, i === current ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.nextText}>
            {current < SLIDES.length - 1 ? 'Next' : 'Get Started'}
          </Text>
          <Feather name="arrow-right" size={20} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 18, fontWeight: '700', color: Colors.textDark },
  skipText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },
  slide: {
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginTop: 28,
    marginBottom: 14,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 20,
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: 8 },
  dotBase: { height: 8, borderRadius: 4 },
  dotActive: { width: 28, backgroundColor: Colors.primary },
  dotInactive: { width: 8, backgroundColor: Colors.border },
  nextBtn: {
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 17,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  nextText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
