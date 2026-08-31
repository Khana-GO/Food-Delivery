import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { OrderStatusBadge } from './OrderStatusBadge';
import { router } from 'expo-router';
import { Order } from '@food_delivery/types';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
}

export const OrderCard = ({ order, onPress }: OrderCardProps) => {
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity
      className="p-4 mb-3 bg-white border border-gray-100 shadow-sm rounded-xl"
      onPress={onPress ? onPress : () => router.push(`/(customer)/order/${order.id}` as any)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-bold text-black">Order #{order.id.slice(0, 8).toUpperCase()}</Text>
          <Text className="text-xs text-gray-500">{order.restaurantName}</Text>
        </View>
        <OrderStatusBadge status={order.orderStatus} />
      </View>

      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-sm text-gray-600">{order.items.length} items</Text>
        <Text className="text-sm font-bold text-primary">Rs. {order.totalAmount}</Text>
      </View>

      <View className="flex-row items-center gap-2 pt-2 mt-2 border-t border-gray-50">
        <Feather name="clock" size={12} color="#94A3B8" />
        <Text className="text-xs text-gray-400">{formatDate(order.createdAt)}</Text>
        {order.estimatedDeliveryTime && (
          <>
            <Feather name="truck" size={12} color="#94A3B8" />
            <Text className="text-xs text-gray-400">
              Est: {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};