import React from 'react';
import { View } from 'react-native';
import { Text } from '../../components/ui/Text';

export default function AdminDashboard() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text variant="h1">Admin Dashboard</Text>
      <Text variant="body" className="mt-2 text-center px-6">
        This is a placeholder for the Admin dashboard. Phase 6 will build this out.
      </Text>
    </View>
  );
}
