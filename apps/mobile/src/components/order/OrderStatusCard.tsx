import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface OrderStatusCardProps {
  status: string;
  deliveryAddress: string;
  totalAmount: number;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ComponentProps<typeof Feather>['name'] }> = {
  PENDING: { label: 'Order Placed', color: '#F59E0B', bg: '#FEF3C7', icon: 'clock' },
  CONFIRMED: { label: 'Confirmed', color: '#2563EB', bg: '#EFF6FF', icon: 'check-circle' },
  PREPARING: { label: 'Preparing', color: '#8B5CF6', bg: '#EDE9FE', icon: 'cooking' },
  READY: { label: 'Ready', color: '#0E9F6E', bg: '#DCFCE7', icon: 'package' },
  PICKED_UP: { label: 'Picked Up', color: '#E23744', bg: '#FEE2E2', icon: 'truck' },
  DELIVERED: { label: 'Delivered!', color: '#22C55E', bg: '#DCFCE7', icon: 'check' },
  CANCELLED: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2', icon: 'x-circle' },
};

export const OrderStatusCard = ({ status, deliveryAddress, totalAmount, createdAt }: OrderStatusCardProps) => {
  const config = statusConfig[status] || statusConfig.PENDING;
  const formattedDate = new Date(createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: config.bg }}>
            <Feather name={config.icon} size={18} color={config.color} />
          </View>
          <View>
            <Text className="text-sm font-bold text-black">{config.label}</Text>
            <Text className="text-xs text-gray-400">{formattedDate}</Text>
          </View>
        </View>
        <Text className="text-sm font-bold text-primary">Rs. {totalAmount}</Text>
      </View>
      <View className="flex-row items-center gap-2 pt-3 mt-3 border-t border-gray-50">
        <Feather name="map-pin" size={14} color="#94A3B8" />
        <Text className="flex-1 text-xs text-gray-500" numberOfLines={1}>
          {deliveryAddress}
        </Text>
      </View>
    </View>
  );
};