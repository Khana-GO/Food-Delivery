import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { RestaurantForm } from '@/components/restaurant/RestaurantForm';
import { useCreateRestaurant } from '@/hooks/restaurant/useCreateRestaurant';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { CreateRestaurantPayload } from '@food_delivery/types';

export default function CreateRestaurantScreen() {
  const { mutateAsync: createRestaurant, isPending } = useCreateRestaurant();
  const { setError, error } = useRestaurantStore();

  const handleSubmit = async (data: CreateRestaurantPayload, logo?: any, cover?: any) => {
    try {
      // 1. Create restaurant
      const restaurant = await createRestaurant(data);

      // 2. Upload images if provided
      if (logo || cover) {
        // This would be handled in the mutation or a separate upload hook
        // For now, we'll navigate to the profile page
      }

      // 3. Navigate to restaurant profile
      router.replace('/(restaurant)/restaurant/profile');
    } catch (err: any) {
      setError(err?.message || 'Failed to create restaurant');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Create Restaurant</Text>
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View className="p-3 mx-4 mt-4 border border-red-200 bg-red-50 rounded-xl">
          <Text className="text-sm text-red-500">{error}</Text>
        </View>
      )}

      {/* Form */}
      <RestaurantForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        submitLabel="Create Restaurant"
      />
    </View>
  );
}