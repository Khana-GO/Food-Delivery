import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get("window").width;

type MciIcon = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  heroIcon: MciIcon;
  floaters: readonly [MciIcon, MciIcon, MciIcon];
}

const SLIDES: readonly Slide[] = [
  {
    id: "1",
    title: "Discover Restaurants\nNearby",
    subtitle:
      "Explore the best local kitchens around you and find delicious meals delivered fast.",
    heroIcon: "map-marker-radius",
    floaters: ["silverware-fork-knife", "pizza", "coffee"],
  },
  {
    id: "2",
    title: "Order Your\nFavourites",
    subtitle:
      "Browse menus, customise your order and enjoy food from your favourite local restaurants.",
    heroIcon: "shopping-outline",
    floaters: ["hamburger", "noodles", "food-croissant"],
  },
  {
    id: "3",
    title: "Fast & Reliable\nDelivery",
    subtitle:
      "Track your delivery in real time. Our riders bring your food hot and fresh to your door.",
    heroIcon: "motorbike",
    floaters: ["package-variant-closed", "timer-outline", "thumb-up-outline"],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Components
// ────────────────────────────────────────────────────────────────────────────

const Header = React.memo(({ onSkip }: { onSkip: () => void }) => (
  <View className="flex-row items-center justify-between px-6 pb-2">
    <View className="flex-row items-center gap-2.5">
      <View className="w-11 h-11 rounded-2xl bg-primary items-center justify-center shadow-lg shadow-primary/30">
        <MaterialCommunityIcons name="food" size={26} color="#FFFFFF" />
      </View>
      <View>
        <Text className="text-2xl font-extrabold tracking-tight text-black">
          Khana<Text className="text-primary">Go</Text>
        </Text>
        <Text className="text-gray-400 text-[10px] font-medium tracking-wide">
          Delicious Food, Delivered Fast
        </Text>
      </View>
    </View>

    <TouchableOpacity
      onPress={onSkip}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.7}
    >
      <Text className="text-primary text-sm font-bold tracking-wide">Skip</Text>
    </TouchableOpacity>
  </View>
));

const SlideIllustration = React.memo(
  ({
    heroIcon,
    floaters,
  }: {
    heroIcon: MciIcon;
    floaters: readonly [MciIcon, MciIcon, MciIcon];
  }) => (
    <View className="w-[280px] h-[280px] rounded-[52px] bg-red-50 items-center justify-center mb-12">
      {/* Decorative rings */}
      <View className="absolute w-44 h-44 rounded-full border border-red-100" />
      <View className="absolute w-[232px] h-[232px] rounded-full border border-red-100/70" />

      {/* Hero */}
      <View className="w-28 h-28 rounded-full bg-white shadow-lg shadow-black/10 items-center justify-center">
        <MaterialCommunityIcons name={heroIcon} size={52} color="#E23744" />
      </View>

      {/* Floating badges */}
      <View className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-white shadow-md shadow-black/5 items-center justify-center">
        <MaterialCommunityIcons name={floaters[0]} size={26} color="#111827" />
      </View>
      <View className="absolute bottom-20 left-7 w-12 h-12 rounded-2xl bg-white shadow-md shadow-black/5 items-center justify-center">
        <MaterialCommunityIcons name={floaters[1]} size={22} color="#374151" />
      </View>
      <View className="absolute bottom-9 right-12 w-12 h-12 rounded-2xl bg-white shadow-md shadow-black/5 items-center justify-center">
        <MaterialCommunityIcons name={floaters[2]} size={22} color="#374151" />
      </View>
    </View>
  ),
);

interface DotProps {
  index: number;
  scrollX: Animated.Value;
}

const Dot = React.memo(({ index, scrollX }: DotProps) => {
  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const width = scrollX.interpolate({
    inputRange,
    outputRange: [8, 28, 8],
    extrapolate: "clamp",
  });

  const backgroundColor = scrollX.interpolate({
    inputRange,
    outputRange: ["#E5E7EB", "#E23744", "#E5E7EB"],
    extrapolate: "clamp",
  });

  return <Animated.View style={[styles.dot, { width, backgroundColor }]} />;
});

// ────────────────────────────────────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList<Slide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const finishOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
    } catch {}
    router.replace("/(auth)/login" as any);
  }, []);

  const goToSlide = useCallback((index: number) => {
    flatRef.current?.scrollToOffset({
      offset: index * SCREEN_WIDTH,
      animated: true,
    });
  }, []);

  const handleNext = useCallback(() => {
    if (current < SLIDES.length - 1) {
      goToSlide(current + 1);
    } else {
      finishOnboarding();
    }
  }, [current, goToSlide, finishOnboarding]);

  const handleScroll = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false },
      ),
    [scrollX],
  );

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setCurrent(Math.max(0, Math.min(index, SLIDES.length - 1)));
    },
    [],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    [],
  );

  const renderItem = useCallback(({ item }: { item: Slide }) => (
    <View
      style={{ width: SCREEN_WIDTH }}
      className="flex-1 items-center justify-center px-8"
    >
      <SlideIllustration heroIcon={item.heroIcon} floaters={item.floaters} />
      <Text className="text-3xl font-extrabold text-black tracking-tight text-center leading-9">
        {item.title}
      </Text>
      <Text className="text-gray-500 text-sm text-center leading-6 mt-3 px-4">
        {item.subtitle}
      </Text>
    </View>
  ), []);

  const isLast = current === SLIDES.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <Header onSkip={finishOnboarding} />

      {/* Slides */}
      <Animated.FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        renderItem={renderItem}
      />

      {/* Footer */}
      <View className="px-6 pb-8 gap-5">
        <View className="flex-row items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => goToSlide(i)}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
            >
              <Dot index={i} scrollX={scrollX} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          className="bg-primary rounded-xl py-4 flex-row items-center justify-center gap-2 shadow-lg shadow-primary/25"
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base tracking-wide">
            {isLast ? "Get Started" : "Next"}
          </Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
