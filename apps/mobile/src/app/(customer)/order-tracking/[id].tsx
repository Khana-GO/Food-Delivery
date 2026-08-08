import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function OrderTracking() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-black">Track Order</Text>
      <Text className="text-gray-500 mt-2">Tracking Order: {id}</Text>
    </View>
  );
}