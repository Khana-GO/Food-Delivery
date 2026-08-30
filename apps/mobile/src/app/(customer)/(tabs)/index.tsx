import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { RestaurantCard } from '@/components/customer/RestaurantCard';
import { CategoryChip } from '@/components/customer/CategoryChip';
import { LoadingSkeleton } from '@/components/customer/LoadingSkeleton';
import { useDashboard } from '@/hooks/customer/useDashboard';
import { useFavorites } from '@/hooks/customer/useFavorites';
import { useAddFavorite } from '@/hooks/customer/useAddFavorite';
import { useRemoveFavorite } from '@/hooks/customer/useRemoveFavorite';
import { useDashboardStore } from '@/stores/customer/dashboardStore';
import { useFavoritesStore } from '@/stores/customer/favoritesStore';

export default function HomeScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // ─── Data Fetching ───
  const { refetch: refetchDashboard, isRefetching: isDashboardRefetching } = useDashboard();
  const { refetch: refetchFavorites, isRefetching: isFavoritesRefetching } = useFavorites();
  const { mutate: addFavorite, isPending: isAddingFavorite } = useAddFavorite();
  const { mutate: removeFavorite, isPending: isRemovingFavorite } = useRemoveFavorite();

  // ─── State ───
  const { popularRestaurants, recommendations, recentlyOrdered, categories, isLoading } = useDashboardStore();
  const { favoriteIds } = useFavoritesStore();

  const isRefreshing = isDashboardRefetching || isFavoritesRefetching;

  // ─── Handlers ───
  const handleRefresh = useCallback(() => {
    refetchDashboard();
    refetchFavorites();
  }, [refetchDashboard, refetchFavorites]);

  const handleToggleFavorite = useCallback(
    (restaurantId: string) => {
      if (isAddingFavorite || isRemovingFavorite) return;

      if (favoriteIds.has(restaurantId)) {
        removeFavorite(restaurantId);
      } else {
        addFavorite(restaurantId);
      }
    },
    [favoriteIds, addFavorite, removeFavorite, isAddingFavorite, isRemovingFavorite]
  );

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // ─── Filtering ───
  const filteredPopular = popularRestaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Render ───
  if (isLoading && !popularRestaurants.length) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View>
              <View className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
              <View className="w-48 h-4 mt-1 bg-gray-200 rounded animate-pulse" />
            </View>
            <View className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          </View>
          <View className="h-12 mt-4 bg-gray-200 rounded-xl animate-pulse" />
        </View>
        <LoadingSkeleton count={4} variant="grid" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* ─── Header ─── */}
        <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-500">{getGreeting()},</Text>
              <Text className="text-xl font-bold text-black">
                {user?.firstName || 'Customer'} 
              </Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="items-center justify-center w-10 h-10 bg-gray-100 rounded-full"
                onPress={() => router.push('/(customer)/notifications' as any)}
              >
                <Feather name="bell" size={20} color="#1A1A1A" />
                <View className="absolute w-2 h-2 bg-red-500 rounded-full top-2 right-2" />
              </TouchableOpacity>
              <TouchableOpacity
                className="items-center justify-center w-10 h-10 rounded-full bg-primary/10"
                onPress={() => router.push('/(customer)/chatbot' as any)}
              >
                <Feather name="message-circle" size={20} color="#E23744" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center h-12 px-4 mt-4 border border-gray-100 bg-gray-50 rounded-xl">
            <Feather name="search" size={20} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-3 text-base text-black"
              placeholder="Search restaurants, food..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ─── Categories ─── */}
        {categories.length > 0 && (
          <View className="py-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
              {categories.map((category) => (
                <CategoryChip
                  key={category.id}
                  label={category.name}
                  isSelected={selectedCategory === category.id}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )
                  }
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── Popular Restaurants ─── */}
        {popularRestaurants.length > 0 && (
          <View className="px-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-black">Popular Restaurants</Text>
              <TouchableOpacity onPress={() => router.push('/(customer)/explore' as any)}>
                <Text className="text-sm font-semibold text-primary">See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
              {popularRestaurants.slice(0, 6).map((restaurant) => (
                <View key={restaurant.id} className="mx-1">
                  <RestaurantCard
                    restaurant={restaurant}
                    isFavorite={favoriteIds.has(restaurant.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── Personalized Recommendations ─── */}
        {recommendations.length > 0 && (
          <View className="px-4 mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-black">Recommended For You</Text>
              <TouchableOpacity onPress={() => router.push('/(customer)/explore' as any)}>
                <Text className="text-sm font-semibold text-primary">See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
              {recommendations.slice(0, 6).map((restaurant) => (
                <View key={restaurant.id} className="mx-1">
                  <RestaurantCard
                    restaurant={restaurant}
                    isFavorite={favoriteIds.has(restaurant.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── Recently Ordered ─── */}
        {recentlyOrdered.length > 0 && (
          <View className="px-4 mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-black">Recently Ordered</Text>
            </View>

            {recentlyOrdered.slice(0, 3).map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isFavorite={favoriteIds.has(restaurant.id)}
                onToggleFavorite={handleToggleFavorite}
                variant="list"
              />
            ))}
          </View>
        )}

        {/* ─── Empty State ─── */}
        {!popularRestaurants.length && !recommendations.length && !recentlyOrdered.length && (
          <View className="items-center justify-center px-6 py-12">
            <Feather name="home" size={64} color="#D1D5DB" />
            <Text className="mt-4 text-lg font-medium text-gray-400">Welcome to KhanaGo!</Text>
            <Text className="mt-1 text-sm text-center text-gray-400">
              Start exploring restaurants and discover delicious food near you.
            </Text>
            <TouchableOpacity
              className="px-6 py-3 mt-6 bg-primary rounded-xl"
              onPress={() => router.push('/(customer)/explore' as any)}
            >
              <Text className="font-semibold text-white">Explore Now</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}