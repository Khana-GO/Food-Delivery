import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import PremiumCard from '@/components/ui/PremiumCard';
import { Colors, Shadow } from '@/constants/theme';

interface OrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemsCount: number;
}

export const OrderSummary = ({ subtotal, deliveryFee, total, itemsCount }: OrderSummaryProps) => {
  return (
    <PremiumCard elevation="sm" padding={16} style={{ borderColor: Colors.borderLight }}>
      <View className="flex-row items-center gap-2 mb-3">
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="file-text" size={14} color={Colors.primary} />
        </View>
        <Text className="text-sm font-bold text-black">Order Summary</Text>
      </View>
      <Text className="mb-3 text-sm font-bold text-black">Order Summary</Text>
      <View className="flex-row justify-between py-2 border-b border-gray-50">
        <Text className="text-sm text-gray-600">Items ({itemsCount})</Text>
        <Text className="text-sm font-medium text-black">Rs. {subtotal}</Text>
      </View>
      <View className="flex-row justify-between py-2 border-b border-gray-50">
        <Text className="text-sm text-gray-600">Delivery Fee</Text>
        <Text className="text-sm font-medium text-black">Rs. {deliveryFee}</Text>
      </View>
      <View className="flex-row justify-between py-2 mt-1">
        <Text className="text-base font-bold text-black">Total</Text>
        <Text className="text-base font-bold text-primary">Rs. {total}</Text>
      </View>
    </PremiumCard>
  );
};