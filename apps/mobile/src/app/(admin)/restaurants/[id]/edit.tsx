import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAdminRestaurant } from '@/hooks/admin/restaurant/useAdminRestaurant';
import { useUpdateRestaurant } from '@/hooks/admin/restaurant/useUpdateRestaurant';
import { RestaurantForm } from '@/components/res-owner/restaurant/RestaurantForm';
export default function EditRestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: restaurant, isLoading } = useAdminRestaurant(id);
  const { mutate: updateRestaurant, isPending } = useUpdateRestaurant();

  if (isLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-white">
        <Feather name="package" size={64} color="#D1D5DB" />
        <Text className="mt-4 text-lg font-medium text-gray-400">Restaurant Not Found</Text>
        <TouchableOpacity
          className="px-6 py-3 mt-6 bg-primary rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Edit Restaurant</Text>
        </View>
      </View>

      <RestaurantForm
        initialData={restaurant as any}
        onSubmit={(data) => updateRestaurant({ id, data })}
        isLoading={isPending}
        submitLabel="Update Restaurant"
      />
    </View>
  );
}