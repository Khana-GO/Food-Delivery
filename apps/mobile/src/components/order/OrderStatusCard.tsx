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
  CONFIRMED: { label: 'Confirmed', color: '#FFFFFF', bg: '#B5122A', icon: 'check-circle' },
  PREPARING: { label: 'Preparing', color: '#8B5CF6', bg: '#EDE9FE', icon: 'loader' },
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
  const isConfirmed = status === 'CONFIRMED';

  return (
    <View className="p-4 mb-4 bg-white border border-gray-100 rounded-xl">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: config.bg, borderWidth: isConfirmed ? 1 : 0, borderColor: isConfirmed ? '#7F0D1D' : 'transparent' }}>
            <Feather name={config.icon} size={18} color={config.color} />
          </View>
          <View>
            {isConfirmed ? (
              <View style={{ backgroundColor: '#B5122A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: '#7F0D1D' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>CONFIRMED</Text>
              </View>
            ) : (
              <Text className="text-sm font-bold text-black">{config.label}</Text>
            )}
            <Text className="text-xs text-gray-400" style={{ marginTop: isConfirmed ? 4 : 0 }}>{formattedDate}</Text>
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