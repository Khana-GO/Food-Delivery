import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Order } from '@food_delivery/types';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import PremiumCard from '@/components/ui/PremiumCard';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface AdminOrderCardProps {
  order: Order;
  onPress?: () => void;
}

export const AdminOrderCard = ({ order, onPress }: AdminOrderCardProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <PremiumCard
      pressable
      onPress={onPress || (() => router.push(`/(admin)/order/${order.id}` as any))}
      elevation="sm"
      padding={14}
      style={{ marginBottom: 12 } as any}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-bold text-black">Order #{order.id.slice(0, 8).toUpperCase()}</Text>
          <Text className="text-xs text-gray-500">{order.restaurantName}</Text>
        </View>
        <OrderStatusBadge status={order.orderStatus} />
      </View>

      <View className="flex-row items-center justify-between mt-2">
        <View>
          <Text className="text-xs text-gray-500">Customer</Text>
          <Text className="text-sm font-medium text-black">{order.customerName}</Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-500">Total</Text>
          <Text className="text-sm font-bold text-primary">Rs. {order.totalAmount}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 pt-2 mt-2 border-t border-gray-50">
        <Feather name="clock" size={12} color="#94A3B8" />
        <Text className="text-xs text-gray-400">{formatDate(order.createdAt)}</Text>
        {order.driverId && (
          <>
            <Feather name="truck" size={12} color="#94A3B8" />
            <Text className="text-xs text-gray-400">Driver assigned</Text>
          </>
        )}
      </View>
    </PremiumCard>
  );
};