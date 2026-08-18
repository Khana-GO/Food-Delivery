import React from 'react';
import { View, Text } from 'react-native';

export default function ActiveDelivery() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-black">Active Delivery</Text>
      <Text className="text-gray-500 mt-2">Your current active delivery</Text>
    </View>
  );
}