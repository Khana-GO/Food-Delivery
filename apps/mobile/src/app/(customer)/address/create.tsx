import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AddressForm } from '@/components/customer/AddressForm';
import { useCreateAddress } from '@/hooks/customer/useCreateAddress';

export default function CreateAddressScreen() {
  const { mutate: createAddress, isPending } = useCreateAddress();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Feather name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Add Address</Text>
        </View>
      </View>
      <AddressForm onSubmit={createAddress} isLoading={isPending} submitLabel="Save Address" />
    </View>
  );
}