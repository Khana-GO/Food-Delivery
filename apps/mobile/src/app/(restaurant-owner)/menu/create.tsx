import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { MenuItemForm } from '@/components/res-owner/menu-item/MenuItemForm';
import type { MenuItemFormValues } from '@/components/res-owner/menu-item/MenuItemForm';
import { useCreateMenuItem } from '@/hooks/owner/menu-item/useCreateMenuItem';
import { useMyRestaurants } from '@/hooks/owner/restaurant/useRestaurants';

export default function CreateMenuItemScreen() {
  const { restaurantId: restaurantIdParam } = useLocalSearchParams<{
    restaurantId?: string;
  }>();
  const { mutate: createMenuItem, isPending } = useCreateMenuItem();

  // All of the owner's restaurants — user must choose which restaurant the item belongs to
  const { data: restaurants, isLoading: restaurantsLoading } = useMyRestaurants();

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | undefined
  >(restaurantIdParam ?? undefined);

  // Auto-select first restaurant as default, and keep selection valid if params no longer resolve
  useEffect(() => {
    if (!selectedRestaurantId && restaurants && restaurants.length > 0) {
      setSelectedRestaurantId(restaurants[0].id);
    }
    if (
      selectedRestaurantId &&
      restaurants &&
      !restaurants.some((r) => r.id === selectedRestaurantId)
    ) {
      setSelectedRestaurantId(restaurants[0]?.id);
    }
  }, [restaurants, selectedRestaurantId]);

  const restaurantId = selectedRestaurantId;

  const handleSubmit = (
    values: MenuItemFormValues,
    image?: ImagePicker.ImagePickerAsset,
  ) => {
    if (!restaurantId) {
      // Prevent creating without explicit restaurant — ensures restaurantId is always stored
      return;
    }
    createMenuItem({
      ...values,
      image,
      restaurantId,
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Add Menu Item</Text>
        </View>
      </View>

      {/* Restaurant selector — always shown so menu is created for a specific restaurant */}
      <View className="px-4 pt-4">
        <Text className="mb-2 text-sm font-semibold text-black">
          Restaurant <Text className="text-red-500">*</Text>
        </Text>
        {restaurantsLoading ? (
          <View className="py-2">
            <Text className="text-sm text-gray-400">Loading restaurants…</Text>
          </View>
        ) : !restaurants || restaurants.length === 0 ? (
          <View className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <Text className="text-sm font-medium text-amber-700">No restaurant found</Text>
            <Text className="mt-1 text-xs text-amber-600">Create a restaurant first before adding menu items.</Text>
            <TouchableOpacity
              className="px-4 py-2 mt-3 bg-primary rounded-lg self-start"
              onPress={() => router.push('/(restaurant-owner)/restaurant/create' as never)}
            >
              <Text className="text-xs font-semibold text-white">+ Create Restaurant</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {restaurants.map((r) => {
              const isActive = restaurantId === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  className={`flex-row items-center px-4 py-2 border rounded-full ${
                    isActive
                      ? 'bg-primary border-primary'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => setSelectedRestaurantId(r.id)}
                >
                  <Feather
                    name="shopping-bag"
                    size={14}
                    color={isActive ? '#FFF' : '#64748B'}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-medium ${
                      isActive ? 'text-white' : 'text-gray-600'
                    }`}
                    numberOfLines={1}
                  >
                    {r.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
        {!restaurantId && restaurants && restaurants.length > 0 && (
          <Text className="mt-2 text-xs text-red-500">Please select a restaurant</Text>
        )}
      </View>

      <MenuItemForm
        restaurantId={restaurantId}
        onSubmit={handleSubmit}
        isLoading={isPending}
        submitLabel="Add Menu Item"
      />
    </View>
  );
}
