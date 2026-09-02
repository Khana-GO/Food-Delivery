import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function CheckoutSuccessScreen() {
  const params = useLocalSearchParams<{ orderId?: string; id?: string }>();
  const orderId = params.orderId ?? params.id;

  const handleViewOrder = useCallback(() => {
    if (orderId) router.replace(`/(customer)/order/${orderId}` as any);
    else router.replace('/(customer)/(tabs)/orders' as any);
  }, [orderId]);

  const handleGoHome = useCallback(() => {
    router.replace('/(customer)/(tabs)' as any);
  }, []);

  const handleTrackOrder = useCallback(() => {
    if (orderId) router.replace(`/(customer)/order-tracking/${orderId}` as any);
    else router.replace('/(customer)/(tabs)/orders' as any);
  }, [orderId]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="items-center justify-center flex-1 px-8">
        <View className="items-center justify-center mb-6 border border-green-100 rounded-full w-28 h-28 bg-green-50">
          <Feather name="check-circle" size={64} color="#22C55E" />
        </View>

        <Text className="text-2xl font-bold text-center text-black">Payment Successful!</Text>
        <Text className="mt-2 text-base leading-6 text-center text-gray-500">
          Your order has been placed successfully. You will receive a confirmation shortly.
        </Text>

        {orderId ? (
          <View className="px-4 py-3 mt-6 border border-gray-100 bg-gray-50 rounded-xl">
            <Text className="text-xs text-center text-gray-500">Order ID</Text>
            <Text className="mt-1 font-mono text-sm font-bold text-center text-black">{orderId}</Text>
          </View>
        ) : null}

        <View className="w-full gap-3 mt-8">
          <TouchableOpacity onPress={handleTrackOrder} className="items-center py-4 bg-primary rounded-xl">
            <Text className="text-base font-bold text-white">Track Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleViewOrder}
            className="items-center py-4 bg-white border border-gray-200 rounded-xl"
          >
            <Text className="text-base font-semibold text-black">View Order Details</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleGoHome} className="items-center py-3">
            <Text className="font-medium text-gray-500">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
