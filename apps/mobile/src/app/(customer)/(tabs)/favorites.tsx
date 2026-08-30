import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useFavorites } from '@/hooks/customer/useFavorites';
import { useRemoveFavorite } from '@/hooks/customer/useRemoveFavorite';
import { useFavoritesStore } from '@/stores/customer/favoritesStore';
import { RestaurantCard } from '@/components/customer/RestaurantCard';

export default function FavoritesScreen() {
  const { refetch, isRefetching } = useFavorites();
  const { favorites, isLoading, error } = useFavoritesStore();
  const { mutate: removeFavorite, isPending: isRemoving } = useRemoveFavorite();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleRemove = useCallback(
    (restaurantId: string) => {
      if (isRemoving) return;
      removeFavorite(restaurantId);
    },
    [removeFavorite, isRemoving],
  );

  const handlePressRestaurant = useCallback((id: string) => {
    router.push(`/(customer)/restaurant/${id}` as any);
  }, []);

  if (isLoading && favorites.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#E23744" />
        <Text className="text-gray-500 mt-3">Loading favorites...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-4 pb-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-black">Favorites</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {favorites.length === 0
            ? 'Your favorite restaurants'
            : `${favorites.length} ${favorites.length === 1 ? 'restaurant' : 'restaurants'} saved`}
        </Text>
      </View>

      {error ? (
        <View className="bg-red-50 border border-red-200 rounded-xl mx-4 mt-4 p-4 flex-row gap-3">
          <Feather name="alert-circle" size={20} color="#EF4444" />
          <Text className="text-sm text-red-700 flex-1">{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
        renderItem={({ item }) => {
          const restaurant = item.restaurant;
          if (!restaurant) {
            return (
              <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
                <Text className="text-sm font-medium text-black">Restaurant unavailable</Text>
                <Text className="text-xs text-gray-500 mt-1">ID: {item.restaurantId}</Text>
                <TouchableOpacity
                  onPress={() => handleRemove(item.restaurantId)}
                  className="mt-3 self-start bg-red-50 px-3 py-1.5 rounded-full"
                >
                  <Text className="text-xs font-semibold text-red-600">Remove</Text>
                </TouchableOpacity>
              </View>
            );
          }
          return (
            <View className="mb-3">
              <RestaurantCard
                restaurant={restaurant}
                isFavorite={true}
                onToggleFavorite={() => handleRemove(restaurant.id)}
                variant="list"
              />
            </View>
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View className="flex-1 items-center justify-center py-16 px-6">
              <View className="w-24 h-24 rounded-full bg-gray-50 items-center justify-center border border-gray-100">
                <Feather name="heart" size={42} color="#D1D5DB" />
              </View>
              <Text className="text-lg font-bold text-black mt-5">No favorites yet</Text>
              <Text className="text-sm text-gray-500 text-center mt-1 leading-5">
                Tap the heart on any restaurant to save it here for quick access.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(customer)/(tabs)/explore' as any)}
                className="mt-6 bg-primary px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Explore Restaurants</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
