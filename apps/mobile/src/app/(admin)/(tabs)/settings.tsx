import React from 'react';
import { View, Text, ScrollView } from 'react-native';
export default function AdminSettingsTab() {
  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-black">Settings</Text>
      <Text className="text-gray-500 mt-2">Admin settings</Text>
    </ScrollView>
  );
}
