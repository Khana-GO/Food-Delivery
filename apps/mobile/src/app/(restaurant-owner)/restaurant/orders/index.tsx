import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRestaurantOrders } from '@/hooks/owner/orders/useRestaurantOrders';
import { useOrderNotifications } from '@/hooks/owner/orders/useOrderNotifications';
import { OrderCard } from '@/components/order/OrderCard';
import { useOrderStore } from '@/stores/customer/orderStore';
import { router } from 'expo-router';

const statusTabs = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED'];

export default function RestaurantOrdersScreen() {
  const [activeStatus, setActiveStatus] = useState<string | undefined>();
  const { data, isLoading, refetch } = useRestaurantOrders(activeStatus);
  const { orders } = useOrderStore();
  useOrderNotifications(); // Start listening for new orders

  const filteredOrders = activeStatus && activeStatus !== 'ALL'
    ? orders.filter(o => o.orderStatus === activeStatus)
    : orders;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold text-black">Orders</Text>
        <Text className="text-sm text-gray-500">{orders.length} orders</Text>
      </View>

      {/* Status Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
        {statusTabs.map((status) => (
          <TouchableOpacity
            key={status}
            className={`px-4 py-2 rounded-full mr-2 ${(activeStatus === status || (status === 'ALL' && !activeStatus)) ? 'bg-primary' : 'bg-gray-200'}`}
            onPress={() => setActiveStatus(status === 'ALL' ? undefined : status)}
          >
            <Text className={`text-xs font-medium ${(activeStatus === status || (status === 'ALL' && !activeStatus)) ? 'text-white' : 'text-gray-600'}`}>
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
            <Text className="mt-4 text-lg font-medium text-gray-400">No Orders</Text>
            <Text className="mt-1 text-sm text-gray-400">Orders will appear here</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => router.push(`/(restaurant-owner)/restaurant/orders/${order.id}` as any)}
            />
          ))
        )}
        <View className="h-4" />
      </ScrollView>
    </View>
  );
}