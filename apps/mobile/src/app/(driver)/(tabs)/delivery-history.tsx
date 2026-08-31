import React from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useDriverOrdersHistory } from '@/hooks/driver/useDriverOrdersHistory';
import { OrderCard } from '@/components/order/OrderCard';

export default function DeliveryHistoryScreen() {
  const { data: orders, isLoading, refetch } = useDriverOrdersHistory(); // fetches all orders assigned to this driver

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold text-black">Delivery History</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        renderItem={({ item }) => <OrderCard order={item} onPress={() => {}} />}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-gray-400">No deliveries yet</Text>
          </View>
        }
      />
    </View>
  );
}