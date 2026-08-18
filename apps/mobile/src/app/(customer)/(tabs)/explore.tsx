import React from 'react';
import { View, Text } from 'react-native';

export default function Explore() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-black">Explore</Text>
      <Text className="text-gray-500 mt-2">Discover new restaurants</Text>
    </View>
  );
}