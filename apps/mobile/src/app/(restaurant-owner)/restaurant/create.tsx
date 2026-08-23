import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/owner/kit';
import { RestaurantForm } from '@/components/restaurant/RestaurantForm';
import { useCreateRestaurant } from '@/hooks/restaurant/useCreateRestaurant';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { CreateRestaurantPayload } from '@food_delivery/types';

export default function CreateRestaurantScreen() {
  const { mutateAsync: createRestaurant, isPending } = useCreateRestaurant();
  const { setError, error } = useRestaurantStore();

  const handleSubmit = async (data: CreateRestaurantPayload) => {
    try {
      await createRestaurant(data);
      router.replace('/(restaurant-owner)/profile');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Failed to create restaurant. Please try again.';
      setError(message);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Create Restaurant" subtitle="Tell customers about your kitchen" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* error banner */}
        {error && (
          <View className="mx-4 mt-4 flex-row items-start rounded-2xl border border-red-200 bg-red-50 p-4">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
              <Feather name="alert-circle" size={16} color="#DC2626" />
            </View>
            <Text className="ml-3 flex-1 text-xs leading-4 text-red-600">{error}</Text>
          </View>
        )}

        {/* info banner */}
        <View className="mx-4 mt-4 flex-row items-start rounded-2xl border border-green-200 bg-green-50 p-4">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
            <Feather name="info" size={16} color="#16A34A" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-green-800">Almost there!</Text>
            <Text className="mt-0.5 text-xs leading-4 text-green-700">
              Fields marked * are required. You can polish photos and details anytime after setup.
            </Text>
          </View>
        </View>

        <RestaurantForm onSubmit={handleSubmit} isLoading={isPending} submitLabel="Create Restaurant" />

        <View className="px-4 pb-2">
          <Text className="text-center text-xs leading-4 text-gray-400">
            New restaurants are reviewed by our team before going live.
            {'\n'}This usually takes less than 24 hours.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
