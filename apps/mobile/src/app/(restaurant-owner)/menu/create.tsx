import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { MenuItemForm } from '@/components/menu-item/MenuItemForm';
import type { MenuItemFormValues } from '@/components/menu-item/MenuItemForm';
import { useCreateMenuItem } from '@/hooks/menu-item/useCreateMenuItem';
import { useMyRestaurants } from '@/hooks/restaurant/useRestaurants';

export default function CreateMenuItemScreen() {
  const { restaurantId: restaurantIdParam } = useLocalSearchParams<{
    restaurantId?: string;
  }>();
  const { mutate: createMenuItem, isPending } = useCreateMenuItem();

  // All of the owner's restaurants so they can pick the target here too
  const { data: restaurants } = useMyRestaurants();
  const hasMultipleRestaurants = (restaurants?.length ?? 0) > 1;

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | undefined
  >(restaurantIdParam);

  // Keep selection valid if it came from params that no longer resolve
  useEffect(() => {
    if (
      selectedRestaurantId &&
      restaurants &&
      !restaurants.some((r) => r.id === selectedRestaurantId)
    ) {
      setSelectedRestaurantId(undefined);
    }
  }, [restaurants, selectedRestaurantId]);

  const restaurantId = selectedRestaurantId ?? restaurants?.[0]?.id;

  const handleSubmit = (
    values: MenuItemFormValues,
    image?: ImagePicker.ImagePickerAsset,
  ) => {
    createMenuItem({
      ...values,
      image,
      ...(restaurantId ? { restaurantId } : {}),
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

      {/* Restaurant selector — only when owner has multiple restaurants */}
      {hasMultipleRestaurants && (
        <View className="px-4 pt-4">
          <Text className="mb-2 text-sm font-semibold text-black">
            Restaurant
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {restaurants!.map((r) => {
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
        </View>
      )}

      <MenuItemForm
        restaurantId={restaurantId}
        onSubmit={handleSubmit}
        isLoading={isPending}
        submitLabel="Add Menu Item"
      />
    </View>
  );
}
