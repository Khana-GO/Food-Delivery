import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function AdminIndex() {
  useEffect(() => {
    router.replace('/(admin)/dashboard');
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#E23744" />
    </View>
  );
}