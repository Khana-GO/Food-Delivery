import { Text } from '@/components/ui/Text';
import React, { useRef, useState } from 'react';
import { View, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Discover Restaurants\nNearby',
    subtitle:
      'Explore the best local kitchens around you and find delicious meals delivered with warm Nepalese hospitality.',
    illustration: (
      <View className="w-full items-center py-4">
        <View className="w-[78%] aspect-square bg-slate-100 rounded-3xl items-center justify-center relative overflow-hidden">
          <View className="absolute bg-slate-200 w-full h-[2px] top-[40%]" />
          <View className="absolute bg-slate-200 w-full h-[2px] top-[65%] opacity-50" />
          <View className="absolute bg-slate-200 w-[2px] h-full left-[35%]" />
          
          <View className="absolute w-14 h-14 rounded-full bg-primary items-center justify-center z-10 shadow-lg">
            <Text className="text-2xl">📍</Text>
          </View>
          <View className="absolute w-11 h-11 rounded-full bg-primary items-center justify-center top-16 left-10 opacity-90 shadow-md">
            <Text className="text-xl">🍴</Text>
          </View>
          <View className="absolute w-11 h-11 rounded-full bg-green-500 items-center justify-center top-12 right-12 opacity-90 shadow-md">
            <Text className="text-xl">🍕</Text>
          </View>
          <View className="absolute w-11 h-11 rounded-full bg-green-500 items-center justify-center bottom-20 left-12 opacity-90 shadow-md">
            <Text className="text-xl">🥗</Text>
          </View>
          <View className="absolute w-11 h-11 rounded-full bg-primary items-center justify-center bottom-16 right-10 opacity-90 shadow-md">
            <Text className="text-xl">☕</Text>
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
    illustration: (
      <View className="w-full items-center py-4">
        <View className="w-[78%] aspect-square bg-slate-100 rounded-3xl items-center justify-center relative shadow-sm">
          <Text className="text-[80px]">🍜</Text>
          <Text className="text-[40px] absolute top-5 right-8">🍕</Text>
          <Text className="text-[35px] absolute bottom-8 left-6">🍔</Text>
        </View>
      </View>
    ),
  },
  {
    id: '3',
    title: 'Fast & Reliable\nDelivery',
    subtitle:
      'Track your delivery in real time. Our riders bring your food hot and fresh right to your doorstep.',
    illustration: (
      <View className="w-full items-center py-4">
        <View className="w-[78%] aspect-square bg-slate-100 rounded-3xl items-center justify-center relative shadow-sm">
          <Text className="text-[80px]">🚴</Text>
          <Text className="text-[35px] absolute top-5 right-8">📦</Text>
          <Text className="text-[35px] absolute bottom-8 left-6">⏱️</Text>
        </View>
      </View>
    ),
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch (e) {}
    router.replace('/auth/login' as any);
  };

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      const next = current + 1;
      flatRef.current?.scrollToOffset({ offset: next * width, animated: true });
      setCurrent(next);
    } else {
      finishOnboarding();
    }
  };

  const skip = () => finishOnboarding();

  return (
    <SafeAreaView className="flex-1 bg-[#F1FAEE]">
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="flex-row items-center gap-2">
          <View className="w-9 h-9 rounded-xl bg-primary items-center justify-center shadow-sm">
            <Ionicons name="fast-food-outline" size={20} color="#FFF" />
          </View>
          <Text className="text-lg font-bold text-slate-800">KhanaGo</Text>
        </View>
        <TouchableOpacity onPress={skip} className="p-2">
          <Text className="text-[15px] text-slate-500 font-semibold">Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View className="px-6 items-center justify-center flex-1" style={{ width }}>
            {item.illustration}
            <Text className="text-3xl font-extrabold text-slate-800 text-center mt-7 mb-4 leading-10">
              {item.title}
            </Text>
            <Text className="text-[15px] text-slate-500 text-center leading-6 px-2">
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      <View className="px-6 pb-10 gap-5 items-center w-full">
        <View className="flex-row gap-2">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-7 bg-primary' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </View>

        <TouchableOpacity 
          className="bg-primary w-full py-4 rounded-full items-center justify-center flex-row shadow-lg shadow-red-500/30" 
          onPress={goNext} 
          activeOpacity={0.85}
        >
          <Text className="text-white text-[17px] font-bold">
            {current < SLIDES.length - 1 ? 'Next' : 'Get Started'}
          </Text>
          <Feather name="arrow-right" size={20} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
