import React from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAvailableOrders } from '@/hooks/driver/useAvailableOrders';
import { useAcceptDelivery } from '@/hooks/driver/useAcceptDelivery';
import { DeliveryCard } from '@/components/driver/DeliveryCard';
import { useDriverStore } from '@/stores/driver/driverStore';

export default function AvailableOrdersScreen() {
  const { data: orders, isLoading, refetch } = useAvailableOrders();
  const { mutate: acceptDelivery, isPending } = useAcceptDelivery();
  const { availableOrders } = useDriverStore();

  const displayOrders = orders || availableOrders;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold text-black">Available Orders</Text>
        <Text className="text-sm text-gray-500">
          {displayOrders?.length || 0} orders ready for pickup
        </Text>
      </View>

      <FlatList
        data={displayOrders}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <DeliveryCard
            order={item}
            onAccept={() => acceptDelivery(item.id)}
            isAccepting={isPending}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Feather name="truck" size={64} color="#D1D5DB" />
            <Text className="mt-4 text-lg font-medium text-gray-400">No Available Orders</Text>
            <Text className="mt-1 text-sm text-gray-400">Check back later for deliveries</Text>
          </View>
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}