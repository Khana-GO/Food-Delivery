import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useDriverEarnings } from '@/hooks/driver/useDriverEarnings';

export default function EarningsScreen() {
  const { data: earnings, isLoading } = useDriverEarnings();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold text-black">Earnings</Text>
      </View>
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="items-center p-6 mb-4 bg-white border border-gray-100 rounded-xl">
          <Text className="text-sm text-gray-500">Total Earnings</Text>
          <Text className="text-3xl font-bold text-primary">Rs. {earnings?.total || 0}</Text>
        </View>
        <View className="p-4 bg-white border border-gray-100 rounded-xl">
          <Text className="mb-2 text-sm font-bold text-black">Recent Deliveries</Text>
          {/* list of earnings items */}
        </View>
      </ScrollView>
    </View>
  );
}