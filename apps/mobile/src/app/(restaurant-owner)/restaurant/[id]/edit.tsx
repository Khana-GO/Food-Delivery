import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  ScreenHeader,
  LoadingScreen,
  ContentWidth,
  useResponsive,
} from '@/components/owner/kit';
import { RestaurantForm } from '@/components/restaurant/RestaurantForm';
import { useMyRestaurants } from '@/hooks/restaurant/useRestaurants';
import { useUpdateRestaurant } from '@/hooks/restaurant/useRestaurantMutations';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { CreateRestaurantPayload } from '@food_delivery/types';

export default function EditRestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isTablet } = useResponsive();
  const { data: restaurants, isLoading } = useMyRestaurants();
  const { mutateAsync: updateRestaurant, isPending } = useUpdateRestaurant();
  const { error, setError } = useRestaurantStore();

  const restaurant = restaurants?.find((r) => r.id === id);

  if (isLoading) return <LoadingScreen />;

  if (!restaurant) {
    return (
      <View className="flex-1 bg-gray-50">
        <ScreenHeader title="Edit Restaurant" />
        <View className="flex-1 items-center justify-center px-8">
          <Feather name="alert-circle" size={44} color="#CBD5E1" />
          <Text className="mt-4 text-base font-bold text-gray-800">Restaurant not found</Text>
          <Text className="mt-1 text-center text-sm text-gray-400">
            It may have been removed or you don't have access.
          </Text>
        </View>
      </View>
    );
  }

  const handleSubmit = async (data: CreateRestaurantPayload) => {
    try {
      setError(null);
      await updateRestaurant({ id: restaurant.id, data });
      router.back();
    } catch {
      // Errors surface through the store; keep the user on the form.
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader title="Edit Details" subtitle={`${restaurant.name} · text info only`} />

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

        {/* ─── Photos hint ─── */}
        <View className="mb-4 flex-row items-start rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
            <Feather name="image" size={16} color="#2563EB" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-blue-800">Looking to change photos?</Text>
            <Text className="mt-0.5 text-xs leading-4 text-blue-700">
              Logo and cover images are managed separately on your store page.
            </Text>
          </View>
        </View>

        <RestaurantForm
          initialData={restaurant}
          onSubmit={handleSubmit}
          isLoading={isPending}
          submitLabel="Save Changes"
        />
      </ScrollView>
    </View>
  );
}
