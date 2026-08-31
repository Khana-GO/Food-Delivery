import React from 'react';
import { View, Text } from 'react-native';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmed', color: '#2563EB', bg: '#EFF6FF' },
  PREPARING: { label: 'Preparing', color: '#8B5CF6', bg: '#EDE9FE' },
  READY: { label: 'Ready', color: '#0E9F6E', bg: '#DCFCE7' },
  PICKED_UP: { label: 'Picked Up', color: '#E23744', bg: '#FEE2E2' },
  DELIVERED: { label: 'Delivered', color: '#22C55E', bg: '#DCFCE7' },
  CANCELLED: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2' },
};

export const OrderStatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || statusConfig.PENDING;
  return (
    <View className={`px-3 py-1 rounded-full`} style={{ backgroundColor: config.bg }}>
      <Text className={`text-xs font-medium`} style={{ color: config.color }}>
        {config.label}
      </Text>
    </View>
  );
};