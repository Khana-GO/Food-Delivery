import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAdminRestaurant } from '@/hooks/admin/useAdminRestaurant';
import { useToggleVerification } from '@/hooks/admin/useToggleVerification';
import { useToggleActive } from '@/hooks/admin/useToggleActive';
import { useSoftDeleteRestaurant } from '@/hooks/admin/useSoftDeleteRestaurant';
import { useRestoreRestaurant } from '@/hooks/admin/useRestoreRestaurant';
import { useHardDeleteRestaurant } from '@/hooks/admin/useHardDeleteRestaurant';
import { useToggleOpen } from '@/hooks/admin/useToggleOpen';
import { RestaurantDetails } from '@/components/admin/restaurants/RestaurantDetails';

export default function RestaurantDetailsScreenLegacy() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: restaurant, isLoading } = useAdminRestaurant(id as string);
  const { mutate: toggleVerification, isPending: isVerifying } = useToggleVerification();
  const { mutate: toggleActive, isPending: isTogglingActive } = useToggleActive();
  const { mutate: toggleOpen, isPending: isTogglingOpen } = useToggleOpen();
  const { mutate: deleteRestaurant, isPending: isDeleting } = useSoftDeleteRestaurant();
  const { mutate: restoreRestaurant, isPending: isRestoring } = useRestoreRestaurant();
  const { mutate: hardDelete, isPending: isHardDeleting } = useHardDeleteRestaurant();

  const isPending = isVerifying || isTogglingActive || isTogglingOpen || isDeleting || isRestoring || isHardDeleting;

  const handleDelete = () => {
    Alert.alert('Delete Restaurant', 'Soft delete this restaurant?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRestaurant(id as string) },
    ]);
  };
  const handleRestore = () => {
    Alert.alert('Restore Restaurant', 'Restore this restaurant?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restore', onPress: () => restoreRestaurant(id as string) },
    ]);
  };
  const handleHardDelete = () => {
    Alert.alert('Permanently Delete', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => hardDelete(id as string) },
    ]);
  };

  if (isLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }
  if (!restaurant) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-white">
        <Feather name="store" size={64} color="#D1D5DB" />
        <Text className="mt-4 text-lg font-medium text-gray-400">Restaurant Not Found</Text>
        <TouchableOpacity className="px-6 py-3 mt-6 bg-[#0F172A] rounded-xl" onPress={() => router.back()}>
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View className="flex-1 bg-[#F8F9FB]">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-full bg-gray-50 items-center justify-center">
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-[18px] font-black text-[#0F172A]">Restaurant</Text>
      </View>
      <RestaurantDetails
        restaurant={restaurant}
        onToggleVerification={() => toggleVerification(id as string)}
        onToggleActive={() => toggleActive(id as string)}
        onToggleOpen={() => toggleOpen(id as string)}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onHardDelete={handleHardDelete}
        isPending={isPending}
      />
    </View>
  );
}
