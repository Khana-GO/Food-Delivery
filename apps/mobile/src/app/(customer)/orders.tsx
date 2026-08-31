import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useOrders } from '@/hooks/customer/useOrders';
import { OrderCard } from '@/components/order/OrderCard';
import { useOrderStore } from '@/stores/customer/orderStore';

export default function OrdersScreen() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const { data, isLoading, refetch } = useOrders({ status: statusFilter, page: 1, limit: 20 });
  const { orders } = useOrderStore();

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED'];

  const filteredOrders = statusFilter && statusFilter !== 'ALL' ? orders.filter(o => o.orderStatus === statusFilter) : orders;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold text-black">My Orders</Text>
      </View>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3" contentContainerStyle={{ paddingHorizontal: 0 }}>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status}
            className={`px-4 py-2 rounded-full mr-2 ${(statusFilter === status || (status === 'ALL' && !statusFilter)) ? 'bg-primary' : 'bg-gray-200'}`}
            onPress={() => setStatusFilter(status === 'ALL' ? undefined : status)}
          >
            <Text className={`text-xs font-medium ${(statusFilter === status || (status === 'ALL' && !statusFilter)) ? 'text-white' : 'text-gray-600'}`}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#E23744" className="py-20" />
        ) : filteredOrders.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Feather name="shopping-bag" size={64} color="#D1D5DB" />
            <Text className="mt-4 text-lg font-medium text-gray-400">No Orders Yet</Text>
            <Text className="mt-1 text-sm text-gray-400">Start ordering your favourite food!</Text>
            <TouchableOpacity className="px-6 py-3 mt-6 bg-primary rounded-xl" onPress={() => router.push('/(customer)/(tabs)')}>
              <Text className="font-semibold text-white">Explore Restaurants</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
        <View className="h-4" />
      </ScrollView>
    </View>
  );
}