import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

// ──────────────────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: '1', name: 'Momo', emoji: '🥟' },
  { id: '2', name: 'Pizza', emoji: '🍕' },
  { id: '3', name: 'Burger', emoji: '🍔' },
  { id: '4', name: 'Thali', emoji: '🍱' },
  { id: '5', name: 'Drinks', emoji: '🥤' },
  { id: '6', name: 'Dessert', emoji: '🍦' },
];

const RESTAURANTS = [
  {
    id: '1',
    name: 'Himalayan Momo House',
    rating: 4.8,
    reviews: '2.1k',
    time: '20-25 min',
    fee: 'Rs. 40',
    distance: '1.2 km',
    cuisine: ['Nepali', 'Dumplings'],
    isOpen: true,
    emoji: '🥟',
    color: '#FEF3C7',
  },
  {
    id: '2',
    name: 'Napoli Pizza Co.',
    rating: 4.6,
    reviews: '980',
    time: '30-35 min',
    fee: 'Rs. 60',
    distance: '2.4 km',
    cuisine: ['Italian', 'Pizza'],
    isOpen: true,
    emoji: '🍕',
    color: '#FEE2E2',
  },
  {
    id: '3',
    name: 'Baneshwor Burger Lab',
    rating: 4.5,
    reviews: '1.4k',
    time: '25 min',
    fee: 'Rs. 50',
    distance: '0.8 km',
    cuisine: ['Fast Food', 'Burgers'],
    isOpen: true,
    emoji: '🍔',
    color: '#DCFCE7',
  },
  {
    id: '4',
    name: 'Spice Route Biryani',
    rating: 4.7,
    reviews: '2.6k',
    time: '35-40 min',
    fee: 'Rs. 70',
    distance: '3.1 km',
    cuisine: ['Indian', 'Biryani'],
    isOpen: false,
    emoji: '🍛',
    color: '#EDE9FE',
  },
  {
    id: '5',
    name: 'Grill & Chill',
    rating: 4.4,
    reviews: '760',
    time: '28 min',
    fee: 'Rs. 55',
    distance: '1.9 km',
    cuisine: ['Grill', 'Chicken'],
    isOpen: true,
    emoji: '🍗',
    color: '#FFF7ED',
  },
  {
    id: '6',
    name: 'Wok Street Noodles',
    rating: 4.6,
    reviews: '1.1k',
    time: '22 min',
    fee: 'Rs. 45',
    distance: '1.5 km',
    cuisine: ['Chinese', 'Noodles'],
    isOpen: true,
    emoji: '🍜',
    color: '#F0FDF4',
  },
  {
    id: '7',
    name: 'The Corner Kitchen',
    rating: 4.3,
    reviews: '540',
    time: '15 min',
    fee: 'Rs. 30',
    distance: '0.4 km',
    cuisine: ['Multi-cuisine', 'Cafe'],
    isOpen: true,
    emoji: '☕',
    color: '#FDF2F8',
  },
  {
    id: '8',
    name: 'Taco Fiesta',
    rating: 4.2,
    reviews: '410',
    time: '18 min',
    fee: 'Rs. 35',
    distance: '0.6 km',
    cuisine: ['Mexican', 'Street Food'],
    isOpen: true,
    emoji: '🌮',
    color: '#FEF9C3',
  },
];

// ──────────────────────────────────────────────────────────────────────────
// Components
// ──────────────────────────────────────────────────────────────────────────

