import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { useRestaurants } from '@/api/restaurants';
import Badge from '@/components/ui/Badge';
import { Colors } from '@/constants/theme';
import { useFavoritesStore } from '@/store/favoritesStore';

export default function RestaurantsScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const { data: restaurants, isLoading, isError } = useRestaurants();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const filters = ['All', 'Nearest', 'Top Rated', 'Popular', 'Vegetarian'];

  const filteredRestaurants = restaurants?.filter((r: any) => 
    r.name.toLowerCase().includes(search.toLowerCase()) &&
    (activeFilter === 'All' || r.cuisineType === activeFilter) // simplified filter logic
  ) || [];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-3 flex-row items-center gap-3 bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">All Restaurants</Text>
      </View>

      <View className="px-4 py-3 bg-white">
        <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-12">
          <Text className="text-lg mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-slate-800"
            placeholder="Search restaurants, cuisines..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View className="bg-white pb-3 shadow-sm z-10">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 gap-2">
          {filters.map((filter) => (
            <TouchableOpacity 
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full border ${activeFilter === filter ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}
            >
              <Text className={`font-semibold ${activeFilter === filter ? 'text-white' : 'text-slate-600'}`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 font-semibold">Failed to load restaurants.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item: any) => item.id}
          contentContainerClassName="p-4 gap-4"
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => router.push(`/(customer)/restaurant/${item.id}` as any)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100"
              activeOpacity={0.8}
            >
              <View className="h-40 bg-slate-200 relative items-center justify-center">
                {item.coverImageUrl ? (
                   // Normally this would be an Image component
                   <Text>Image</Text>
                ) : (
                  <Text className="text-5xl">{item.emoji || '🏪'}</Text>
                )}
                <View className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-md">
                  <Text className="text-xs font-bold text-slate-800">{item.estimatedDeliveryTime} min</Text>
                </View>
                <TouchableOpacity 
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full items-center justify-center"
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                >
                  <Text>{isFavorite(item.id) ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
              </View>
              
              <View className="p-4">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className="text-lg font-bold text-slate-800 flex-1 mr-2" numberOfLines={1}>{item.name}</Text>
                  <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-md">
                    <Text className="text-xs text-green-700 font-bold mr-1">★</Text>
                    <Text className="text-xs text-green-700 font-bold">{item.averageRating || 'New'}</Text>
                  </View>
                </View>
                
                <Text className="text-slate-500 text-sm mb-3" numberOfLines={1}>
                  {item.cuisineType} • {item.city}
                </Text>
                
                <View className="flex-row items-center border-t border-slate-100 pt-3">
                  <Text className="text-slate-500 text-xs">Delivery: </Text>
                  <Text className="text-slate-800 text-xs font-bold mr-4">
                    {item.deliveryFee === '0.00' ? 'Free' : `Rs. ${item.deliveryFee}`}
                  </Text>
                  <Text className="text-slate-500 text-xs">Min Order: </Text>
                  <Text className="text-slate-800 text-xs font-bold">
                    Rs. {item.minimumOrderAmount}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View className="py-10 items-center">
              <Text className="text-slate-400">No restaurants found.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
