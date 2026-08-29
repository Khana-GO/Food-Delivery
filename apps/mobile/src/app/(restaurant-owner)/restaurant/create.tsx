import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ScreenHeader, ContentWidth, useResponsive } from '@/components/res-owner/owner/kit';
import { RestaurantForm } from '@/components/res-owner/restaurant/RestaurantForm';
import { useCreateRestaurant } from '@/hooks/owner/restaurant/useCreateRestaurant';
import { useRestaurantStore } from '@/stores/owner/restaurantStore';
import { CreateRestaurantPayload } from '@food_delivery/types';

export default function CreateRestaurantScreen() {
  const { mutateAsync: createRestaurant, isPending } = useCreateRestaurant();
  const { error, setError } = useRestaurantStore();
  const { isTablet } = useResponsive();

  const handleSubmit = async (data: CreateRestaurantPayload) => {
    try {
      setError(null);
      // 1) Create the restaurant with text details first.
      const restaurant = await createRestaurant(data);

      // 2) Logo & cover are added right after creation, on the store page.
      router.replace(`/(restaurant-owner)/restaurant/${restaurant.id}` as never);
    } catch {
      // Errors surface through the store; keep the user on the form.
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="New Restaurant" subtitle="Set up your kitchen in a minute" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ padding: 16, paddingBottom: 24 }, ContentWidth(isTablet ? 720 : 9999)]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Error banner ─── */}
        {error ? (
          <View className="mb-4 flex-row items-start rounded-2xl border border-red-200 bg-red-50 p-4">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
              <Feather name="alert-circle" size={16} color="#DC2626" />
            </View>
            <Text className="ml-3 flex-1 text-xs leading-4 text-red-600">{error}</Text>
            <Pressable hitSlop={8} onPress={() => setError(null)} className="p-0.5">
              <Feather name="x" size={15} color="#DC2626" />
            </Pressable>
          </View>
        ) : null}

        {/* ─── Guidance banner ─── */}
        <View className="mb-4 flex-row items-start rounded-2xl border border-green-200 bg-green-50 p-4">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
            <Feather name="info" size={16} color="#16A34A" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-green-800">Two quick steps</Text>
            <Text className="mt-0.5 text-xs leading-4 text-green-700">
              First add your basic details here. Right after, you'll be able to upload your logo
              and cover photo.
            </Text>
          </View>
        </View>

        <RestaurantForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          submitLabel="Continue to Photos"
        />

        <View className="px-4 pb-2 pt-3">
          <Text className="text-center text-xs leading-4 text-gray-400">
            New restaurants are reviewed by our team before going live.
            {'\n'}This usually takes less than 24 hours.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