const RestaurantCard = ({ restaurant }: { restaurant: typeof RESTAURANTS[0] }) => (
  <TouchableOpacity
    className="bg-white rounded-xl overflow-hidden shadow-md w-[48%]"
    activeOpacity={0.85}
    onPress={() => router.push(`/(customer)/restaurant/${restaurant.id}` as any)}
  >
    {/* Image */}
    <View className="h-[110px] items-center justify-center relative" style={{ backgroundColor: restaurant.color }}>
      <Text className="text-4xl">{restaurant.emoji}</Text>
      <View className={`absolute top-2 left-2 px-2 py-0.5 rounded-full ${restaurant.isOpen ? 'bg-green-100' : 'bg-red-100'}`}>
        <Text className={`text-xs font-medium ${restaurant.isOpen ? 'text-green-600' : 'text-red-500'}`}>
          {restaurant.isOpen ? 'Open' : 'Closed'}
        </Text>
      </View>
      <TouchableOpacity className="absolute top-2 right-2">
        <Text>🤍</Text>
      </TouchableOpacity>
    </View>

    {/* Body */}
    <View className="p-2.5">
      <Text className="text-sm font-bold text-black truncate">{restaurant.name}</Text>
      
      <View className="flex-row items-center gap-1 mt-0.5">
        <Text className="text-xs font-bold text-yellow-500">⭐ {restaurant.rating}</Text>
        <Text className="text-xs text-gray-300">·</Text>
        <Text className="text-xs text-gray-500">({restaurant.reviews})</Text>
      </View>

      <View className="flex-row items-center gap-1 flex-wrap mt-0.5">
        <Text className="text-xs text-gray-500">⏱ {restaurant.time}</Text>
        <Text className="text-xs text-gray-300">·</Text>
        <Text className="text-xs text-gray-500">🚴 {restaurant.fee}</Text>
        <Text className="text-xs text-gray-300">·</Text>
        <Text className="text-xs text-gray-500">📍 {restaurant.distance}</Text>
      </View>

      <View className="flex-row flex-wrap gap-1 mt-1.5">
        {restaurant.cuisine.map((tag) => (
          <View key={tag} className="bg-gray-100 px-2 py-0.5 rounded-full">
            <Text className="text-[10px] text-gray-500 font-medium">{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  </TouchableOpacity>
);

const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) => (
  <View className="flex-row justify-between items-center px-4 mb-3 mt-1">
    <Text className="text-lg font-extrabold text-black">{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text className="text-sm text-primary font-semibold">See all</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ──────────────────────────────────────────────────────────────────────────
// Main Screen
// ──────────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-start px-4 pt-3 pb-2.5">
          <View className="flex-1">
            <Text className="text-lg font-extrabold text-black">Good Afternoon, Anish 👋</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-sm">📍</Text>
              <Text className="text-sm text-gray-500 font-medium ml-1">Kathmandu, Baneshwor</Text>
              <Text className="text-sm text-gray-500"> ˅</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="w-[38px] h-[38px] rounded-full bg-white items-center justify-center shadow-sm"
              onPress={() => router.push('/(customer)/notifications' as any)}
            >
              <Text className="text-lg">🔔</Text>
              <View className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-[38px] h-[38px] rounded-full bg-emerald-50 items-center justify-center shadow-sm"
              onPress={() => router.push('/(customer)/chatbot' as any)}
            >
              <Text className="text-lg">💬</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white mx-4 mb-4 rounded-2xl px-3.5 h-12 shadow-sm">
          <Text className="text-base mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-sm text-black"
            placeholder="Search restaurants, food..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity className="w-[34px] h-[34px] rounded-xl bg-primary items-center justify-center">
            <Feather name="sliders" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 16 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} className="items-center gap-1.5">
              <View className="w-[58px] h-[58px] rounded-2xl bg-white items-center justify-center shadow-sm">
                <Text className="text-3xl">{cat.emoji}</Text>
              </View>
              <Text className="text-xs text-gray-600 font-medium">{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Best Offers */}
        <SectionHeader title="Best Offers" onSeeAll={() => {}} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}
        >
          <View className="w-[65%] rounded-3xl p-4.5 overflow-hidden bg-primary">
            <Text className="text-2xl font-extrabold text-white leading-6">50% OFF</Text>
            <Text className="text-xs text-white/85 mb-3">On your first 3 orders</Text>
            <View className="self-start bg-white/90 rounded-full px-2.5 py-1">
              <Text className="text-xs font-bold text-primary">Use KHANA50</Text>
            </View>
            <Text className="text-[42px] absolute right-4 bottom-3">🍜</Text>
          </View>
          <View className="w-[65%] rounded-3xl p-4.5 overflow-hidden" style={{ backgroundColor: '#1E3A5F' }}>
            <Text className="text-2xl font-extrabold text-white leading-6">Free Delivery</Text>
            <Text className="text-xs text-white/85 mb-3">On orders above Rs. 500</Text>
            <View className="self-start bg-white/20 rounded-full px-2.5 py-1">
              <Text className="text-xs font-bold text-white">Limited time</Text>
            </View>
            <Text className="text-[42px] absolute right-4 bottom-3">🍕</Text>
          </View>
        </ScrollView>

        {/* Featured Restaurants */}
        <SectionHeader title="Featured Restaurants" onSeeAll={() => {}} />
        <View className="flex-row flex-wrap px-4 gap-3 mb-2">
          {RESTAURANTS.slice(0, 2).map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </View>

        {/* Popular Restaurants */}
        <SectionHeader title="Popular Restaurants" onSeeAll={() => {}} />
        <View className="flex-row flex-wrap px-4 gap-3 mb-2">
          {RESTAURANTS.slice(2, 4).map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </View>

        {/* Recommended */}
        <SectionHeader title="Recommended For You" onSeeAll={() => {}} />
        <View className="flex-row flex-wrap px-4 gap-3 mb-2">
          {RESTAURANTS.slice(4, 6).map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </View>

        {/* Nearby */}
        <SectionHeader title="Nearby Restaurants" onSeeAll={() => {}} />
        <View className="flex-row flex-wrap px-4 gap-3 mb-2">
          {RESTAURANTS.slice(6, 8).map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}