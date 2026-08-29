import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { RestaurantForm } from '@/components/res-owner/restaurant/RestaurantForm';
import { useCreateRestaurant } from '@/hooks/owner/restaurant/useCreateRestaurant';

export default function CreateRestaurantAdminScreen() {
  const { mutate: create, isPending } = useCreateRestaurant();

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-full bg-gray-50 items-center justify-center">
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text className="text-[18px] font-black text-[#0F172A]">Create Restaurant</Text>
          <Text className="text-xs text-gray-500">Admin • New venue</Text>
        </View>
      </View>

      <RestaurantForm
        onSubmit={(data) => {
          // @ts-ignore admin can create via same hook (ownerId inferred from auth if ADMIN bypass missing, but keep hook)
          create(data as any, {
            onError: (e: any) => {
              const msg = e?.response?.data?.message || 'Failed to create restaurant';
              Alert.alert('Error', Array.isArray(msg) ? msg.join(', ') : msg);
            },
            onSuccess: () => {
              Alert.alert('Success', 'Restaurant created');
              router.back();
            },
          });
        }}
        isLoading={isPending}
        submitLabel="Create Restaurant"
      />
    </View>
  );
}
