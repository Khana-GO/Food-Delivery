import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/res-owner/owner/kit';
import { CategoryForm } from '@/components/res-owner/category/CategoryForm';
import { useCreateCategory } from '@/hooks/owner/category/useCreateCategory';
import { useMyRestaurants } from '@/hooks/owner/restaurant/useRestaurants';
import { router, useLocalSearchParams } from 'expo-router';

export default function CreateCategoryScreen() {
  const { mutateAsync: createCategory, isPending } = useCreateCategory();
  const { restaurantId: restaurantIdParam } = useLocalSearchParams<{ restaurantId?: string }>();
  const { data: restaurants, isLoading: restaurantsLoading } = useMyRestaurants();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | undefined>(
    restaurantIdParam ?? undefined,
  );

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

  const handleSubmit = async ({ name }: { name: string }) => {
    if (!selectedRestaurantId) {
      Alert.alert('Select restaurant', 'Please select a restaurant to create the category for.');
      return;
    }
    try {
      await createCategory({ name, restaurantId: selectedRestaurantId });
    } catch {
      // Errors surface through the store/alerts; keep the user on the form.
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="New Category"
        subtitle="Group related menu items together"
      />

      {/* Restaurant selector — always shown so category is created for correct restaurant */}
      <View className="px-6 pt-4">
        <Text className="mb-2 text-sm font-semibold text-black">
          Restaurant <Text className="text-red-500">*</Text>
        </Text>
        {restaurantsLoading ? (
          <Text className="text-sm text-gray-400">Loading restaurants…</Text>
        ) : !restaurants || restaurants.length === 0 ? (
          <View className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <Text className="text-sm font-medium text-amber-700">No restaurant found</Text>
            <Text className="mt-1 text-xs text-amber-600">Create a restaurant first before adding categories.</Text>
            <TouchableOpacity
              className="px-4 py-2 mt-3 bg-green-600 rounded-lg self-start"
              onPress={() => router.push('/(restaurant-owner)/restaurant/create' as never)}
            >
              <Text className="text-xs font-semibold text-white">+ Create Restaurant</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {restaurants.map((r) => {
              const isActive = selectedRestaurantId === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  className={`flex-row items-center px-4 py-2 border rounded-full ${isActive ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                  onPress={() => setSelectedRestaurantId(r.id)}
                >
                  <Feather name="shopping-bag" size={14} color={isActive ? '#FFF' : '#64748B'} />
                  <Text className={`ml-1.5 text-xs font-medium ${isActive ? 'text-white' : 'text-gray-600'}`} numberOfLines={1}>
                    {r.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
        {!selectedRestaurantId && restaurants && restaurants.length > 0 && (
          <Text className="mt-2 text-xs text-red-500">Please select a restaurant</Text>
        )}
      </View>

      <CategoryForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        submitLabel="Create Category"
      />

      <View className="px-6 pb-6">
        <View className="flex-row items-start rounded-2xl border border-green-200 bg-green-50 p-4">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
            <Feather name="info" size={16} color="#16A34A" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-green-800">Keep it simple</Text>
            <Text className="mt-0.5 text-xs leading-4 text-green-700">
              Use short, familiar names like “Starters”, “Mains” or “Beverages”
              so customers can scan your menu quickly.
            </Text>
          </View>
          <Pressable hitSlop={8} className="p-0.5">
            <Feather name="x" size={15} color="#16A34A" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
