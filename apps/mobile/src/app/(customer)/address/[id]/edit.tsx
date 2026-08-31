import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AddressForm } from '@/components/customer/AddressForm';
import { useAddress } from '@/hooks/customer/useAddress';
import { useUpdateAddress } from '@/hooks/customer/useUpdateAddress';

export default function EditAddressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: address, isLoading } = useAddress(id);
  const { mutate: updateAddress, isPending } = useUpdateAddress();

  if (isLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  if (!address) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-white">
        <Feather name="map-pin" size={64} color="#D1D5DB" />
        <Text className="mt-4 text-lg font-medium text-gray-400">Address Not Found</Text>
        <TouchableOpacity className="px-6 py-3 mt-6 bg-primary rounded-xl" onPress={() => router.back()}>
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Edit Address</Text>
        </View>
      </View>
      <AddressForm
        initialData={address}
        onSubmit={(data) => updateAddress({ id, data })}
        isLoading={isPending}
        submitLabel="Update Address"
      />
    </View>
  );
}