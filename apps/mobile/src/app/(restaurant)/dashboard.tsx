import React from 'react';
import { View, Text } from 'react-native';

export default function RestaurantDashboard() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-black">Restaurant Dashboard</Text>
      <Text className="text-gray-500 mt-2">Welcome to your restaurant dashboard</Text>
    </View>
  );
}