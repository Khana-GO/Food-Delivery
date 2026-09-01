import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RestaurantAnalytics } from '@food_delivery/types';
import { router } from 'expo-router';

interface TopRestaurantsListProps {
  data: RestaurantAnalytics[];
  title?: string;
}

export const TopRestaurantsList = ({ data, title = 'Top Restaurants' }: TopRestaurantsListProps) => {
  if (!data || data.length === 0) {
    return (
      <View className="p-4 bg-white border border-gray-100 rounded-xl">
        <Text className="mb-2 text-sm font-bold text-black">{title}</Text>
        <Text className="py-4 text-sm text-center text-gray-500">No data</Text>
      </View>
    );
  }

  return (
    <View className="overflow-hidden bg-white border border-gray-100 rounded-xl">
      <View className="p-4 border-b border-gray-50">
        <Text className="text-sm font-bold text-black">{title}</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.restaurantId}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            className={`flex-row items-center px-4 py-3 ${index !== data.length - 1 ? 'border-b border-gray-50' : ''}`}
            onPress={() => router.push(`/(admin)/restaurants/${item.restaurantId}` as any)}
            activeOpacity={0.7}
          >
            <Text className="w-6 text-xs font-bold text-gray-400">#{index + 1}</Text>
            <View className="flex-1 ml-2">
              <Text className="text-sm font-semibold text-black">{item.name}</Text>
              <Text className="text-xs text-gray-500">{item.totalOrders} orders</Text>
            </View>
            <View className="items-end">
              <Text className="text-sm font-bold text-primary">Rs. {item.totalRevenue.toLocaleString()}</Text>
              <View className="flex-row items-center gap-1">
                <Feather name="star" size={12} color="#F59E0B" />
                <Text className="text-xs text-gray-500">{item.averageRating.toFixed(1)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        scrollEnabled={false}
      />
    </View>
  );
};