import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { useAddresses, useDeleteAddress } from '@/api/address';

export default function AddressesScreen() {
  const { data: addresses, isLoading, isError } = useAddresses();
  const { mutate: deleteAddress } = useDeleteAddress();

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3">
          <Text className="text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-extrabold text-slate-800 flex-1">My Addresses</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        {isError ? (
           <View className="items-center justify-center py-10">
             <Text className="text-red-500 font-bold">Failed to load addresses.</Text>
           </View>
        ) : addresses?.length === 0 ? (
          <View className="items-center justify-center py-10">
            <Text className="text-4xl mb-4">📍</Text>
            <Text className="text-lg font-bold text-slate-800 mb-2">No Addresses Found</Text>
            <Text className="text-sm text-slate-500 mb-6 text-center">Add a delivery address to checkout faster.</Text>
          </View>
        ) : (
          <View className="gap-4">
            {addresses?.map((address: any) => (
              <View key={address.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xl">🗺️</Text>
                    <Text className="text-base font-bold text-slate-800">{address.city}</Text>
                    {address.isDefault && (
                      <View className="bg-primary/10 px-2 py-0.5 rounded-md">
                        <Text className="text-primary text-[10px] font-bold">Default</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity 
                    className="w-8 h-8 rounded-full bg-red-50 items-center justify-center"
                    onPress={() => deleteAddress(address.id)}
                  >
                    <Text className="text-red-500 text-xs">🗑️</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-sm text-slate-500 leading-5">{address.fullAddress}</Text>
                <Text className="text-sm text-slate-500 leading-5">{address.state}, {address.country} {address.postalCode}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity 
          className="mt-6 bg-primary p-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-md shadow-primary/30"
          onPress={() => {
            // open add address modal or navigate
            alert('Add address flow coming soon');
          }}
        >
          <Text className="text-white text-lg font-bold">+</Text>
          <Text className="text-white text-base font-bold">Add New Address</Text>
        </TouchableOpacity>
        
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
