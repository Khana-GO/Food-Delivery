import React from 'react';
import { View } from 'react-native';
import { Text } from '../../components/ui/Text';

export default function RestaurantDashboard() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text variant="h1">Restaurant Dashboard</Text>
      <Text variant="body" className="mt-2 text-center px-6">
        This is a placeholder for the Restaurant dashboard. Phase 5 will build this out.
      </Text>
    </View>
  );
}
