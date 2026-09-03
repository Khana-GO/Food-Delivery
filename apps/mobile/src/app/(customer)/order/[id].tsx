import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { useOrder } from '@/hooks/customer/useOrder';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading || !order) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#E23744" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* ─── Header ─── */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Feather name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black">Order #{order.id.slice(0, 8)}</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2 rounded-lg bg-primary"
            onPress={() => router.push(`/(customer)/order-tracking/${order.id}` as any)}
          >
            <Feather name="map-pin" size={16} color="#FFF" />
            <Text className="text-sm font-semibold text-white">Track</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Rest of the order details */}
        <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
          <Text className="mb-2 text-sm font-bold text-black">Order Status</Text>
          <OrderStatusBadge status={order.orderStatus} />
          <Text className="mt-2 text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleString()}
          </Text>
        </View>

        {/* ... Rest of order details ... */}
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.push(`/(customer)/chatbot?orderId=${order.id}` as any)}
        activeOpacity={0.9}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginHorizontal: 16,
          marginVertical: 16,
          paddingVertical: 14,
          borderRadius: 9999,
          backgroundColor: '#FDECEE',
          borderWidth: 1,
          borderColor: '#FECACA',
        }}
      >
        <Feather name="message-circle" size={18} color="#B5122A" />
        <Text style={{ fontWeight: '700', color: '#B5122A', fontSize: 14 }}>Ask AI about this order</Text>
      </TouchableOpacity>
    </View>
  );
}