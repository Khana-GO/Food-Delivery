import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

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
  <View className="flex-row items-center justify-between px-6 py-2">
    <View className="flex-row items-center gap-2.5">
      <Image
        source={require("@/assets/images/logo/logo.png")}
        style={{ width: 44, height: 44, borderRadius: 12 }}
        resizeMode="contain"
      />
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
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      activeOpacity={0.7}
      className="py-1 px-3 rounded-full bg-gray-100"
    >
      <Text className="text-primary text-sm font-bold tracking-wide">Skip</Text>
    </TouchableOpacity>
  </View>
));

const SlideIllustration = React.memo(
  ({
    heroIcon,
    floaters,
    isSmallScreen,
  }: {
    heroIcon: MciIcon;
    floaters: readonly [MciIcon, MciIcon, MciIcon];
    isSmallScreen: boolean;
  }) => {
    const sizeClass = isSmallScreen ? "w-[210px] h-[210px]" : "w-[250px] h-[250px]";
    const mbClass = isSmallScreen ? "mb-6" : "mb-8";

    return (
      <View
        className={`${sizeClass} rounded-[52px] bg-red-50 items-center justify-center ${mbClass}`}
      >
        {/* Decorative rings */}
        <View className="absolute w-40 h-40 rounded-full border border-red-100" />
        <View className="absolute w-[208px] h-[208px] rounded-full border border-red-100/70" />

        {/* Hero */}
        <View className="w-24 h-24 rounded-full bg-white shadow-lg shadow-black/10 items-center justify-center">
          <MaterialCommunityIcons name={heroIcon} size={48} color="#E23744" />
        </View>

        {/* Floating badges */}
        <View className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white shadow-md shadow-black/5 items-center justify-center">
          <MaterialCommunityIcons name={floaters[0]} size={24} color="#111827" />
        </View>
        <View className="absolute bottom-14 left-5 w-11 h-11 rounded-2xl bg-white shadow-md shadow-black/5 items-center justify-center">
          <MaterialCommunityIcons name={floaters[1]} size={20} color="#374151" />
        </View>
        <View className="absolute bottom-6 right-8 w-11 h-11 rounded-2xl bg-white shadow-md shadow-black/5 items-center justify-center">
          <MaterialCommunityIcons name={floaters[2]} size={20} color="#374151" />
        </View>
      </View>
    );
  },
);

interface DotProps {
  index: number;
  scrollX: Animated.Value;
  screenWidth: number;
}

const Dot = React.memo(({ index, scrollX, screenWidth }: DotProps) => {
  const inputRange = [
    (index - 1) * screenWidth,
    index * screenWidth,
    (index + 1) * screenWidth,
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
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList<Slide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isSmallScreen = screenHeight < 720;

  const finishOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
    } catch {}
    router.replace("/(auth)/login" as any);
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      const nextIndex = Math.max(0, Math.min(index, SLIDES.length - 1));
      setCurrent(nextIndex);
      flatRef.current?.scrollToOffset({
        offset: nextIndex * screenWidth,
        animated: true,
      });
      Animated.timing(scrollX, {
        toValue: nextIndex * screenWidth,
        duration: 250,
        useNativeDriver: false,
      }).start();
    },
    [screenWidth, scrollX],
  );

  const handleNext = useCallback(() => {
    if (current < SLIDES.length - 1) {
      goToSlide(current + 1);
    } else {
      finishOnboarding();
    }
  }, [current, goToSlide, finishOnboarding]);

  const handlePrev = useCallback(() => {
    if (current > 0) {
      goToSlide(current - 1);
    }
  }, [current, goToSlide]);

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
      const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
      const boundedIndex = Math.max(0, Math.min(index, SLIDES.length - 1));
      setCurrent(boundedIndex);
    },
    [screenWidth],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: screenWidth,
      offset: screenWidth * index,
      index,
    }),
    [screenWidth],
  );

  const renderItem = useCallback(
    ({ item }: { item: Slide }) => (
      <View
        style={{
          width: screenWidth,
          height: screenHeight,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        }}
      >
        <View className="items-center justify-center max-w-sm w-full">
          <SlideIllustration
            heroIcon={item.heroIcon}
            floaters={item.floaters}
            isSmallScreen={isSmallScreen}
          />
          <Text className="text-3xl font-extrabold text-black tracking-tight text-center leading-9">
            {item.title}
          </Text>
          <Text className="text-gray-500 text-sm text-center leading-6 mt-3 px-4">
            {item.subtitle}
          </Text>
        </View>
      </View>
    ),
    [screenWidth, screenHeight, isSmallScreen],
  );

  const isLast = current === SLIDES.length - 1;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header - pinned at top safe area */}
      <View
        style={{
          position: "absolute",
          top: insets.top,
          left: 0,
          right: 0,
          zIndex: 20,
        }}
      >
        <Header onSkip={finishOnboarding} />
      </View>

      {/* Full-Screen Slides - slide content is centered exactly on the mobile screen */}
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
        style={StyleSheet.absoluteFill}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      {/* Bottom Footer - pinned at bottom safe area */}
      <View
        style={{
          position: "absolute",
          bottom: Math.max(insets.bottom, 16) + 12,
          left: 0,
          right: 0,
          zIndex: 20,
        }}
        className="px-6 gap-5"
        pointerEvents="box-none"
      >
        {/* Dot indicators */}
        <View className="flex-row items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => goToSlide(i)}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
            >
              <Dot index={i} scrollX={scrollX} screenWidth={screenWidth} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons: Previous & Next */}
        <View className="flex-row items-center gap-3">
          {current > 0 ? (
            <TouchableOpacity
              className="border border-gray-200 bg-gray-50 rounded-2xl py-4 px-5 flex-row items-center justify-center gap-2"
              onPress={handlePrev}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={18} color="#374151" />
              <Text className="text-gray-700 font-bold text-base tracking-wide">
                Previous
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            className="flex-1 bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-lg shadow-primary/25"
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base tracking-wide">
              {isLast ? "Get Started" : "Next"}
            </Text>
            <Feather name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
