// app/(admin)/restaurant/[id].tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with back button */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Restaurant Details</Text>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-black">Restaurant ID: {id}</Text>
        <Text className="text-gray-500 mt-2">Restaurant details go here</Text>
      </View>
    </View>
  );
}