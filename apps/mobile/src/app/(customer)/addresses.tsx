import React from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAddresses } from '@/hooks/customer/useAddresses';
import { useAddressStore } from '@/stores/customer/addressStore';
import { AddressCard } from '@/components/customer/AddressCard';
import { useDeleteAddress } from '@/hooks/customer/useDeleteAddress';

export default function AddressesScreen() {
  const { isLoading, refetch } = useAddresses();
  const { addresses } = useAddressStore();
  const { mutate: deleteAddress } = useDeleteAddress();

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAddress(id) },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Feather name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black">Addresses</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2 rounded-lg bg-primary"
            onPress={() => router.push('/(customer)/address/create' as any)}
          >
            <Feather name="plus" size={18} color="#FFF" />
            <Text className="text-sm font-semibold text-white">Add New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={addresses}
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            onEdit={(id) => router.push(`/(customer)/address/${id}/edit` as any)}
            onDelete={handleDelete}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Feather name="map-pin" size={64} color="#D1D5DB" />
            <Text className="mt-4 text-lg font-medium text-gray-400">No Addresses</Text>
            <Text className="mt-1 text-sm text-gray-400">Add your first delivery address</Text>
            <TouchableOpacity className="px-6 py-3 mt-6 bg-primary rounded-xl" onPress={() => router.push('/(customer)/address/create' as any)}>
              <Text className="font-semibold text-white">Add Address</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}